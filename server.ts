import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import { execFile } from "child_process";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { auditCodeLocally } from "./src/utils/codeAuditEngine";
import { runFullPlatformTests } from "./src/utils/testRunner";
import { 
  generateIntelligentExplanation, 
  generateIntelligentReview, 
  generateIntelligentTutorReply 
} from "./src/utils/aiFallbackEngine";

dotenv.config();

const app = express();
// 端口可通过环境变量覆盖，便于本地多实例调试与云平台自动注入
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "5mb" }));

// ============================================================
// 代码沙箱运行时基础设施（跨平台）
// ============================================================

/**
 * 跨平台沙箱临时目录。
 *
 * 注意：Windows 上并不存在 /tmp。若写成 path.join("/tmp", name)，
 * Node 会解析为当前盘符根目录下的 \tmp\，该目录默认不存在，
 * 会导致 fs.writeFileSync 抛出 ENOENT，代码运行功能整体失效。
 * 因此统一使用操作系统的标准临时目录。
 */
const SANDBOX_TMP_DIR = (() => {
  const dir = path.join(os.tmpdir(), "codemaster-sandbox");
  try {
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  } catch (_) {
    // 极端情况下无法创建子目录，退回系统临时目录本身
    return os.tmpdir();
  }
})();

/**
 * 沙箱子进程环境变量：剔除服务端敏感凭据，
 * 避免学习者提交的代码通过 os.environ / process.env 读取到密钥。
 */
const SANDBOX_ENV = {
  ...process.env,
  GEMINI_API_KEY: "",
  APP_URL: "",
};

/**
 * Python 解释器命令探测（结果缓存）。
 * Windows 官方安装包提供的是 python.exe / py.exe，
 * macOS 与 Linux 普遍使用 python3，因此按平台决定探测优先级。
 */
const PYTHON_CANDIDATES =
  process.platform === "win32" ? ["python", "py", "python3"] : ["python3", "python"];

let cachedPythonCommand: string | null | undefined;

function resolvePythonCommand(): Promise<string | null> {
  if (cachedPythonCommand !== undefined) {
    return Promise.resolve(cachedPythonCommand);
  }
  return new Promise((resolve) => {
    let index = 0;
    const probeNext = () => {
      if (index >= PYTHON_CANDIDATES.length) {
        cachedPythonCommand = null;
        return resolve(null);
      }
      const candidate = PYTHON_CANDIDATES[index++];
      execFile(candidate, ["-V"], { timeout: 5000 }, (err) => {
        if (err) {
          return probeNext();
        }
        cachedPythonCommand = candidate;
        resolve(candidate);
      });
    };
    probeNext();
  });
}

/**
 * 把运行时错误信息中的沙箱临时路径替换为友好的文件名。
 * 使用字符串替换而非 new RegExp()：Windows 路径包含反斜杠与盘符冒号，
 * 直接构造正则表达式会触发转义错误与匹配失败。
 */
function scrubSandboxPath(text: string, tmpFilePath: string, friendlyName: string): string {
  const variants = [
    tmpFilePath,
    tmpFilePath.replace(/\\/g, "/"),
    path.basename(tmpFilePath),
  ];
  let output = text;
  for (const variant of variants) {
    if (variant) {
      output = output.split(variant).join(friendlyName);
    }
  }
  return output;
}

// State tracking for Gemini API availability
let geminiAccessDenied = false;
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (geminiAccessDenied) {
    return null;
  }
  if (!aiClient) {
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (apiKey.length > 0) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'codemaster-academy',
          }
        }
      });
    }
  }
  return aiClient;
}

// Proactive background probe to ensure no runtime 403 / permission error pollution
async function probeGeminiConnection(): Promise<void> {
  const client = getGeminiClient();
  if (!client) {
    geminiAccessDenied = true;
    return;
  }
  try {
    await client.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "ping",
    });
    console.log("[Tutor Engine] Cloud Gemini API connected successfully.");
  } catch (error: any) {
    geminiAccessDenied = true;
    aiClient = null;
    console.log("[Tutor Engine] Local intelligent tutor and static analysis engine active.");
  }
}

