/**
 * 前端 JS / TS 沙箱 —— 浏览器 Blob Web Worker 真执行
 *
 * - JavaScript：直接交给独立 Worker 线程运行（与主线程隔离，不污染页面全局）
 * - TypeScript：先经 typescript.js（CDN，CSP 白名单内）转译为 JS，再交给 Worker
 * - console.log / console.error / console.warn 输出经 postMessage 回传
 * - 5 秒超时熔断，防止死循环拖垮页面
 */

import type { SandboxResult } from "./pyodideRuntime";

const TS_CDN = "https://cdn.jsdelivr.net/npm/typescript@5.9.3/lib/typescript.min.js";
const EXEC_TIMEOUT_MS = 5000;

declare global {
  interface Window {
    ts?: {
      transpileModule(code: string, opts: { compilerOptions: Record<string, unknown> }): { outputText: string };
    };
  }
}

let tsPromise: Promise<void> | null = null;

/** 确保 TypeScript 编译器已加载（仅 TS 代码需要） */
export function ensureTranspiler(): Promise<void> {
  if (!tsPromise) {
    tsPromise = new Promise((resolve, reject) => {
      if (window.ts) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src = TS_CDN;
      s.onload = () => (window.ts ? resolve() : reject(new Error("TypeScript 编译器加载异常")));
      s.onerror = () => reject(new Error("TypeScript 编译器加载失败（首次需要联网加载一次，此后走浏览器缓存）"));
      document.head.appendChild(s);
    });
  }
  return tsPromise;
}

/** 构造 Worker 内执行的脚本：替换 console 捕获输出，new Function 运行用户代码 */
function buildWorkerScript(): string {
  return `
    self.onmessage = (ev) => {
      const { code, id } = ev.data;
      const logs = [];
      const fmt = (...a) => a.map((x) => {
        if (typeof x === "string") return x;
        try { return JSON.stringify(x); } catch (_) { return String(x); }
      }).join(" ");
      const oldLog = self.console.log.bind(self.console);
      const oldErr = self.console.error.bind(self.console);
      const oldWarn = self.console.warn.bind(self.console);
      self.console.log = (...a) => { logs.push(fmt(...a)); };
      self.console.warn = (...a) => { logs.push("Warn: " + fmt(...a)); };
      self.console.error = (...a) => { logs.push(fmt(...a)); };
      try {
        const fn = new Function(code);
        const ret = fn();
        if (ret !== undefined && logs.length === 0) {
          logs.push(String(ret));
        }
        self.postMessage({ id, ok: true, output: logs.join("\\n") });
      } catch (err) {
        const msg = err && err.message ? String(err.message) : String(err);
        self.postMessage({ id, ok: false, output: logs.concat(["Uncaught " + msg]).join("\\n") });
      }
      void oldLog; void oldErr; void oldWarn;
    };
  `;
}

/** 执行 JS/TS 代码，超时熔断 */
export async function runJavaScript(code: string, language?: string): Promise<SandboxResult> {
  const clean = (code || "").trim();
  if (!clean) {
    return {
      status: "empty",
      output: "⚠️ [执行拦截]: 编辑器内没有检测到可执行的代码语句。",
      executionTimeMs: 0,
    };
  }

  const start = performance.now();
  let jsCode = clean;

  try {
    if (language === "typescript" || language === "ts") {
      try {
        await ensureTranspiler();
        jsCode = window.ts!.transpileModule(clean, {
          compilerOptions: { target: "ES2022", module: "ESNext", strict: true },
        }).outputText;
      } catch (e: any) {
        return {
          status: "error",
          output: `[TypeScript 转译失败]: ${e?.message || "无法加载编译器"}`,
          executionTimeMs: Math.round(performance.now() - start),
        };
      }
    }

    const blob = new Blob([buildWorkerScript()], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const result = await new Promise<{ ok: boolean; output: string }>((resolve) => {
      const timer = setTimeout(() => {
        worker.terminate();
        resolve({
          ok: false,
          output: "⏱️ [执行超时熔断]: 运行超过 5 秒！可能触发了死循环或无限递归。\n请检查循环退出条件（如 while 或 for）。",
        });
      }, EXEC_TIMEOUT_MS);

      worker.onmessage = (ev: MessageEvent) => {
        clearTimeout(timer);
        resolve(ev.data);
      };
      worker.onerror = (ev: ErrorEvent) => {
        clearTimeout(timer);
        resolve({ ok: false, output: "Worker 执行错误: " + (ev.message || "未知") });
      };
      worker.postMessage({ code: jsCode, id });
    });

    worker.terminate();
    URL.revokeObjectURL(workerUrl);

    const duration = Math.round(performance.now() - start);
    if (!result.ok) {
      return { status: "error", output: result.output, executionTimeMs: duration };
    }
    return {
      status: "success",
      output: result.output || ">>> [执行完毕]: Node.js 执行完毕 (exit code 0)，无 console.log 输出。",
      executionTimeMs: duration,
    };
  } catch (e: any) {
    return {
      status: "error",
      output: `Runtime Error: ${e?.message || e}`,
      executionTimeMs: Math.round(performance.now() - start),
    };
  }
}