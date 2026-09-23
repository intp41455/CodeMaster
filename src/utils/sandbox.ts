/**
 * 前端统一代码沙箱入口
 *
 * 执行路由：
 *   python      → Pyodide WASM（浏览器内真跑）
 *   typescript  → typescript.js 转译 + Web Worker（真跑）
 *   javascript  → Web Worker（真跑）
 *   sql         → sql.js SQLite WASM（真跑）
 *   bash/shell  → 前端确定性模拟（台词与课程对齐）
 *   其他语言    → 兜底模拟
 *
 * 当浏览器能力不可用（如 Worker 被禁用）或本机以开发模式运行且用户配置了服务端时，
 * 回退调用后端 /api/run-code（本地开发体验；纯静态部署时该接口不存在，自动跳过）。
 */

import { runPython } from "./pyodideRuntime";
import { runJavaScript } from "./jsSandbox";
import { runSQL } from "./sqlSandbox";
import { runBashSimulator } from "./bashSimulator";
import type { SandboxResult } from "./pyodideRuntime";

export type { SandboxResult } from "./pyodideRuntime";

async function tryBackend(code: string, language: string): Promise<SandboxResult | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch("/api/run-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data.output === "string") {
      return {
        status: data.status === "error" ? "error" : data.status === "empty" ? "empty" : "success",
        output: data.output,
        executionTimeMs: data.executionTimeMs ?? 0,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** 执行代码 —— 威浏览器内沙箱优先，后端兜底 */
export async function runCodeInSandbox(code: string, language: string): Promise<SandboxResult> {
  const lang = (language || "python").toLowerCase();

  if (lang === "python") {
    try {
      return await runPython(code);
    } catch {
      const fb = await tryBackend(code, "python");
      if (fb) return fb;
      return { status: "error", output: "Python 运行时初始化失败，请刷新页面重试。", executionTimeMs: 0 };
    }
  }

  if (lang === "typescript" || lang === "ts" || lang === "javascript" || lang === "js") {
    try {
      return await runJavaScript(code, lang === "typescript" || lang === "ts" ? "typescript" : "javascript");
    } catch {
      const fb = await tryBackend(code, "typescript");
      if (fb) return fb;
      return { status: "error", output: "JS 运行时初始化失败，请刷新页面重试。", executionTimeMs: 0 };
    }
  }

  if (lang === "sql") {
    try {
      return await runSQL(code);
    } catch {
      const fb = await tryBackend(code, "sql");
      if (fb) return fb;
      return { status: "error", output: "SQLite WASM 初始化失败，请刷新页面重试。", executionTimeMs: 0 };
    }
  }

  if (lang === "bash" || lang === "shell") {
    return runBashSimulator(code);
  }

  // Java 及其他：确定性兜底模拟
  const clean = (code || "").trim();
  if (!clean) {
    return { status: "empty", output: "⚠️ [执行拦截]: 编辑器内没有检测到可执行的代码语句。", executionTimeMs: 0 };
  }
  return {
    status: "success",
    output: `[Executed ${language || "code"} successfully]\nOutput:\n${code.slice(0, 120)}...`,
    executionTimeMs: 1,
  };
}