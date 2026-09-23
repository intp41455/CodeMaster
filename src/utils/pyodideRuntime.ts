/**
 * 前端 Python 沙箱 —— Pyodide（CPython 编译为 WebAssembly）
 *
 * 运行时资产自托管于 /pyodide/（由 npmmirror 的 pyodide npm 包解压而来），
 * 不依赖任何外部 CDN，彻底规避国内镜像 404 问题。
 *
 * 说明：主线程执行。若用户代码触发死循环，页面会卡住（WASM 无法强杀）。
 * 教学场景代码均为短片段，此限制可接受；如需强杀，后续可用 Web Worker + 中断缓冲升级。
 */

let pyodideSingleton: Promise<any> | null = null;

/**
 * Pyodide 静态资源目录：跟随 Vite 的 base 自适应，绝不硬编码根路径。
 *   - 根路径部署（Cloudflare Pages / 本地 / EdgeOne 根）  → "/pyodide/"
 *   - 子路径部署（GitHub Pages /gode/，Actions 设 base=/gode/）→ "/gode/pyodide/"
 * 历史上硬编码 "/pyodide/" 导致子路径部署 404 → "Pyodide 运行时加载失败：/pyodide/pyodide.js"。
 * BASE_URL 保证以 "/" 结尾，直接拼接 "pyodide/"。
 */
const PYODIDE_BASE = import.meta.env.BASE_URL + "pyodide/";

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<any>;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Pyodide 运行时加载失败：${src}`));
    document.head.appendChild(s);
  });
}

/**
 * 确保 Pyodide 已加载（幂等，带加载进度回调）。
 * onProgress(phase, pct) 可用于 UI 展示初始化进度。
 */
export async function ensurePyodide(onProgress?: (phase: string, pct: number) => void): Promise<any> {
  if (!pyodideSingleton) {
    onProgress?.("加载 WASM 运行时", 15);
    pyodideSingleton = (async () => {
      await loadScript(PYODIDE_BASE + "pyodide.js");
      onProgress?.("启动 Python 解释器", 45);
      const py = await window.loadPyodide!({ indexURL: PYODIDE_BASE });
      onProgress?.("就绪", 100);
      return py;
    })();
  }
  return pyodideSingleton;
}

/** 重置单例（一般不需要，供异常恢复用） */
export function resetPyodide(): void {
  pyodideSingleton = null;
}

export interface SandboxResult {
  status: "success" | "error" | "empty";
  output: string;
  executionTimeMs: number;
}

/**
 * 课程代码可能用到的第三方包（wheel 已随站点自托管于 /pyodide/）。
 * 仅在代码中检测到对应 import 时才懒加载，避免每次执行都加载 numpy 等大包。
 */
const OPTIONAL_PACKAGES = [
  "numpy",
  "pandas",
  "matplotlib",
  "pydantic",
  "requests",
  "scipy",
  "scikit-learn",
  "sympy",
];

function detectNeededPackages(code: string): string[] {
  const found: string[] = [];
  for (const pkg of OPTIONAL_PACKAGES) {
    const re = new RegExp(`(^|[\\n\\s;])import\\s+${pkg}([\\s.]|$)|(^|[\\n\\s;])from\\s+${pkg}[\\s.]`);
    if (re.test(code)) found.push(pkg);
  }
  return found;
}

/** 执行 Python 代码，捕获 stdout/stderr，输出契约与后端 sandbox 一致 */
export async function runPython(code: string): Promise<SandboxResult> {
  const clean = (code || "").trim();
  if (!clean) {
    return {
      status: "empty",
      output: "⚠️ [执行拦截]: 编辑器内没有检测到可执行的代码语句。\n请在代码编辑器中编写或完善您的代码后，再点击【运行代码】！",
      executionTimeMs: 0,
    };
  }

  const start = performance.now();
  try {
    const py = await ensurePyodide();

    // 按需加载第三方包（自托管 wheel，本地加载）
    const needed = detectNeededPackages(clean);
    if (needed.length > 0) {
      const loadable = needed.filter((p) => p !== "matplotlib" || true);
      try {
        await py.loadPackage(loadable);
      } catch (pkgErr: any) {
        const pkgMsg = String(pkgErr?.message || pkgErr);
        return {
          status: "error",
          output:
            `⚠️ [第三方包加载失败]: 浏览器沙箱暂未内置 ${needed.join("、")}。\n` +
            `（当前可用第三方包：numpy / pydantic / requests 等已随站点内置；如需其他包请联系站点维护者）\n` +
            `详情：${pkgMsg.slice(0, 180)}`,
          executionTimeMs: Math.round(performance.now() - start),
        };
      }
    }

    let out = "";
    py.setStdout({ batched: (t: string) => { out += t + "\n"; } });
    py.setStderr({ batched: (t: string) => { out += t + "\n"; } });
    await py.runPythonAsync(clean);
    const output = out.trimEnd() || ">>> [执行完毕]: 程序正常运行，无 print 输出。\n💡 提示：若希望在屏幕看到结果，请使用 print(...) 指令输出。";
    return { status: "success", output, executionTimeMs: Math.round(performance.now() - start) };
  } catch (e: any) {
    const msg = (e && (e.message || String(e))) || "未知运行时错误";
    return { status: "error", output: msg, executionTimeMs: Math.round(performance.now() - start) };
  }
}