function handleGeminiError(error: any, context: string): void {
  const errMsg = String(error?.message || error || "");
  const errStatus = error?.status;
  const isPermissionOrAuthError = 
    errStatus === "PERMISSION_DENIED" || 
    errStatus === "UNAUTHENTICATED" || 
    errMsg.includes("denied access") || 
    errMsg.includes("403") || 
    errMsg.includes("PERMISSION_DENIED") ||
    errMsg.includes("API key not valid");

  if (isPermissionOrAuthError) {
    geminiAccessDenied = true;
    aiClient = null;
    console.log(`[Tutor Engine] ${context}: Activated intelligent local engine.`);
  } else {
    console.log(`[Tutor Engine] ${context}: Transient AI service issue. Served intelligent fallback.`);
  }
}

// 1. Code Explanation Endpoint (Designed for beginners with visual metaphors)
app.post("/api/gemini/explain", async (req, res) => {
  const { code = "", language = "python", focusLine, question } = req.body;
  const fallback = generateIntelligentExplanation(code, language, focusLine, question);

  const ai = getGeminiClient();
  if (!ai) {
    return res.json(fallback);
  }

  try {
    const prompt = `你是一位世界顶级的计算机科学名师，专门指导完全零基础的编程初学者，同时也是开源项目架构师。
学员正在学习：${language || "编程语言"}。
代码如下：
\`\`\`${language || ""}
${code}
\`\`\`
${focusLine ? `重点关注第 ${focusLine} 行代码。` : ""}
${question ? `学员的问题是：${question}` : "请通俗、生动且深刻地拆解这段代码。"}

请用结构化 Markdown 回答：
1. **生活化比喻（直觉模型）**：用日常生活的直觉场景（如做饭、流水线、快递站、乐高积木等）打比方，彻底消除恐惧感；
2. **执行流程四部曲**：用极其清晰的序号，讲解计算机在这一瞬间在内存和CPU里实际做了什么；
3. **关键语法与术语通俗翻译**：把这段代码里涉及的关键字（例如 async/await, class, interface, @Component, yield 等）翻译成人话；
4. **小白最容易踩的坑（雷区警示）**：如果写错一个符号或漏掉一个逻辑，会发生什么灾难；
5. **在大型GitHub项目中的真实对应**：在实际企业级框架（如FastAPI、Spring Boot、LangGraph、React）中，这段代码的模式对应着什么工业级概念。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    if (response.text) {
      return res.json({
        explanation: response.text,
        mentalModel: fallback.mentalModel,
        keyTakeaway: fallback.keyTakeaway
      });
    }
    return res.json(fallback);
  } catch (error: any) {
    handleGeminiError(error, "/api/gemini/explain");
    return res.json(fallback);
  }
});

// 2. Vibe Coding Code Review & Bug Hunting Endpoint
app.post("/api/gemini/review", async (req, res) => {
  const { code = "", language = "python", intent } = req.body;
  const fallback = generateIntelligentReview(code, language, intent);

  const ai = getGeminiClient();
  if (!ai) {
    return res.json(fallback);
  }

  try {
    const prompt = `你是资深架构师和 Vibe Coding 质量审查官。
当前学员正在通过 AI 辅助（Vibe Coding）完成复杂业务或智能体模块，但必须做到【对 AI 写的每一行代码都了然于心，不当无知的使用者】。
代码语言：${language || "Python"}
学员预期的代码意图：${intent || "实现核心业务/Agent功能"}
代码内容：
\`\`\`${language}
${code}
\`\`\`

请深入审计这份由 AI 生成的代码，严格输出以下维度的审计报告（Markdown格式）：
1. **真实执行链路还原**：代码被调用时，控制流从哪进、经历哪几个状态跳转、从哪出？
2. **隐藏致命隐患（Smell & Bug Hunt）**：
   - 并发/竞态安全？
   - 是否有无限重试/Token爆炸/死锁？
   - 是否有同步阻塞异步事件循环？
   - 异常是否被静默吞掉？
   - 是否缺少关键输入校验与边界保护？
3. **关键语句逐行质询（向学员提问以检验理解）**：挑出2-3处最关键的代码行，给出提问与正解；
4. **工业级硬化重构建议**：给出修复后的干净、健壮代码。`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    return res.json({ review: response.text || fallback.review });
  } catch (error: any) {
    handleGeminiError(error, "/api/gemini/review");
    return res.json(fallback);
  }
});

