/**
 * Code Audit & Quality Assurance Engine
 * 审核测试代码的可通性 (Passability)、可行性 (Feasibility) 和安全性 (Security)
 */

export interface AuditIssue {
  id: string;
  pillar: "passability" | "feasibility" | "security";
  severity: "FATAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  title: string;
  description: string;
  line?: number;
  fixRecommendation: string;
}

export interface AuditReport {
  score: number; // 0 - 100
  passabilityScore: number; // 0 - 100
  feasibilityScore: number; // 0 - 100
  securityScore: number; // 0 - 100
  verdict: "PASSED" | "WARNING" | "REJECTED";
  issues: AuditIssue[];
  metrics: {
    linesOfCode: number;
    estimatedComplexity: "Low" | "Medium" | "High" | "Extreme";
    hasAsyncOperation: boolean;
    hasLoop: boolean;
    hasExternalNetworkOrIO: boolean;
  };
  summary: string;
}

export function auditCodeLocally(code: string, language: string): AuditReport {
  const issues: AuditIssue[] = [];
  const lines = code.split("\n");
  const loc = lines.filter(l => l.trim().length > 0 && !l.trim().startsWith("//") && !l.trim().startsWith("#")).length;

  let passabilityScore = 100;
  let feasibilityScore = 100;
  let securityScore = 100;

  // 1. --- 可通性审核 (Passability / Compilation / Syntax Integrity) ---
  // A. 括号与括号闭合度
  const bracketPairs: { [key: string]: string } = { "(": ")", "{": "}", "[": "]" };
  const stack: { char: string; line: number }[] = [];
  
  lines.forEach((lineText, idx) => {
    // 忽略字符串内的括号
    const cleanLine = lineText.replace(/(["'`]).*?\1/g, "");
    for (let char of cleanLine) {
      if (char === "(" || char === "{" || char === "[") {
        stack.push({ char, line: idx + 1 });
      } else if (char === ")" || char === "}" || char === "]") {
        const last = stack.pop();
        if (!last || bracketPairs[last.char] !== char) {
          issues.push({
            id: `pass-bracket-${idx}`,
            pillar: "passability",
            severity: "FATAL",
            title: "括号闭合语法崩溃",
            description: `第 ${idx + 1} 行检测到未匹配的闭合符号 '${char}'，导致语法树解析直接阻断。`,
            line: idx + 1,
            fixRecommendation: "检查代码块配对，确保所有的 '(', '{', '[' 都有对应的闭合符号。"
          });
          passabilityScore -= 35;
          break;
        }
      }
    }
  });

  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    issues.push({
      id: "pass-unclosed-bracket",
      pillar: "passability",
      severity: "FATAL",
      title: "缺少闭合括号",
      description: `在第 ${unclosed.line} 行打开的 '${unclosed.char}' 未找到闭合符号，编译将直接失败。`,
      line: unclosed.line,
      fixRecommendation: "在相应代码块末尾补齐对应的闭合括号。"
    });
    passabilityScore -= 35;
  }

  // B. 针对各语言的关键语法与悬空引用分析
  if (language === "python") {
    // 检查是否有缺失冒号的 if/for/def/while/class
    lines.forEach((l, i) => {
      const trimmed = l.trim();
      if (/^(def|class|if|elif|else|for|while|try|except|finally|with)\b/.test(trimmed)) {
        if (!trimmed.endsWith(":") && !trimmed.endsWith("\\") && !trimmed.includes("#")) {
          issues.push({
            id: `pass-py-colon-${i}`,
            pillar: "passability",
            severity: "FATAL",
            title: "Python 语法错误：缺少行尾冒号 (:)",
            description: `第 ${i + 1} 行语句定义末尾缺少冒号 ':'，在 Python 解释器中会报 SyntaxError。`,
            line: i + 1,
            fixRecommendation: "在语句末尾加上 ':'。"
          });
          passabilityScore -= 25;
        }
      }
    });
  }

  if (language === "java") {
    // 检查分号缺失
    lines.forEach((l, i) => {
      const trimmed = l.trim();
      if (trimmed.length > 0 && 
          !trimmed.endsWith(";") && 
          !trimmed.endsWith("{") && 
          !trimmed.endsWith("}") && 
          !trimmed.startsWith("//") && 
          !trimmed.startsWith("/*") && 
          !trimmed.startsWith("*") && 
          !trimmed.startsWith("@") && 
          !/^(public|private|protected|class|interface|record|enum|if|else|for|while|try|catch|finally)\b/.test(trimmed)) {
        // 可能存在漏分号
        if (/^(return|int|String|boolean|double|var|System\.out)\b/.test(trimmed)) {
          issues.push({
            id: `pass-java-semi-${i}`,
            pillar: "passability",
            severity: "HIGH",
            title: "Java 编译错误：缺少分号 (;)",
            description: `第 ${i + 1} 行语句未以分号结尾，JVM 编译器将报 ';' expected。`,
            line: i + 1,
            fixRecommendation: "在语句行末添加分号 ';'"
          });
          passabilityScore -= 20;
        }
      }
    });
  }

  if (language === "typescript" || language === "ts") {
    // 检查是否滥用 any 或危险断言 as any
    if (code.includes(": any") || code.includes("as any")) {
      issues.push({
        id: "pass-ts-any",
        pillar: "passability",
        severity: "MEDIUM",
        title: "类型确定性衰退：滥用 any 穿透",
        description: "检测到使用 ': any' 或 'as any'，关闭了编译期类型守护，退化回动态 JS 风险区。",
        fixRecommendation: "定义具体的 interface、type 或使用 unknown + 类型守卫进行精准收窄。"
      });
      passabilityScore -= 15;
    }
  }

  // 2. --- 可行性审核 (Feasibility / Deadlocks / Edge Cases / Resource Drains) ---
  // A. 死循环隐患与缺失熔断判定 (While True Without Max Steps)
  if (/(while\s*True|while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\))/i.test(code)) {
    const codeWithoutStrings = code.replace(/(["'`]).*?\1/g, "");
    const hasBreak = /\b(break|return)\b/.test(codeWithoutStrings);
    const hasMaxStepOrTimeout = /max_steps|max_retries|timeout|limit|step_count|maxIterations/i.test(code);
    
    if (!hasBreak) {
      issues.push({
        id: "feas-infinite-loop-fatal",
        pillar: "feasibility",
        severity: "FATAL",
        title: "无条件无限死循环 (Deadlock Loop)",
        description: "检测到 while True / while(true) 循环体内部完全没有 break 或 return 退出分支，代码执行将 100% 陷入死循环卡死整个进程！",
        fixRecommendation: "增加明确的退出条件分支（break），或加入 max_steps 步数上限熔断。"
      });
      feasibilityScore -= 50;
    } else if (!hasMaxStepOrTimeout) {
      issues.push({
        id: "feas-no-maxstep",
        pillar: "feasibility",
        severity: "HIGH",
        title: "逻辑可行性隐患：缺少迭代熔断上限 (Missing Max-Step Guard)",
        description: "在循环或递归中仅依赖特定字符串或动态状态匹配退出，若外部数据或模型未产生目标标记，将产生不可控的上下文与 Token 滚雪球消耗。",
        fixRecommendation: "强制添加步数上限熔断（例如 max_steps = 10，超过即抛出超时降级保护）。"
      });
      feasibilityScore -= 25;
    }
  }

  // B. 异步与事件循环阻塞 (Event Loop Blocking in Async)
  if (/async\s+def\b|async\s+function\b/i.test(code)) {
    if (code.includes("time.sleep(") && !code.includes("asyncio.sleep(")) {
      issues.push({
        id: "feas-async-blocking-py",
        pillar: "feasibility",
        severity: "HIGH",
        title: "单线程事件循环阻塞隐患 (Event Loop Freezing)",
        description: "在异步函数中调用了同步阻塞的 time.sleep()，会冻结整个主线程，导致所有并发连接全部超时挂起！",
        fixRecommendation: "替换为 await asyncio.sleep(...) 或将阻塞 IO 封装在 run_in_executor 线程池中。"
      });
      feasibilityScore -= 30;
    }
  }

  // C. 递归深度与防爆栈检查
  if (/def\s+(\w+)\(/.test(code)) {
    const match = code.match(/def\s+(\w+)\(/);
    if (match) {
      const funcName = match[1];
      // 检查递归调用自身
      const regex = new RegExp(`\\b${funcName}\\(`, "g");
      const calls = (code.match(regex) || []).length;
      if (calls > 1 && !code.includes("if ") && !code.includes("elif ")) {
        issues.push({
          id: "feas-recursion-stack",
          pillar: "feasibility",
          severity: "FATAL",
          title: "递归基缺失：RecursionError (Stack Overflow)",
          description: `函数 ${funcName} 递归调用自身，但未检测到基准结束条件 (base case)，会立即触发栈溢出崩溃。`,
          fixRecommendation: "在递归入口添加基准条件（例如 if n <= 1: return ...）。"
        });
        feasibilityScore -= 40;
      }
    }
  }

  // D. 空指针/未定义解引用风险
  if (/\w+\.get\(|\w+\[['"]\w+['"]\]/.test(code)) {
    if (!code.includes("if ") && !code.includes("try:") && !code.includes("?.") && !code.includes("Optional")) {
      issues.push({
        id: "feas-null-check",
        pillar: "feasibility",
        severity: "LOW",
        title: "弱防御性：边界键值访问缺少空值保护",
        description: "直接访问深层字典/对象属性，若上游返回 null 或空数据可能导致 KeyError / TypeError。",
        fixRecommendation: "建议使用字典 .get(key, default) 或可选链操作符 '?.' 进行防御性保护。"
      });
      feasibilityScore -= 10;
    }
  }

  // 3. --- 安全性审核 (Security & Threat Assessment) ---
  // A. 真实明文私钥/Token 泄露扫描
  const secretPatterns = [
    { pattern: /(sk-[a-zA-Z0-9]{20,})/, name: "OpenAI / Claude API Secret Key" },
    { pattern: /(ghp_[a-zA-Z0-9]{30,})/, name: "GitHub Personal Access Token" },
    { pattern: /AIzaSy[a-zA-Z0-9_-]{33}/, name: "Google API Key" },
    { pattern: /(['"])(AIzaSy|Bearer\s+[a-zA-Z0-9_.-]{20,})\1/, name: "Hardcoded Bearer Token" },
    { pattern: /api[_-]?key\s*=\s*['"][a-zA-Z0-9_\-]{16,}['"]/i, name: "硬编码私钥字符串 (Hardcoded API Key)" }
  ];

  secretPatterns.forEach(sp => {
    if (sp.pattern.test(code)) {
      issues.push({
        id: `sec-hardcoded-key-${sp.name}`,
        pillar: "security",
        severity: "FATAL",
        title: `严重凭证泄漏：${sp.name}`,
        description: "代码中直接硬编码了敏感的 API 凭据或访问密钥，推送到代码仓库会导致账单被刷或数据泄露！",
        fixRecommendation: "立即作废该密钥，改用环境变量读取（如 process.env.API_KEY 或 os.getenv('API_KEY')）。"
      });
      securityScore -= 45;
    }
  });

  // B. SQL 注入扫描 (SQL Injection)
  const sqlInjectionPatterns = [
    /f["']\s*SELECT.*\{.*\}/i,
    /f["']\s*INSERT.*\{.*\}/i,
    /f["']\s*UPDATE.*\{.*\}/i,
    /f["']\s*DELETE.*\{.*\}/i,
    /["']\s*SELECT\s+.*\s*\+\s*\w+/i,
    /cursor\.execute\s*\(\s*f["']/i,
    /\.query\s*\(\s*`SELECT.*?\$\{.*?\}\s*`/i
  ];

  if (sqlInjectionPatterns.some(p => p.test(code))) {
    issues.push({
      id: "sec-sql-injection",
      pillar: "security",
      severity: "FATAL",
      title: "高危安全漏洞：SQL 字符串拼接注入 (SQL Injection)",
      description: "直接使用字符串格式化（f-string 或模板字符串）将不受信任的外部参数拼入 SQL 语句中，攻击者可输入 \"' OR 1=1 --\" 脱裤窃取或删空整个数据库！",
      fixRecommendation: "使用参数化查询（Parameterized Queries），例如 cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))。"
    });
    securityScore -= 40;
  }

  // C. 任意代码执行风险 (Arbitrary Code Execution via eval / exec)
  if (/\beval\s*\(|\bexec\s*\(|new\s+Function\s*\(|Runtime\.getRuntime\(\)\.exec\(|os\.system\s*\(/i.test(code)) {
    issues.push({
      id: "sec-remote-code-exec",
      pillar: "security",
      severity: "FATAL",
      title: "远程代码执行后门风险 (RCE Vulnerability)",
      description: "检测到直接执行动态代码（eval / exec / os.system），一旦传入恶意构造的输入，攻击者可获取操作系统 Shell 权限并控制整台主机！",
      fixRecommendation: "禁止在生产代码中动态执行未经沙箱隔离的外部字符串代码，改用 AST 安全解析或白名单指令。"
    });
    securityScore -= 40;
  }

  // D. 危险系统权限与提权破坏 (Chmod 777 / rm -rf)
  if (/chmod\s+(-R\s+)?777|rm\s+-rf\s+\/|sudo\s+reboot/i.test(code)) {
    issues.push({
      id: "sec-destructive-sys-cmd",
      pillar: "security",
      severity: "HIGH",
      title: "高危破坏性系统指令 / 过宽权限",
      description: "包含诸如 chmod 777（赋予全员读写执行权限造成安全漏洞）或高危破坏性系统操作，严重违反合规基线。",
      fixRecommendation: "遵循最小权限原则（如只读文件 644，敏感文件 600，可执行脚本 755）。"
    });
    securityScore -= 30;
  }

  // 综合得分计算与判定
  passabilityScore = Math.max(0, Math.min(100, passabilityScore));
  feasibilityScore = Math.max(0, Math.min(100, feasibilityScore));
  securityScore = Math.max(0, Math.min(100, securityScore));

  const totalScore = Math.round(passabilityScore * 0.35 + feasibilityScore * 0.35 + securityScore * 0.3);

  let verdict: "PASSED" | "WARNING" | "REJECTED" = "PASSED";
  if (totalScore < 60 || issues.some(i => i.severity === "FATAL")) {
    verdict = "REJECTED";
  } else if (totalScore < 85 || issues.some(i => i.severity === "HIGH")) {
    verdict = "WARNING";
  }

  let summary = "";
  if (verdict === "PASSED") {
    summary = "代码通过全维度质检：语法契约完备，逻辑边界清晰，未发现凭证泄露或高危注入风险。具备生产发布可行性！";
  } else if (verdict === "WARNING") {
    summary = "代码可基本运行，但存在需要关注的健壮性隐患（如异常兜底较弱、类型守卫不足或潜在并发卡顿）。建议按清单排查。";
  } else {
    summary = "代码未通过质量红线！发现阻断性语法错误、死循环陷阱或严重安全漏洞（SQL注入/密钥硬编码），严禁推向生产！";
  }

  return {
    score: totalScore,
    passabilityScore,
    feasibilityScore,
    securityScore,
    verdict,
    issues,
    metrics: {
      linesOfCode: loc,
      estimatedComplexity: loc > 100 ? "Extreme" : loc > 40 ? "High" : loc > 15 ? "Medium" : "Low",
      hasAsyncOperation: /async|await|Promise|CompletableFuture/i.test(code),
      hasLoop: /for\b|while\b|\.forEach|\.map/i.test(code),
      hasExternalNetworkOrIO: /fetch|http|axios|requests|curl|socket|connect|open\(/i.test(code),
    },
    summary
  };
}
