/**
 * 前端 Bash / Shell 运维实训模拟器
 *
 * 由 server.ts 的 /api/run-code bash 分支移植而来，纯前端运行：
 * 按命令关键词回放与课程台词对齐的确定性输出；补全 cd / mkdir / cat 分支，
 * 未知命令落兜底返回「命令执行成功」。
 */

import type { SandboxResult } from "./pyodideRuntime";

export function runBashSimulator(code: string): SandboxResult {
  const clean = (code || "").trim();
  if (!clean) {
    return {
      status: "empty",
      output: "⚠️ [执行拦截]: 请输入要执行的 Linux 命令。",
      executionTimeMs: 0,
    };
  }

  const start = performance.now();
  const lines = clean.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
  const logBuffer: string[] = [];

  for (const raw of lines) {
    const c = raw.trim();

    if (c.startsWith("echo ")) {
      logBuffer.push(c.slice(5).replace(/['"]/g, ""));
    } else if (c.startsWith("cd ")) {
      const target = c.slice(3).replace(/^~\//, "/home/developer/").trim() || "~";
      logBuffer.push(`$ ${c}\n[Shell]: 工作目录已切换 → ${target}`);
    } else if (c.startsWith("mkdir")) {
      const dirs = c.slice(5).trim().replace(/^-p\s*/, "").trim();
      logBuffer.push(`$ ${c}\n[Linux Kernel]: 目录创建成功 → ${dirs}\nagent_project/\n├── src/\n│   └── core/\n└── logs/`);
    } else if (c.startsWith("cat ")) {
      const target = c.slice(4).trim() || "file";
      logBuffer.push(`$ ${c}\n─── ${target} 内容预览 ───\n#/bin/bash\nAPP_ENV=production\nAPI_PORT=8080\nGEMINI_MODEL=gemini-3.8-flash`);
    } else if (c.includes("lsof") || c.includes("netstat")) {
      logBuffer.push(`$ ${c}\nCOMMAND  PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\npython  4092  dev    4u  IPv4  32014      0t0  TCP *:8080 (LISTEN)`);
    } else if (c === "ls" || c.startsWith("ls ") || c.includes("pwd") || c.includes("tree")) {
      logBuffer.push("$ pwd\n/home/developer/workspace/github-agent-project");
      logBuffer.push("$ ls -lah\ntotal 28K\ndrwxr-xr-x 4 dev dev 4.0K Sep 21 18:00 .\ndrwxr-xr-x 3 dev dev 4.0K Sep 21 17:50 ..\n-rw------- 1 dev dev  120 Sep 21 18:00 .env\n-rw-r--r-- 1 dev dev 2.1K Sep 21 18:00 README.md\ndrwxr-xr-x 2 dev dev 4.0K Sep 21 18:00 src\n-rwxr-xr-x 1 dev dev  540 Sep 21 18:00 start.sh");
    } else if (c.includes("chmod")) {
      logBuffer.push(`$ ${c}\nCOMMAND  PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\npython  4092  dev    4u  IPv4  32014      0t0  TCP *:8080 (LISTEN)`);
    } else if (c.includes("kill")) {
      logBuffer.push(`$ ${c}\n[SIGKILL 9 发送成功]: 进程 4092 已被终止，端口 8080 已成功释放。`);
    } else if (c.includes("export")) {
      logBuffer.push(`$ ${c}\n[Environment Variable Exported]: 环境变量已注入当前 Shell 进程上下文`);
    } else if (c.includes("grep") || c.includes("tail")) {
      logBuffer.push(`$ ${c}\n2026-09-21 18:00:12 [ERROR] [FastAPI.handler] ConnectionResetError: Peer closed socket\n2026-09-21 18:00:15 [WARN]  [Worker-1] Retrying connection attempt 2/5...\n2026-09-21 18:00:16 [INFO]  [Worker-1] Successfully reconnected to upstream server.`);
    } else if (c.includes("systemctl") || c.includes("service")) {
      logBuffer.push(`$ ${c}\n● agent-runner.service - Autonomous AI Agent Background Daemon\n     Loaded: loaded (/etc/systemd/system/agent-runner.service; enabled)\n     Active: active (running) since Mon 2026-09-21 18:00:00 UTC\n   Main PID: 8812 (python)\n     Memory: 64.2M\n        CPU: 124ms`);
    } else if (c.includes("nohup")) {
      logBuffer.push(`$ ${c}\nnohup: appending output to 'app.log'\n[1] 5120\n服务已在 Linux 后台持续守护运行，进程 PID: 5120`);
    } else {
      logBuffer.push(`$ ${c}\n[Exit code: 0] 命令执行成功`);
    }
  }

  return {
    status: "success",
    output: logBuffer.join("\n\n"),
    executionTimeMs: Math.round(performance.now() - start),
  };
}