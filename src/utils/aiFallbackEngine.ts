/**
 * CodeMaster Intelligent AI Fallback Engine
 * 当云端 Gemini API 遇到权限受限（如 403 PERMISSION_DENIED）、配额耗尽或离线环境时，
 * 提供确定性、高质量、上下文感知的智能代码解析、Vibe Coding 架构质检与伴读导师回复。
 */

export interface CodeAnalysisResult {
  functions: string[];
  classes: string[];
  imports: string[];
  framework: string;
  hasAsync: boolean;
  hasStateLoop: boolean;
  hasTryCatch: boolean;
}

/**
 * 从代码中提取结构特征
 */
export function analyzeCodeStructure(code: string, language: string): CodeAnalysisResult {
  const codeLines = code.split("\n");
  const functions: string[] = [];
  const classes: string[] = [];
  const imports: string[] = [];
  let framework = "通用标准库";
  let hasAsync = false;
  let hasStateLoop = false;
  let hasTryCatch = false;

  const lang = (language || "").toLowerCase();

  for (const line of codeLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect async
    if (trimmed.includes("async ") || trimmed.includes("await ") || trimmed.includes("CompletableFuture") || trimmed.includes("Promise")) {
      hasAsync = true;
    }

    // Detect loops / agent states
    if (trimmed.includes("while ") || trimmed.includes("for ") || trimmed.includes("step") || trimmed.includes("state")) {
      hasStateLoop = true;
    }

    // Detect exception handling
    if (trimmed.includes("try:") || trimmed.includes("try {") || trimmed.includes("except") || trimmed.includes("catch")) {
      hasTryCatch = true;
    }

    // Detect Python imports & functions
    if (lang === "python") {
      if (trimmed.startsWith("import ") || trimmed.startsWith("from ")) {
        imports.push(trimmed);
        if (trimmed.includes("fastapi")) framework = "FastAPI 异步微服务";
        else if (trimmed.includes("langchain") || trimmed.includes("langgraph")) framework = "LangGraph / LLM Agent";
        else if (trimmed.includes("sqlalchemy") || trimmed.includes("sqlmodel")) framework = "SQLAlchemy ORM 数据层";
        else if (trimmed.includes("pydantic")) framework = "Pydantic 数据验证";
      }
      const funcMatch = trimmed.match(/^def\s+([a-zA-Z0-9_]+)\s*\(/);
      if (funcMatch) functions.push(funcMatch[1]);
      const classMatch = trimmed.match(/^class\s+([a-zA-Z0-9_]+)/);
      if (classMatch) classes.push(classMatch[1]);
    } 
    // Detect Java
    else if (lang === "java") {
      if (trimmed.startsWith("import ")) {
        imports.push(trimmed);
        if (trimmed.includes("springframework")) framework = "Spring Boot / Spring AI 框架";
        else if (trimmed.includes("jakarta.persistence")) framework = "JPA / Hibernate 持久层";
      }
      const methodMatch = trimmed.match(/(?:public|private|protected)?\s*(?:static)?\s*[\w<>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/);
      if (methodMatch && !["if", "for", "while", "switch"].includes(methodMatch[1])) {
        functions.push(methodMatch[1]);
      }
      const classMatch = trimmed.match(/(?:public\s+)?class\s+([a-zA-Z0-9_]+)/);
      if (classMatch) classes.push(classMatch[1]);
    }
    // Detect TypeScript / JavaScript
    else if (lang === "typescript" || lang === "javascript" || lang === "ts" || lang === "js") {
      if (trimmed.startsWith("import ") || trimmed.includes("require(")) {
        imports.push(trimmed);
        if (trimmed.includes("react")) framework = "React 现代前端";
        else if (trimmed.includes("express")) framework = "Express Node.js 后端";
      }
      const fnMatch = trimmed.match(/(?:function|const|let)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\(|function\s+([a-zA-Z0-9_]+)\s*\(/);
      if (fnMatch) functions.push(fnMatch[1] || fnMatch[2]);
      const classMatch = trimmed.match(/(?:class|interface|type)\s+([a-zA-Z0-9_]+)/);
      if (classMatch) classes.push(classMatch[1]);
    }
  }

  return {
    functions: Array.from(new Set(functions)).slice(0, 5),
    classes: Array.from(new Set(classes)).slice(0, 3),
    imports: Array.from(new Set(imports)).slice(0, 5),
    framework,
    hasAsync,
    hasStateLoop,
    hasTryCatch,
  };
}

/**
 * 智能生成代码逐行与思维模型解析
 */
export function generateIntelligentExplanation(
  code: string,
  language: string = "python",
  focusLine?: string | number,
  question?: string
): { explanation: string; mentalModel: string; keyTakeaway: string } {
  const analysis = analyzeCodeStructure(code, language);
  const langUpper = language.toUpperCase();

  let mentalModel = "现代化流水线与精密机械加工系统";
  const isBeginner = 
    (language === "python" || language === "javascript" || language === "typescript") &&
    analysis.classes.length === 0 &&
    analysis.imports.length === 0 &&
    !analysis.hasAsync &&
    analysis.framework === "通用标准库";

  if (isBeginner) {
    if (code.includes("print(") || code.includes("console.log(")) {
      mentalModel = "对讲机广播模型（让木讷的电脑把纸条上的文字原封不动念给你听）";
    } else if (code.includes(" = ") && (code.includes(" + ") || code.includes(" - "))) {
      mentalModel = "小猪存钱罐模型（先算右边拿出来的钱加上新钱，再一起塞回左边贴了名字的盒子里）";
    } else if (code.includes("if ") || code.includes("else")) {
      mentalModel = "十字路口红绿灯模型（如果下雨带伞，否则戴遮阳帽，非黑即白决不纠结）";
    } else if (code.includes("for ") || code.includes("while ")) {
      mentalModel = "全自动复读机流水线（把枯燥重复100遍的体力活全甩给电脑，眨眼搞定）";
    } else if (code.includes("def ") || code.includes("function ")) {
      mentalModel = "全自动榨汁机模型（造好小机器，扔进水果按下开关，每次都能倒出一杯新鲜果汁）";
    } else {
      mentalModel = "贴便签的亚克力收纳盒模型（变量就是盒子，等号就是往盒子里装东西）";
    }

    const focusNotice = focusLine ? `\n> 🎯 **重点聚焦行 (Line ${focusLine})**：这是电脑正在执行的一道核心动作！\n` : "";

    const beginnerExplanation = `### 🍼 零基础大白话拆解（只会开关机也能秒懂！）
${focusNotice}
#### 1. 生活大白话直觉模型
把这段代码想象成 **【${mentalModel}】**：
- **电脑在想什么？** 电脑完全没有感情，脑子一根筋，更不会读心术。你写了这几行指令，它就像个超级忠诚但死板的仆人，老老实实从第一行读到最后一行。
- **为什么要写这些符号？** 电脑是外国工程师发明的，它听不懂普通话。我们写的像 \`print\`、\`=\`、\`if\`，其实就是**最简单的指令开关**，用来命令它干活！

#### 2. 计算机在背后究竟干了啥？（慢动作回放）
1. **开机就绪，从上往下读**：电脑从第一行代码开始，一步一步往下执行，绝不跳步。
2. **遇到等号 \`=\`（装东西）**：${code.includes("=") ? "记住【永远先算右边，再塞进左边】！电脑把右边的内容算好，轻轻放进左边贴了便签名字的盒子里备用。" : "准备好计算空间。"}
3. **遇到输出指令 \`print\`（大喇叭）**：${code.includes("print") ? "电脑打开屏幕上的小窗口，把你给它的文字或盒子里的内容，原汁原味地吐出来给你看。" : "完成数据计算。"}
4. **顺利交差**：所有步骤做完，电脑安静等待你的下一句吩咐。

#### 3. 为什么代码要这样写？（消灭术语恐惧）
- **等号 \`=\` 不是数学里的等于**：在代码里，一个等号是**动作**——“把右边的东西，装进左边的盒子里”！
- **为什么文字要加双引号 \`""\`**：如果不加引号，电脑会以为这是一个盒子的名字，找不到就会报错哭闹；加了双引号，电脑才知道“哦！这是人类说的话，我照抄就行！”
- **数字为什么不加引号**：因为阿拉伯数字全世界通用，电脑天生就认识 \`1, 2, 3\`，直接写就能做加减法！

#### 4. 小白最容易踩的雷区（避坑指南）
- ⚠️ **符号必须是英文的**：输入法千万别停留在中文全角状态！代码里的双引号 \`""\`、小括号 \`()\`、冒号 \`:\` 必须在英文半角状态下输入，不然电脑会抓瞎；
- ⚠️ **盒子名字（变量名）不能带空格**：电脑认不出带空格的名字，比如 \`my name\` 必须写成 \`my_name\`；
- ⚠️ **大小写必须严格一致**：在电脑眼里，小写 \`print\` 是命令，大写 \`Print\` 它就不认得了。

#### 5. 现实世界大软件里是怎么用的？
你现在敲下的这几行代码，正是微信保存你的聊天记录、王者荣耀计算金币点券、淘宝统计购物车金额所使用的**最根本基石**！`;

    return { 
      explanation: beginnerExplanation, 
      mentalModel, 
      keyTakeaway: "学编程不要背数学公式！把变量当盒子，把等号当装东西，让电脑替你跑腿！" 
    };
  }

  if (analysis.framework.includes("Agent")) {
    mentalModel = "数字侦探破案模型（ReAct: 观察 -> 思考推理 -> 工具调用）";
  } else if (analysis.framework.includes("FastAPI") || analysis.framework.includes("Spring")) {
    mentalModel = "星级餐厅点餐前台与厨房流水线模型（Controller 接收路由 -> Service 逻辑加工 -> Repository 仓储交互）";
  } else if (analysis.hasAsync) {
    mentalModel = "高效咖啡店叫号取餐系统（事件循环非阻塞派发，不傻等烧水）";
  }

  const focusNotice = focusLine ? `\n> 🎯 **重点聚焦行 (Line ${focusLine})**：该行是当前逻辑状态流转或副作用发生的核心枢纽。\n` : "";

  const explanation = `### 💡 核心逻辑深度拆解与直觉模型 (${langUpper} · ${analysis.framework})
${focusNotice}
#### 1. 生活化直觉比喻（Mental Model）
将这段代码想象成 **【${mentalModel}】**：
- **原料送达（输入阶段）**：数据参数从外部（客户端请求、函数参数或环境变量）进入函数上下文，开辟内存变量作为“托盘”；
- **核心装配（变换阶段）**：${analysis.hasAsync ? "通过异步事件循环（`await`），在等待外部 IO 时主动出让执行权，保障系统吞吐力；" : "按顺序逐步对数据进行清洗、校验与状态计算；"}
- **质检与输出（交付阶段）**：生成确定的结构化输出，并将状态持久化或返回给调用方。

#### 2. 代码执行链路四步还原
1. **环境与依赖初始化**：${analysis.imports.length > 0 ? `引入关键支撑依赖（如 \`${analysis.imports[0]}\`），为底层运行时准备好执行契约；` : "载入运行时原生上下文，准备好基础运算栈；"}
2. **定义逻辑抽象单元**：${analysis.classes.length > 0 ? `声明数据结构与实体模型 \`${analysis.classes.join(", ")}\`；` : ""}${analysis.functions.length > 0 ? `封装核心业务函数 \`${analysis.functions.join(", ")}\`；` : "按顺序建立变量容器并绑定值；"}
3. **控制流判断与防御拦截**：${analysis.hasTryCatch ? "内置容错与异常拦截层，防止单点故障引发进程整体崩溃；" : "遵循防御性编程，检查边界条件并流转状态；"}
4. **输出交付与资源释放**：执行返回操作，销毁当前帧的临时局部变量，完成单次调用闭环。

#### 3. 关键语法与术语通俗翻译
- **${analysis.hasAsync ? "async / await" : "函数与模块封装"}**：${analysis.hasAsync ? "“点完餐先给你个取餐铃，好了叫你，别傻站着堵住后面的顾客”——这就是非阻塞异步的核心。" : "将一组重复的计算步骤装进黑盒，只需喂入参数即可复用。"}
- **类型系统与结构校验**：${language === "typescript" ? "在编译期构筑防线，杜绝由于拼写错误或类型混淆带来的运行时灾难。" : "提供明确的契约，让调用方一目了然需要传递哪些字段。"}

#### 4. 小白极易踩坑的雷区警示（Bug & Trap Alert）
- ⚠️ **变量作用域与未捕获的边界**：谨防入参为 \`None\` / \`null\` / 空列表时的异常穿透；
${analysis.hasAsync ? "- ⚠️ **禁止在异步函数中使用同步阻塞库**：切忌在 `async` 链路中调用同步沉睡或阻塞网络请求，否则会导致整个单线程事件循环假死；\n" : ""}- ⚠️ **副作用泄漏**：避免直接修改传入的全局引用对象，推荐使用不可变或纯函数设计。

#### 5. 大型 GitHub 工业级开源项目中的对应
在诸如 **FastAPI 官方微服务架构**、**Spring Boot 企业级后台** 或 **LangGraph / AutoGen** 等主流开源项目中，这段代码代表了标准的 **Controller-Service 分层治理** 或 **Agent 单步动作（Action Step）** 原语。`;

  const keyTakeaway = `理解 ${langUpper} 代码时，永远先看入参输入与最终出口，再逆推中间的状态变化。`;

  return { explanation, mentalModel, keyTakeaway };
}

/**
 * 智能生成 Vibe Coding 审查报告与架构师质询
 */
export function generateIntelligentReview(
  code: string,
  language: string = "python",
  intent?: string
): { review: string } {
  const analysis = analyzeCodeStructure(code, language);

  const review = `### 🛡️ Vibe Coding 深度代码审查报告（架构师视角）
**审查意图**：${intent || "实现核心业务/Agent功能"}
**检测技术栈**：${language.toUpperCase()} (${analysis.framework})

---

#### 1. 真实执行链路还原（Reverse Engineering）
代码被调用时的真实控制流转路径：
1. **入口**：调用 \`${analysis.functions[0] || "主逻辑"}\`，在调用栈中分配局部上下文；
2. **流转**：${analysis.hasAsync ? "遇到 await 暂停点，将 Continuation 挂入事件循环等待调度；" : "同步逐行向下执行，依赖内存状态传递；"}
3. **出口**：返回计算结果或向外部系统派发副作用请求。

---

#### 2. 隐藏致命隐患与 Bad Smell 排查（Bug Hunting）
- 🚨 **并发与状态隔离**：
  ${analysis.hasStateLoop ? "检测到状态循环逻辑，请确保设置了严格的最大步数（Max Iterations），避免死循环导致 Token 爆炸或 CPU 飙升 100%。" : "局部变量未完全做并发隔离，如果多协程/多线程并发调用可能存在脏读。"}
- 🚨 **异常捕获粗放**：
  ${analysis.hasTryCatch ? "存在通用异常捕获逻辑，容易将真实的底层的 SyntaxError / TypeError 静默吞掉，导致排查困难。" : "未添加网络/系统级异常补偿，外部依赖如果网络中断可能导致整个请求中断崩溃。"}
- 🚨 **防御性参数边界**：
  入参缺少对边界空值（null / empty / 负数）的断言校验。

---

#### 3. 关键语句逐行架构师质问（向你提问）
> **问题 1**：如果外部依赖服务出现网络抖动（延迟 5000ms），你这段代码在生产环境中是优雅重试、超时熔断，还是拖垮整个线程池？
> **正解**：必须在请求客户端添加显式 \`timeout=5.0\` 与指数退避重试（Exponential Backoff）。
>
> **问题 2**：如果输入参数突然翻倍或者传入非常规特殊字符，代码是否有 OOM 内存溢出或注入风险？
> **正解**：严格使用 Pydantic / TypeScript 模式验证对输入做白名单清洗与分页限制。

---

#### 4. 工业级加固建议与重构方案
给代码添加明确的超时保护、结构化异常日志记录与完备的类型契约，确保不仅能跑通 Happy Path，更能在恶劣生产环境中长期稳定驻留。`;

  return { review };
}

/**
 * 智能生成 AI 伴读导师回复
 */
export function generateIntelligentTutorReply(
  messages: any[],
  currentTopic?: string,
  currentTrack?: string,
  currentCode?: string
): { reply: string } {
  const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1].content : "你好，请指导我！";
  const queryLower = (lastUserMsg || "").toLowerCase();

  let guidanceFocus = "核心编程思维与调试技巧";
  const isZeroQuery = 
    queryLower.includes("小白") || 
    queryLower.includes("零基础") || 
    queryLower.includes("开关机") || 
    queryLower.includes("什么是代码") || 
    queryLower.includes("什么是编程") || 
    queryLower.includes("什么是变量") || 
    queryLower.includes("什么是赋值") || 
    queryLower.includes("第一次") ||
    queryLower.includes("看不懂");

  if (isZeroQuery) {
    const zeroReply = `同学你好！很高兴收到你的提问：**“${lastUserMsg}”**！别担心，哪怕你现在**只会电脑开机和关机**，我也一定能让你像听日常故事一样彻底听懂！

---

### 🍼 给你的人生第一次编程“大白话字典”：

1. **电脑到底是什么？**
   - 电脑不是“神仙”，它其实是一个**力气超级大、算数超级快，但完全不会变通的“机器傻仆人”**。
   - 它没有情绪，也不会读心。你让它干嘛，它就雷打不动干嘛；如果你没给它下命令，它就会一直傻站在那儿。

2. **什么是“代码”与“编程”？**
   - **代码（Code）**：电脑听不懂中文或者英语日常对话。人们为了指挥它，发明了一种规则极其严密的小指令，这就是代码。
   - **编程（Programming）**：**其实就是给电脑写“待办清单”或者“做菜菜谱”**！你写第 1 步放油，第 2 步放盐，电脑就会老老实实照着做。

3. **什么是“变量”与“赋值”？**
   - **变量**：不要想数学公式！变量其实就是**桌上贴了便签名字的透明储物盒**。比如你在盒子上贴个标签写 \`my_name\`；
   - **赋值**：代码里的一个等号 \`=\` 是**往盒子里装东西的动作**！比如 \`my_name = "小明"\`，意思是：把“小明”塞进贴了 \`my_name\` 标签的盒子里！

4. **世界上有哪些编程语言？为什么要分那么多？**
   - 就像木匠有锯子、锤子、螺丝刀一样，语言也是工具！
   - **Python**（最像人话，简单好懂，指挥人工智能首选）；
   - **JavaScript**（管网页特效，点按钮跳弹窗全是它）；
   - **Java**（大银行大企业的后台顶梁柱，稳重严密）。
   - **记住：只要掌握了第一门语言的“盒子（变量）”和“开关（条件判断）”，其他所有语言全都是一通百通！**

---

### 💡 导师给你的新手安心丸：
- 键盘敲错一个字母或者漏了个括号，电脑绝不会爆炸，最多给你弹出一行红色的提醒字；
- 建议你直接从左侧关卡里的 **【0. 零基础极速启蒙】** 开始，只要跟着敲三行指令，你就会发现：编程原来比玩乐高积木还简单、好玩！

随时把你看不懂的任何词发给我，我负责把它翻译成大白话！💪`;

    return { reply: zeroReply };
  }

  if (queryLower.includes("bug") || queryLower.includes("错") || queryLower.includes("error") || queryLower.includes("fail")) {
    guidanceFocus = "Bug 定位三板斧：看报错信息行号 ➔ 打印关键变量状态 ➔ 复现最小可运行单元";
  } else if (queryLower.includes("agent") || queryLower.includes("ai") || queryLower.includes("llm")) {
    guidanceFocus = "AI 智能体思维：Prompt 是意图，工具（Tools）是双手，上下文（Context）是记忆";
  } else if (queryLower.includes("github") || queryLower.includes("开源") || queryLower.includes("看懂")) {
    guidanceFocus = "开源项目拆解五步法：看 README ➔ 找 Main 入口 ➔ 画数据流图 ➔ 改小参数单步验证 ➔ 掌握全貌";
  }

  const reply = `收到你的提问：**“${lastUserMsg}”**！

在 **【${currentTrack || "CodeMaster 全栈课程"}】** 的当前模块（**${currentTopic || "核心实战"}**）中，这是非常关键且高频的一个思考点。

---

### 💡 导师技术点拨：${guidanceFocus}

1. **直觉化理解本质**：
   - 计算机不会读心术，它只忠诚地执行内存中的状态转换；
   - 很多初学者觉得“代码玄学”，本质是因为**脑海里的预期**和**机器实际拿到的变量值**存在偏差。

2. **实战落地建议**：
   - 先用纸笔画出数据的流向：数据从哪进入函数？经历了哪些判断分支？最后从哪返回？
   ${currentCode ? "- 结合你当前工作区的代码，建议尝试将核心逻辑拆分为独立小函数，增加一条明确的输出日志验证！" : "- 动手故意写错一个变量名，观察控制台给出的定位行数，你会发现报错信息是全世界最友好的提示。"}

3. **成为架构师的核心素养**：
   - “看懂代码”并不需要死记硬背每个 API，而是建立**模式识别能力**（例如分层架构、生产者-消费者、状态机、事件驱动）。

你可以随时把具体的某行报错或疑虑发给我，我们一起把它逐行拆碎嚼透！💪`;

  return { reply };
}