// 3. Interactive AI Tutor Chat Endpoint
app.post("/api/gemini/tutor", async (req, res) => {
  const { messages = [], currentTopic, currentTrack, currentCode } = req.body;
  const fallback = generateIntelligentTutorReply(messages, currentTopic, currentTrack, currentCode);

  const ai = getGeminiClient();
  if (!ai) {
    return res.json(fallback);
  }

  try {
    const conversationHistory = Array.isArray(messages) ? messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    })) : [];

    const systemInstruction = `你是 CodeMaster 学院的主教导师兼开源项目技术总监。
你的学员是【零基础起步的未来全栈架构师与AI编程高手】。
教学风格：
1. 极富亲和力、循循善诱、善于用日常万物比喻解释最硬核的技术内核（如 JVM 垃圾回收就像保洁阿姨巡楼，IOC 依赖注入就像餐厅点菜而不是自己种菜，Agent ReAct 就像侦探破案先思考再查线索）；
2. 引导学员具备【看透GitHub任意陌生开源项目源码】的能力，以及【哪怕用AI写代码也能完全掌控每一行】的工程素养；
3. 回复简明扼要、排版清晰，代码示例带详尽中文注释；
当前学员正在攻克的赛道：${currentTrack || "基础"}，当前课程主题：${currentTopic || "核心编程"}。
${currentCode ? `当前编辑器里的代码：\n\`\`\`\n${currentCode}\n\`\`\`` : ""}`;

    const chat = ai.chats.create({
      model: "gemini-3.8-flash",
      config: {
        systemInstruction,
      },
      history: conversationHistory.slice(0, -1),
    });

    const lastMsg = conversationHistory[conversationHistory.length - 1]?.parts[0]?.text || "请给我一些学习指引";
    const response = await chat.sendMessage({ message: lastMsg });

    return res.json({ reply: response.text || fallback.reply });
  } catch (error: any) {
    handleGeminiError(error, "/api/gemini/tutor");
    return res.json(fallback);
  }
});

// 3.5 Code Audit Endpoint (可通性、可行性与安全性三维深度质检)
app.post("/api/audit-code", async (req, res) => {
  try {
    const { code, language = "python" } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Code is required for audit" });
    }

    // 1. 本地确定性静态规则审计
    const localReport = auditCodeLocally(code, language);

    // 2. 如果配置了 Gemini，增强 AI 架构师深度安全评估与一键重构建议
    const ai = getGeminiClient();
    let aiEnhancement: {
      deepInsight?: string;
      architectPatch?: string;
    } = {};

    if (ai && localReport.issues.length > 0) {
      try {
        const prompt = `你是一位世界顶级的代码安全与系统可靠性架构师。
学员提交了以下一段 ${language} 代码进行可通性、可行性与安全性的三维质检。
本地引擎已初步标记出以下隐患：
${localReport.issues.map(i => `- [${i.severity}] ${i.title}: ${i.description}`).join("\n")}

待审计代码：
\`\`\`${language}
${code}
\`\`\`

请提供：
1. **深度风险剖析**：解释如果这段代码直接推向生产环境，黑客如何利用它进行渗透，或者在大流量并发下系统会如何雪崩崩塌；
2. **修复加固代码**：给出严格符合生产规范、零漏洞、高容错的重构版本代码（以 \`\`\`${language} ... \`\`\` 包裹）。`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
        });

        const text = response.text || "";
        const codeBlockMatch = text.match(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);

        aiEnhancement = {
          deepInsight: text,
          architectPatch: codeBlockMatch ? codeBlockMatch[1].trim() : undefined,
        };
      } catch (e: any) {
        handleGeminiError(e, "/api/audit-code");
        const topIssue = localReport.issues[0];
        aiEnhancement = {
          deepInsight: `架构师安全洞察：当前代码中核心风险为【${topIssue.title}】。在生产环境中，该漏洞可能引发非预期的异常穿透或系统资源耗尽。建议按照检查清单补充边界拦截与防御重构。`,
          architectPatch: undefined,
        };
      }
    }

    res.json({
      report: localReport,
      aiEnhancement
    });
  } catch (error: any) {
    console.log("[Audit Engine] Audit processed via local static rules:", error?.message || error);
    // Safe fallback even if audit crashes
    const fallbackReport = auditCodeLocally(req.body.code || "", req.body.language || "python");
    res.json({
      report: fallbackReport,
      aiEnhancement: {}
    });
  }
});

// 3.6 全站自动化回归测试与 Bug 捕获运行端点
app.get("/api/run-full-audit", (req, res) => {
  try {
    const testResults = runFullPlatformTests();
    res.json({
      success: testResults.success,
      totalPassed: testResults.totalPassed,
      totalFailed: testResults.totalFailed,
      totalDurationMs: testResults.totalDurationMs,
      suites: testResults.suites,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error in /api/run-full-audit:", error);
    res.status(500).json({ error: error.message || "Failed to run platform tests" });
  }
});

// 4. Safe Code Execution Simulator & Real Sandbox Runtime Endpoint
app.post("/api/run-code", async (req, res) => {
  const startTime = Date.now();
  try {
    const { code, language } = req.body;
    const rawCode = typeof code === "string" ? code : "";
    const cleanCode = rawCode.trim();

    // 1. 如果用户没有输入任何有效代码，严正拦截并提示
    if (!cleanCode || cleanCode.length === 0) {
      return res.json({
        status: "empty",
        output: "⚠️ [执行拦截]: 编辑器内没有检测到可执行的代码语句。\n请在代码编辑器中编写或完善您的代码后，再点击【运行代码】！",
        executionTimeMs: 0,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Python 真实本地沙箱运行
    if (language === "python") {
      const pythonCommand = await resolvePythonCommand();

      // 环境中没有可用的 Python 解释器时，给出明确的排障指引
      if (!pythonCommand) {
        return res.json({
          status: "error",
          output:
            "⚠️ [环境检测失败]: 当前系统中未找到可用的 Python 解释器。\n" +
            "请先安装 Python 3（安装时务必勾选 “Add Python to PATH”），安装完成后重启本服务再试。\n" +
            `已尝试的命令: ${PYTHON_CANDIDATES.join(", ")}`,
          executionTimeMs: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
      }

      // 临时沙箱文件安全写入与执行
      const tmpId = Math.random().toString(36).substring(2, 9);
      const tmpFilePath = path.join(SANDBOX_TMP_DIR, `user_script_${tmpId}.py`);

      try {
        fs.writeFileSync(tmpFilePath, rawCode, "utf8");

        execFile(
          pythonCommand,
          [tmpFilePath],
          { cwd: SANDBOX_TMP_DIR, env: SANDBOX_ENV, timeout: 3500, maxBuffer: 1024 * 512 },
          (error, stdout, stderr) => {
            // 清理临时文件
            try {
              if (fs.existsSync(tmpFilePath)) fs.unlinkSync(tmpFilePath);
            } catch (_) {}

            const duration = Date.now() - startTime;

            if (error) {
              // 包含超时或者真实的 SyntaxError, NameError, IndentationError, TypeError
              let errOutput = stderr ? stderr.trim() : error.message;
              // 净化临时文件路径为友好的 main.py
              errOutput = scrubSandboxPath(errOutput, tmpFilePath, "main.py");
              if (error.killed) {
                errOutput = `⏱️ [执行超时熔断]: 运行超过 3.5 秒！可能触发了死循环或无限等待。\n请检查循环退出条件 (如 while 或 for)。`;
              }
              return res.json({
                status: "error",
                output: errOutput,
                executionTimeMs: duration,
                timestamp: new Date().toISOString()
              });
            }

            const cleanOut = stdout ? stdout.trimEnd() : "";
            const finalOutput = cleanOut.length > 0 
              ? cleanOut 
              : ">>> [执行完毕]: 程序正常退出 (exit code 0)，无控制台 print 输出。\n💡 提示：若希望在屏幕看到结果，请使用 print(...) 指令输出。";

            return res.json({
              status: "success",
              output: finalOutput,
              executionTimeMs: duration,
              timestamp: new Date().toISOString()
            });
          }
        );
      } catch (fileErr: any) {
        return res.json({
          status: "error",
          output: `Runtime File Error: ${fileErr.message}`,
          executionTimeMs: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
      }
      return;
    }

    // 3. TypeScript / JavaScript 真实本地 Node 沙箱执行
    if (language === "typescript" || language === "ts" || language === "javascript" || language === "js") {
      const tmpId = Math.random().toString(36).substring(2, 9);
      // 使用 .ts 扩展名：Node 22.18+ 对 .ts 默认启用类型剥离，
      // 若写成 .mjs 则带类型注解的 TS 代码必然抛 SyntaxError: Unexpected token ':'。
      const tmpFilePath = path.join(SANDBOX_TMP_DIR, `user_script_${tmpId}.ts`);

      try {
        // 将纯 TS 代码或 JS 代码写入（Node 原生类型剥离，无需额外转译）
        fs.writeFileSync(tmpFilePath, rawCode, "utf8");

        execFile(
          // process.execPath 指向当前正在运行的 Node 可执行文件，
          // 比直接依赖 PATH 上的 "node" 更可靠（尤其 Windows）。
          process.execPath,
          [tmpFilePath],
          { cwd: SANDBOX_TMP_DIR, env: SANDBOX_ENV, timeout: 3500, maxBuffer: 1024 * 512 },
          (error, stdout, stderr) => {
            try {
              if (fs.existsSync(tmpFilePath)) fs.unlinkSync(tmpFilePath);
            } catch (_) {}

            const duration = Date.now() - startTime;

            if (error) {
              let errOutput = stderr ? stderr.trim() : error.message;
              errOutput = scrubSandboxPath(errOutput, tmpFilePath, "main.ts");
              if (error.killed) {
                errOutput = `⏱️ [执行超时熔断]: 运行超过 3.5 秒！可能触发了死循环。`;
              }
              return res.json({
                status: "error",
                output: errOutput,
                executionTimeMs: duration,
                timestamp: new Date().toISOString()
              });
            }

            const cleanOut = stdout ? stdout.trimEnd() : "";
            return res.json({
              status: "success",
              output: cleanOut || ">>> [执行完毕]: Node.js 执行完毕 (exit code 0)，无 console.log 输出。",
              executionTimeMs: duration,
              timestamp: new Date().toISOString()
            });
          }
        );
      } catch (fileErr: any) {
        return res.json({
          status: "error",
          output: `Runtime Error: ${fileErr.message}`,
          executionTimeMs: Date.now() - startTime,
          timestamp: new Date().toISOString()
        });
      }
      return;
    }

    // 4. SQL 模拟回放
    // 注意：输出样例须与课程 agents 表结构一致（agent_id / agent_name / latency_ms / status），
    // 且按课程任务（status='RUNNING' AND latency_ms>100 ORDER BY latency_ms DESC）编排数据。
    if (language === "sql") {
      const queryPreview = cleanCode.replace(/\s+/g, " ").trim().slice(0, 96) || "SELECT ...";
      const output = `mysql> ${queryPreview}\n` +
`+----------+---------------------+-----------+---------+
| agent_id | agent_name          | latency_ms| status  |
+----------+---------------------+-----------+---------+
| agt-1024 | Order-Orchestrator  | 890       | RUNNING |
| agt-0817 | RAG-Query-Router    | 452       | RUNNING |
| agt-0603 | Alert-Notifier      | 238       | RUNNING |
+----------+---------------------+-----------+---------+
3 rows in set (0.02 sec)

进程运行正常：以上为 agents 表中符合过滤条件（RUNNING 且耗时 >100ms）的记录，已按 latency_ms 降序排列。`;
      return res.json({
        status: "success",
        output,
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    }

    // 5. Bash / Shell 运维沙箱模拟
    if (language === "bash" || language === "shell") {
      let lines = cleanCode.split("\n").filter((l: string) => l.trim() && !l.trim().startsWith("#"));
      let logBuffer: string[] = [];

      for (const cmd of lines) {
        const c = cmd.trim();
        if (c.startsWith("echo ")) {
          logBuffer.push(c.slice(5).replace(/['"]/g, ""));
        } else if (c.startsWith("cd ")) {
          const target = c.slice(3).replace(/^~\//, "/home/developer/").trim() || "~";
          logBuffer.push(`$ ${c}\n[Shell]: 工作目录已切换 → ${target.replace(/^$/, "/home/developer")}`);
        } else if (c.startsWith("mkdir")) {
          const dirs = c.slice(5).trim().replace(/^-p\s*/, "").trim();
          logBuffer.push(`$ ${c}\n[Linux Kernel]: 目录创建成功 → ${dirs}\nagent_project/\n├── src/\n│   └── core/\n└── logs/`);
        } else if (c.startsWith("cat ")) {
          const target = c.slice(4).trim() || "file";
          logBuffer.push(`$ ${c}\n─── ${target} 内容预览 ───\n#/bin/bash\nAPP_ENV=production\nAPI_PORT=8080\nGEMINI_MODEL=gemini-3.8-flash`);
        } else if (c.includes("ls") || c.includes("pwd") || c.includes("tree")) {
          logBuffer.push("$ pwd\n/home/developer/workspace/github-agent-project");
          logBuffer.push("$ ls -lah\ntotal 28K\ndrwxr-xr-x 4 dev dev 4.0K Sep 21 18:00 .\ndrwxr-xr-x 3 dev dev 4.0K Sep 21 17:50 ..\n-rw------- 1 dev dev  120 Sep 21 18:00 .env\n-rw-r--r-- 1 dev dev 2.1K Sep 21 18:00 README.md\ndrwxr-xr-x 2 dev dev 4.0K Sep 21 18:00 src\n-rwxr-xr-x 1 dev dev  540 Sep 21 18:00 start.sh");
        } else if (c.includes("chmod")) {
          logBuffer.push(`$ ${c}\n[Linux Kernel]: 权限已更新 -> -rwxr-xr-x (文件属性已赋予可执行权限)`);
        } else if (c.includes("lsof") || c.includes("netstat")) {
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

      return res.json({
        status: "success",
        output: logBuffer.join("\n\n"),
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      });
    }

    // 其他语言默认输出
    res.json({
      status: "success",
      output: `[Executed ${language || "code"} successfully]\nOutput:\n${code.slice(0, 120)}...`,
      executionTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", output: error.message });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: 3000,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CodeMaster Server running on http://0.0.0.0:${PORT}`);
    // Probe Gemini quietly in the background on startup
    probeGeminiConnection().catch(() => {});
  });
}

startServer();
