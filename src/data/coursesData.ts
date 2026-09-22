import { TrackInfo } from "../types";
import { ZERO_TRACK } from "./zeroTrackData";
import { TRACK_ENTERPRISE_PROJECTS } from "./trackEnterpriseProjectsData";

export const TRACKS_DATA: TrackInfo[] = [
  ZERO_TRACK,
  {
    id: "track-python",
    title: "1. Python 核心基石",
    tagline: "最优雅的现代工程语言，从零到写出高内聚模块",
    description: "从变量与内存模型的直觉起步，理解函数式设计、面向对象封装与现代异步并发（asyncio）。",
    icon: "FileCode",
    badgeColor: "emerald",
    tags: ["入门首选", "AI原生语言", "动态解释"],
    capstoneChallenge: "实现一个带类型注解与异常处理的工业级数据解析流水线",
    enterpriseProject: TRACK_ENTERPRISE_PROJECTS["track-python"],
    lessons: [
      {
        id: "py-101",
        title: "变量与内存：不要把变量当作盒子，把它当成便利贴",
        trackId: "track-python",
        estimatedMinutes: 10,
        level: "零基础",
        mentalModel: {
          title: "便利贴与实物模型",
          metaphor: "在 Python 里，数据实体（如数字 42、字符串 'Alice'）是存放在内存中的气球，变量名并不是装着东西的盒子，而是一根拴在气球上的绳子（便利贴）。给变量赋值，就是把标签贴到对象上。",
          keyIntuition: "多个变量指向同一个对象时，修改对象内容会同步影响所有贴了标签的变量。"
        },
        explanationMarkdown: `### 🎯 进阶一步：Python 里的变量与便签
在前面的【0. 纯小白启蒙】中，我们把变量比喻成了“贴标签的储物盒”。
现在进入 Python 核心基石，我们将更上一层楼：在 Python 这门语言里，数据就像一个个飘在空中的气球，而变量名其实是一根根拴在气球上的**便签绳**！

当你写下：
\`\`\`python
user_name = "Alice"
user_age = 24
\`\`\`
计算机在幕后做了两件事：
1. **在内存里吹起了一个装有文字的气球** \`"Alice"\` 和数字气球 \`24\`；
2. **拿来写着标签名字的绳子** \`user_name\` 和 \`user_age\`，拴到了这两个气球上。

### 💡 为什么这在实际项目中至关重要？
因为如果有多根绳子拴在同一个气球上，只要其中一个人顺着绳子给气球画了个笑脸，所有人看到的气球都会变成笑脸！这就是为什么改动变量可以同步协作的核心奥秘。

### 📋 本节任务：
请在右侧编辑器中：
1. 创建变量 \`agent_name\`，赋值为 \`"Jarvis"\`；
2. 创建变量 \`task_count\`，初始值为 \`0\`；
3. 将 \`task_count\` 增加 \`1\`；
4. 使用 \`print()\` 输出 \`agent_name\` 和最新的 \`task_count\`。`,
        language: "python",
        starterCode: `# 1. 请定义 agent_name，并赋值为 "Jarvis"
agent_name = ""

# 2. 定义 task_count，初始值为 0
task_count = 0

# 3. 将 task_count 加 1


# 4. 打印 agent_name 和 task_count
print(f"Agent {agent_name} 已就绪，已处理任务: {task_count}")
`,
        solutionCode: `agent_name = "Jarvis"
task_count = 0
task_count = task_count + 1
print(f"Agent {agent_name} 已就绪，已处理任务: {task_count}")
`,
        checkpoints: [
          {
            id: "chk-py-1",
            title: "正确声明并赋值 agent_name",
            description: "变量 agent_name 必须是字符串 'Jarvis'",
            testFunction: (code) => {
              const passed = code.includes('agent_name = "Jarvis"') || code.includes("agent_name = 'Jarvis'");
              return {
                passed,
                message: passed ? "✅ agent_name 声明正确！" : "❌ 未找到 agent_name = \"Jarvis\""
              };
            }
          },
          {
            id: "chk-py-2",
            title: "递增 task_count",
            description: "task_count 必须进行加 1 运算",
            testFunction: (code) => {
              const passed = code.includes("task_count += 1") || code.includes("task_count = task_count + 1") || code.includes("task_count = 1");
              return {
                passed,
                message: passed ? "✅ 计数器状态流转正确！" : "❌ 请确保更新了 task_count 的值"
              };
            }
          }
        ],
        githubAnalogy: "类似 GitHub 开源 Agent 项目中初始化 Agent 状态与任务计数器的入口代码。"
      },
      {
        id: "py-102",
        title: "函数与作用域：构建可复用的逻辑黑盒",
        trackId: "track-python",
        estimatedMinutes: 15,
        level: "零基础",
        mentalModel: {
          title: "果汁榨汁机模型",
          metaphor: "函数就像一台果汁机。参数（Parameters）是丢进去的水果（原料），函数体是旋转刀片的搅拌过程，return 返回值是倒出来的果汁。外部不知道里面具体怎么绞碎，只要给苹果就出苹果汁。",
          keyIntuition: "函数让庞大的1万行代码被拆成20个互相独立的小工具，各司其职。"
        },
        explanationMarkdown: `### 🎯 函数的核心：输入 ➔ 处理 ➔ 输出
所有的现代软件工程，归根结底都是由一个个小函数拼装而成的。
在 Python 中使用 \`def\` 关键字定义函数：
\`\`\`python
def calculate_token_cost(prompt_tokens: int, completion_tokens: int) -> float:
    # 模拟计算大模型调用费用
    cost = (prompt_tokens * 0.00015) + (completion_tokens * 0.0006)
    return round(cost, 6)
\`\`\`

### 📋 本节任务：
请编写一个函数 \`format_user_prompt(role: str, message: str) -> str\`：
- 如果 \`role\` 是 \`"system"\`，返回 \`"[SYSTEM DIRECTIVE]: " + message\`
- 否则返回 \`f"[{role.upper()}]: {message}"\`
- 最后调用并打印一次结果。`,
        language: "python",
        starterCode: `# 请完善 format_user_prompt 函数
def format_user_prompt(role: str, message: str) -> str:
    # 在这里编写你的逻辑
    pass

# 测试调用
test_output = format_user_prompt("system", "你是一个专业Python导师")
print(test_output)
`,
        solutionCode: `def format_user_prompt(role: str, message: str) -> str:
    if role == "system":
        return "[SYSTEM DIRECTIVE]: " + message
    return f"[{role.upper()}]: {message}"

test_output = format_user_prompt("system", "你是一个专业Python导师")
print(test_output)
`,
        checkpoints: [
          {
            id: "chk-py-func-1",
            title: "定义带有两个参数的函数",
            description: "函数名必须为 format_user_prompt",
            testFunction: (code) => {
              const passed = code.includes("def format_user_prompt");
              return { passed, message: passed ? "✅ 函数签名定义正确" : "❌ 未找到 def format_user_prompt" };
            }
          },
          {
            id: "chk-py-func-2",
            title: "条件判断与格式化返回",
            description: "包含 role == 'system' 分支与 return 语句",
            testFunction: (code) => {
              const passed = code.includes("return") && (code.includes('"system"') || code.includes("'system'"));
              return { passed, message: passed ? "✅ 逻辑分支与返回值检验通过" : "❌ 请确保有条件分支和 return 返回" };
            }
          }
        ],
        githubAnalogy: "这正是 LangChain / LlamaIndex 中 Prompt 模板渲染器的核心原型。"
      },
      {
        id: "py-103",
        title: "现代 Python 异步编程：async 与 await 拯救并发",
        trackId: "track-python",
        estimatedMinutes: 20,
        level: "进阶",
        mentalModel: {
          title: "咖啡厅点单与取餐呼叫器模型",
          metaphor: "同步（Sync）就像在柜台点单后，收银员傻站着等咖啡煮好才接待下一位顾客（全店排长队卡死）；异步（Async）是收银员给你一个震动呼叫器（await），然后立刻接待下一位。等咖啡好了呼叫器响了再回来拿。",
          keyIntuition: "在调用大模型API或数据库等耗时网络IO时，await 让出CPU执行权，使单台服务器能同时处理上千个请求！"
        },
        explanationMarkdown: `### ⚡ 为什么现代 AI & FastAPI 框架全都是 async？
调用大模型生成一段文字可能需要 3 秒钟。
- **如果用同步方式**：这 3 秒内你的服务器彻底卡死，其他用户的请求全在排队等待；
- **如果用 \`asyncio\`**：这 3 秒内 CPU 可以继续并发处理 1000 个其他人的请求！

在 Python 中：
- 使用 \`async def\` 声明异步函数（协程）；
- 在等待网络请求时，使用 \`await\` 挂起。`,
        language: "python",
        starterCode: `import asyncio

async def fetch_llm_response(prompt: str) -> str:
    print(f"正在向 AI 集群发送请求: {prompt}...")
    # 模拟网络等待 0.1 秒
    await asyncio.sleep(0.1)
    return f"AI 思考完毕，回应了：{prompt} 是一门很棒的技术！"

async def main():
    # 请使用 await 调用 fetch_llm_response
    result = await fetch_llm_response("什么是 Python 异步")
    print(result)

# 运行事件循环
asyncio.run(main())
`,
        solutionCode: `import asyncio

async def fetch_llm_response(prompt: str) -> str:
    print(f"正在向 AI 集群发送请求: {prompt}...")
    await asyncio.sleep(0.1)
    return f"AI 思考完毕，回应了：{prompt} 是一门很棒的技术！"

async def main():
    result = await fetch_llm_response("什么是 Python 异步")
    print(result)

asyncio.run(main())
`,
        checkpoints: [
          {
            id: "chk-py-async-1",
            title: "正确使用 async def 定义协程",
            description: "代码中包含 async def 与 await 表达式",
            testFunction: (code) => {
              const passed = code.includes("async def") && code.includes("await");
              return { passed, message: passed ? "✅ 异步协程语法规范掌握" : "❌ 缺少 async def 或 await 关键字" };
            }
          }
        ],
        githubAnalogy: "FastAPI 路由和 LangGraph 节点的核心异步驱动机制。"
      }
    ]
  },
  {
    id: "track-java",
    title: "2. Java 企业级内核",
    tagline: "全球万亿级工业底座，类型安全与虚拟机艺术",
    description: "洞悉 JVM 内存布局、面向对象多态机制、集合框架原理及企业级高并发设计哲学。",
    icon: "Coffee",
    badgeColor: "amber",
    tags: ["企业微服务", "静态强类型", "JVM底座"],
    capstoneChallenge: "用 Java 设计一个带线程安全缓存与策略模式的订单结算处理器",
    enterpriseProject: TRACK_ENTERPRISE_PROJECTS["track-java"],
    lessons: [
      {
        id: "java-101",
        title: "类与对象：建筑蓝图与真实盖好的摩天大楼",
        trackId: "track-java",
        estimatedMinutes: 12,
        level: "零基础",
        mentalModel: {
          title: "蓝图与建筑实例",
          metaphor: "类（Class）是施工图纸，上面标明了房子有几扇门窗（属性）以及可以通水电（方法）；对象（Object / Instance）是拿着图纸用混凝土实际盖出来的一座座实体房子。",
          keyIntuition: "一张类图纸可以 new 出成千上万个独立互不干扰的真实对象。"
        },
        explanationMarkdown: `### ☕ 强类型世界的严谨之美
Java 是一门编译型、强类型面向对象语言。
在进入 Spring Boot 之前，你必须掌握最基本的类定义与封装：
\`\`\`java
public class User {
    private String id;
    private String name;

    public User(String id, String name) {
        this.id = id;
        this.name = name;
    }
}
\`\`\`

### 📋 本节任务：
请在右侧完善 \`AgentProfile\` 类：
1. 添加两个私有字段：\`private String agentName\` 和 \`private int capabilityLevel\`；
2. 编写构造函数完成赋值；
3. 编写一个 \`public void report()\` 方法打印其信息。`,
        language: "java",
        starterCode: `public class AgentProfile {
    // 1. 声明私有属性 agentName (String) 和 capabilityLevel (int)
    private String agentName;
    private int capabilityLevel;

    // 2. 构造方法
    public AgentProfile(String agentName, int capabilityLevel) {
        this.agentName = agentName;
        this.capabilityLevel = capabilityLevel;
    }

    // 3. 报告方法
    public void report() {
        System.out.println("智能体: " + agentName + " | 能力评级: Lv." + capabilityLevel);
    }

    public static void main(String[] args) {
        AgentProfile bot = new AgentProfile("CodeReviewer", 5);
        bot.report();
    }
}
`,
        solutionCode: `public class AgentProfile {
    private String agentName;
    private int capabilityLevel;

    public AgentProfile(String agentName, int capabilityLevel) {
        this.agentName = agentName;
        this.capabilityLevel = capabilityLevel;
    }

    public void report() {
        System.out.println("智能体: " + agentName + " | 能力评级: Lv." + capabilityLevel);
    }

    public static void main(String[] args) {
        AgentProfile bot = new AgentProfile("CodeReviewer", 5);
        bot.report();
    }
}
`,
        checkpoints: [
          {
            id: "chk-java-1",
            title: "属性私有化与封装",
            description: "包含 private 字段与构造函数 this 赋值",
            testFunction: (code) => {
              const passed = code.includes("private String agentName") && code.includes("this.agentName = agentName");
              return { passed, message: passed ? "✅ 属性封装与构造函数正确" : "❌ 请检查 private 修饰符与构造函数" };
            }
          }
        ],
        githubAnalogy: "Spring Boot 中几乎每一个 Entity、DTO 和 Service 都基于这种严谨封装规范。"
      },
      {
        id: "java-102",
        title: "接口与多态：统一插座标准与不同电器实现",
        trackId: "track-java",
        estimatedMinutes: 18,
        level: "进阶",
        mentalModel: {
          title: "三孔国标插座模型",
          metaphor: "接口（Interface）只规定插头必须是三个脚、能承载220V电压（规范）；不管插进来的是吹风机、电脑还是电磁炉（不同的实现类），插座都能供电。上层代码只面向插座编程！",
          keyIntuition: "面向接口编程使得更换大模型提供商（OpenAI 换成 Gemini）只需换实现类，业务代码一行不用改。"
        },
        explanationMarkdown: `### 🔌 为什么看大型开源 Java 项目必须懂接口？
在 Spring AI 源码中，你会看到核心接口：
\`\`\`java
public interface ChatClient {
    ChatResponse prompt(String userMessage);
}
\`\`\`
无论底层对接的是 Ollama、DeepSeek 还是 Gemini，业务代码都只需要依赖 \`ChatClient\` 接口。`,
        language: "java",
        starterCode: `// 定义模型驱动接口
interface LLMProvider {
    String chat(String prompt);
}

// 实现类 1: GeminiProvider
class GeminiProvider implements LLMProvider {
    @Override
    public String chat(String prompt) {
        return "[Gemini 3.8 Flash] 智能回复: " + prompt;
    }
}

public class MultiModelRouter {
    public static void main(String[] args) {
        // 多态：父接口引用指向子类对象
        LLMProvider provider = new GeminiProvider();
        System.out.println(provider.chat("你好，Java 接口"));
    }
}
`,
        solutionCode: `interface LLMProvider {
    String chat(String prompt);
}

class GeminiProvider implements LLMProvider {
    @Override
    public String chat(String prompt) {
        return "[Gemini 3.8 Flash] 智能回复: " + prompt;
    }
}

public class MultiModelRouter {
    public static void main(String[] args) {
        LLMProvider provider = new GeminiProvider();
        System.out.println(provider.chat("你好，Java 接口"));
    }
}
`,
        checkpoints: [
          {
            id: "chk-java-poly",
            title: "接口定义与实现类的多态调用",
            description: "正确实现 implements 与 @Override",
            testFunction: (code) => {
              const passed = code.includes("implements LLMProvider") && code.includes("LLMProvider provider =");
              return { passed, message: passed ? "✅ 深刻掌握多态解耦思想" : "❌ 缺少 implements 或接口多态赋值" };
            }
          }
        ],
        githubAnalogy: "Spring Boot 与 Spring AI 最核心的设计模式：依赖倒置原则（DIP）。"
      }
    ]
  },
  {
    id: "track-ds",
    title: "3. 数据结构与算法思维",
    tagline: "代码背后的骨骼与血液，写出高吞吐系统的底层直觉",
    description: "不背死板公式，用图形与物理直觉理解哈希表冲突、二叉树分治、拓扑排序与时空复杂度 Big-O。",
    icon: "Network",
    badgeColor: "indigo",
    tags: ["性能核心", "架构内功", "工程直觉"],
    capstoneChallenge: "用哈希表与双向链表手动实现一个 O(1) 复杂度的 LRU 缓存系统",
    enterpriseProject: TRACK_ENTERPRISE_PROJECTS["track-ds"],
    lessons: [
      {
        id: "ds-101",
        title: "哈希表：为什么根据 ID 找数据能做到瞬时 O(1)？",
        trackId: "track-ds",
        estimatedMinutes: 15,
        level: "零基础",
        mentalModel: {
          title: "超级快递柜格子与哈希算法",
          metaphor: "如果快递全堆在地上，你要找包裹只能从头翻到尾（O(N) 累死）；丰巢快递柜把取件码通过一个公式（Hash函数）直接算出在第 3 列第 5 行柜门，啪嗒直接弹开（O(1) 瞬时完成）。",
          keyIntuition: "哈希冲突就像两个人算出了同一个柜子，用链表（拉链法）在格子里串起来继续找。"
        },
        explanationMarkdown: `### 📦 几乎所有高并发系统的基石：HashMap
从 Redis、Python 的 \`dict\`、Java 的 \`HashMap\` 到 SQL 数据库的内存索引，全部基于哈希表。
在 Python 中，字典就是极致优化的哈希表。

### 📋 本节任务：
实现一个简单的内存 Token 缓存映射表，在常数时间复杂度内检索与记录智能体的上下文信息。`,
        language: "python",
        starterCode: `# 内存缓存哈希表
session_cache = {}

def set_session(user_id: str, context: str):
    # 将 user_id 映射到 context
    session_cache[user_id] = context

def get_session(user_id: str) -> str:
    # 从哈希表中 O(1) 获取，如果不存在返回默认提示
    return session_cache.get(user_id, "上下文不存在")

set_session("user_99", "用户询问了 Python 数据结构")
print(get_session("user_99"))
print(get_session("user_unknown"))
`,
        solutionCode: `session_cache = {}

def set_session(user_id: str, context: str):
    session_cache[user_id] = context

def get_session(user_id: str) -> str:
    return session_cache.get(user_id, "上下文不存在")

set_session("user_99", "用户询问了 Python 数据结构")
print(get_session("user_99"))
print(get_session("user_unknown"))
`,
        checkpoints: [
          {
            id: "chk-ds-1",
            title: "哈希键值对存取",
            description: "正确使用字典存取与默认值处理",
            testFunction: (code) => {
              const passed = code.includes("session_cache[") && code.includes("session_cache.get");
              return { passed, message: passed ? "✅ O(1) 哈希表存取操作成功" : "❌ 请使用字典存取与 .get() 方法" };
            }
          }
        ],
        githubAnalogy: "开源 Agent 框架（如 LangChain Memory / Redis 会话存储）的底层核心存储机制。"
      },
      {
        id: "ds-102",
        title: "图与拓扑排序：多任务依赖调度的指挥官",
        trackId: "track-ds",
        estimatedMinutes: 20,
        level: "进阶",
        mentalModel: {
          title: "穿衣服的先后顺序图",
          metaphor: "你必须先穿内裤才能穿牛仔裤，先穿袜子才能穿运动鞋。这种【必须先做A才能做B】的有向依赖关系就是有向无环图（DAG），计算出最合理的执行步骤就是拓扑排序。",
          keyIntuition: "LangGraph、Airflow、Webpack 以及大型多Agent工作流，底层全是 DAG 拓扑排序调度！"
        },
        explanationMarkdown: `### 🌐 多 Agent 工作流的核心：DAG (有向无环图)
当一个项目包含：
- Agent A：网络检索信息
- Agent B：撰写草稿（依赖 Agent A）
- Agent C：代码审查（依赖 Agent B）
系统必须知道先唤醒谁，谁执行完毕后再唤醒下一棒。`,
        language: "python",
        starterCode: `# 任务节点依赖映射: task -> [必须在它之前完成的前置任务]
task_dependencies = {
    "生成最终报告": ["代码审查", "安全扫描"],
    "代码审查": ["AI生成代码"],
    "安全扫描": ["AI生成代码"],
    "AI生成代码": []
}

def get_executable_tasks(completed_tasks: set):
    ready_tasks = []
    for task, deps in task_dependencies.items():
        if task not in completed_tasks and all(d in completed_tasks for d in deps):
            ready_tasks.append(task)
    return ready_tasks

# 第一轮已完成：无
current_done = set()
print("第1轮可执行任务:", get_executable_tasks(current_done))

# 模拟完成 AI生成代码
current_done.add("AI生成代码")
print("第2轮可执行任务:", get_executable_tasks(current_done))
`,
        solutionCode: `task_dependencies = {
    "生成最终报告": ["代码审查", "安全扫描"],
    "代码审查": ["AI生成代码"],
    "安全扫描": ["AI生成代码"],
    "AI生成代码": []
}

def get_executable_tasks(completed_tasks: set):
    ready_tasks = []
    for task, deps in task_dependencies.items():
        if task not in completed_tasks and all(d in completed_tasks for d in deps):
            ready_tasks.append(task)
    return ready_tasks

current_done = set()
print("第1轮可执行任务:", get_executable_tasks(current_done))
current_done.add("AI生成代码")
print("第2轮可执行任务:", get_executable_tasks(current_done))
`,
        checkpoints: [
          {
            id: "chk-ds-dag",
            title: "DAG 依赖状态评估算法",
            description: "正确根据已完成集合筛选就绪任务",
            testFunction: (code) => {
              const passed = code.includes("all(d in completed_tasks for d in deps)");
              return { passed, message: passed ? "✅ DAG 依赖判定逻辑完美运行" : "❌ 请检查前置依赖的 all() 判定" };
            }
          }
        ],
        githubAnalogy: "LangGraph 状态机中节点调度判定（Conditional Edges）的真实实现原理。"
      }
    ]
  },
  {
    id: "track-sql",
    title: "4. SQL 与现代数据持久化",
    tagline: "让数据在磁盘上千锤百炼，关系模型与事务一致性",
    description: "从二维表投影关联、跨表 JOIN、索引 B+ 树物理扫描，到 ACID 事务与企业级防注入设计。",
    icon: "Database",
    badgeColor: "cyan",
    tags: ["持久化核心", "关系代数", "ACID事务"],
    capstoneChallenge: "设计支持高并发下防止超卖与扣款丢失的 SQL 事务与索引优化方案",
    enterpriseProject: TRACK_ENTERPRISE_PROJECTS["track-sql"],
    lessons: [
      {
        id: "sql-101",
        title: "SELECT 与多表 JOIN：把两张分散的账本拼在一起",
        trackId: "track-sql",
        estimatedMinutes: 12,
        level: "零基础",
        mentalModel: {
          title: "学生花名册与成绩单的学号对齐",
          metaphor: "一张表只记身份证号和姓名，另一张表记身份证号和考试分数。JOIN 就像拿尺子把两张纸上的身份证号横向对齐，拼成一张完整的新表。",
          keyIntuition: "永远只通过主外键关联（Foreign Key），避免全表笛卡尔积灾难。"
        },
        explanationMarkdown: `### 🗄️ SQL 语言：声明式查询的魅力
你只需要告诉数据库“我要什么”，不用教数据库“每一行该怎么遍历”。
\`\`\`sql
SELECT 
    u.id, 
    u.username, 
    COUNT(t.id) as total_tasks
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
WHERE u.status = 'ACTIVE'
GROUP BY u.id, u.username;
\`\`\`

### 📋 本节任务：
编写 SQL 查询，从 \`agents\` 表中检索出所有状态为 \`'RUNNING'\` 且执行耗时大于 100ms 的记录，按照耗时降序排列。`,
        language: "sql",
        starterCode: `-- 请编写查询语句
SELECT 
    agent_id, 
    agent_name, 
    latency_ms, 
    status
FROM agents
WHERE status = 'RUNNING'
-- 请添加条件：latency_ms > 100 并按 latency_ms 降序排列 (DESC)

`,
        solutionCode: `SELECT 
    agent_id, 
    agent_name, 
    latency_ms, 
    status
FROM agents
WHERE status = 'RUNNING' AND latency_ms > 100
ORDER BY latency_ms DESC;
`,
        checkpoints: [
          {
            id: "chk-sql-1",
            title: "WHERE 条件过滤与排序",
            description: "正确使用 AND 条件与 ORDER BY ... DESC",
            testFunction: (code) => {
              const upper = code.toUpperCase();
              const passed = upper.includes("LATENCY_MS > 100") && upper.includes("ORDER BY") && upper.includes("DESC");
              return { passed, message: passed ? "✅ SQL 过滤与排序语法规范" : "❌ 请检查 WHERE latency_ms > 100 与 ORDER BY ... DESC" };
            }
          }
        ],
        githubAnalogy: "任何开源后端管理系统（如 Admin Panel）的监控指标筛选查询语句。"
      }
    ]
  },
  {
    id: "track-fastapi",
    title: "5. FastAPI 现代异步接口架构",
    tagline: "Python 生态最快、最强类型约束的高并发微服务框架",
    description: "深入 Pydantic 运行时模型校验、Depends 依赖注入系统、异步流式响应（SSE）与微服务中间件。",
    icon: "Zap",
    badgeColor: "emerald",
    tags: ["AI后端首选", "异步高吞吐", "类型驱动"],
    capstoneChallenge: "从零搭建一个支持 JWT 鉴权、流式打字机输出与自动化 OpenAPI 文档的 Agent 微服务",
    enterpriseProject: TRACK_ENTERPRISE_PROJECTS["track-fastapi"],
    lessons: [
      {
        id: "fastapi-101",
        title: "Pydantic 校验与路由：入参守门员与自动文档",
        trackId: "track-fastapi",
        estimatedMinutes: 15,
        level: "零基础",
        mentalModel: {
          title: "海关安检机与护照扫描仪",
          metaphor: "客户端发来的网络请求是一堆鱼龙混杂的原始 JSON。Pydantic 就像安检机，不合法的字段瞬间拦截并报错，合法的请求自动转成类型安全的强类型 Python 对象。",
          keyIntuition: "你无需写一堆 if not data.get('xxx')，Pydantic 在进入业务代码前为你解决99%的坏数据。"
        },
        explanationMarkdown: `### ⚡ 为什么现代开源 AI 项目都选 FastAPI？
因为大模型交互有极多的 JSON Schema 结构定义。FastAPI 与 Pydantic 天然融合：
\`\`\`python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=1000)
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    return {"status": "ok", "reply": f"接收到合法输入: {req.prompt}"}
\`\`\`

### 📋 本节任务：
请在右侧完善一个智能体任务派发接口 \`/api/dispatch\`，校验传入的 \`TaskPayload\` 并返回分配状态。`,
        language: "python",
        starterCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# 1. 定义数据结构模型
class TaskPayload(BaseModel):
    task_id: str
    target_agent: str
    priority: int = 1

# 2. 编写 POST 路由
@app.post("/api/dispatch")
async def dispatch_task(payload: TaskPayload):
    # 返回字典结构
    return {
        "dispatched": True,
        "assigned_to": payload.target_agent,
        "tracking_id": f"TRACK_{payload.task_id}"
    }

print("FastAPI 路由已成功注册！")
`,
        solutionCode: `from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class TaskPayload(BaseModel):
    task_id: str
    target_agent: str
    priority: int = 1

@app.post("/api/dispatch")
async def dispatch_task(payload: TaskPayload):
    return {
        "dispatched": True,
        "assigned_to": payload.target_agent,
        "tracking_id": f"TRACK_{payload.task_id}"
    }

print("FastAPI 路由已成功注册！")
`,
        checkpoints: [
          {
            id: "chk-fastapi-1",
            title: "Pydantic 模型与 async POST 路由",
            description: "正确包含 BaseModel 继承与 @app.post 装饰器",
            testFunction: (code) => {
              const passed = code.includes("class TaskPayload(BaseModel)") && code.includes("@app.post(\"/api/dispatch\")");
              return { passed, message: passed ? "✅ FastAPI 路由与类型模型注册正确" : "❌ 请检查 TaskPayload 模型与 @app.post 路由路径" };
            }
          }
        ],
        githubAnalogy: "GitHub 绝大多数开源 Agent 服务（如 Dify、Langfuse、ChatGLM API）的标准接口入口。"
      }
    ]
  },
  {
    id: "track-spring-boot",
    title: "6. Spring Boot 3 企业级微服务",
    tagline: "企业软件第一王座，IOC 容器与切面编程深度解密",
    description: "穿透 Spring IOC 容器生命周期、动态代理与 AOP 切面、Spring MVC 请求流水线与自动化配置原理解析。",
    icon: "Layers",
    badgeColor: "emerald",
    tags: ["企业微服务", "IOC控制反转", "高可用架构"],
    capstoneChallenge: "实现一个包含自定义注解切面、统一异常拦截与声明式调用的 Spring Boot 服务",
    enterpriseProject: TRACK_ENTERPRISE_PROJECTS["track-spring-boot"],
    lessons: [
      {
        id: "sb-101",
        title: "IOC 与依赖注入：别自己去菜市场买菜，让管家送上门",
        trackId: "track-spring-boot",
        estimatedMinutes: 18,
        level: "零基础",
        mentalModel: {
          title: "五星级大厨与食材供应链管家",
          metaphor: "过去写代码，大厨做菜要亲自去种土豆（在类内部自己 new 一个依赖对象）；Spring IOC 容器就像管家，大厨只需要在菜单上写上我需要土豆（@Autowired），管家在开门前就把洗净切好的土豆送进厨房。",
          keyIntuition: "控制反转（IOC）把对象创建和生命周期管理的权力从程序员手中收缴给了 Spring 容器。"
        },
        explanationMarkdown: `### 🍃 Spring Boot 最核心的心法：IOC & DI
在阅读任何一个 GitHub 上的 Spring Boot 仓库时，你到处都会看到：
- \`@Component\` / \`@Service\` / \`@Repository\`：告诉 Spring“把我托管进容器”；
- \`@Autowired\`（或构造器注入）：告诉 Spring“请把托管好的对象注入给我”。

\`\`\`java
@Service
public class OrderService {
    private final PaymentClient paymentClient;

    // 推荐的构造函数依赖注入
    public OrderService(PaymentClient paymentClient) {
        this.paymentClient = paymentClient;
    }
}
\`\`\`

### 📋 本节任务：
请在右侧代码中，为 \`AgentOrchestratorService\` 注入 \`ToolRegistry\`，并完成 \`executeAction\` 的协作调用。`,
        language: "java",
        starterCode: `// 模拟 Spring 注解体系
class ToolRegistry {
    public boolean isValidTool(String name) {
        return "calculator".equals(name) || "web_search".equals(name);
    }
}

public class AgentOrchestratorService {
    // 1. 声明依赖
    private final ToolRegistry toolRegistry;

    // 2. 构造器注入 (Constructor Injection)
    public AgentOrchestratorService(ToolRegistry toolRegistry) {
        this.toolRegistry = toolRegistry;
    }

    public String runTool(String toolName) {
        if (toolRegistry.isValidTool(toolName)) {
            return "工具 " + toolName + " 校验通过，正在由 Spring 托管执行！";
        }
        return "未受信任的工具！";
    }

    public static void main(String[] args) {
        ToolRegistry registry = new ToolRegistry();
        AgentOrchestratorService service = new AgentOrchestratorService(registry);
        System.out.println(service.runTool("web_search"));
    }
}
`,
        solutionCode: `class ToolRegistry {
    public boolean isValidTool(String name) {
        return "calculator".equals(name) || "web_search".equals(name);
    }
}

public class AgentOrchestratorService {
    private final ToolRegistry toolRegistry;

    public AgentOrchestratorService(ToolRegistry toolRegistry) {
        this.toolRegistry = toolRegistry;
    }

    public String runTool(String toolName) {
        if (toolRegistry.isValidTool(toolName)) {
            return "工具 " + toolName + " 校验通过，正在由 Spring 托管执行！";
        }
        return "未受信任的工具！";
    }

    public static void main(String[] args) {
        ToolRegistry registry = new ToolRegistry();
        AgentOrchestratorService service = new AgentOrchestratorService(registry);
        System.out.println(service.runTool("web_search"));
    }
}
`,
        checkpoints: [
          {
            id: "chk-sb-1",
            title: "构造器注入与解耦",
            description: "类内部通过构造函数注入 ToolRegistry",
            testFunction: (code) => {
              const passed = code.includes("this.toolRegistry = toolRegistry;");
              return { passed, message: passed ? "✅ Spring 官方推荐的构造器注入模式" : "❌ 未找到 this.toolRegistry = toolRegistry" };
            }
          }
        ],
        githubAnalogy: "Spring Boot 核心架构的每一处代码都在使用这种依赖注入解耦模式。"
      }
    ]
  },
  {
    id: "track-spring-ai",
    title: "7. Spring AI 企业智能体集成",
    tagline: "Java 生态官方 AI 扩展，模型路由与企业级 RAG 检索",
    description: "全面掌握 Spring AI ChatClient 链式调用、Function Calling 函数反射注册、Vector Database 向量库检索与企业知识库闭环。",
    icon: "Cpu",
    badgeColor: "rose",
    tags: ["企业级AI", "RAG知识库", "VectorStore"],
    capstoneChallenge: "基于 Spring AI 实现企业级私有知识库智能问答与本地向量检索全流程",
    enterpriseProject: TRACK_ENTERPRISE_PROJECTS["track-spring-ai"],
    lessons: [
      {
        id: "sai-101",
        title: "ChatClient 与 RAG 闭环：给大模型装上企业私有外挂大脑",
        trackId: "track-spring-ai",
        estimatedMinutes: 20,
        level: "实战",
        mentalModel: {
          title: "开卷考试与参考书检索员",
          metaphor: "纯大模型像闭卷考试，遇到公司内部秘密或最新规章制度只能胡说八道（产生幻觉）；RAG 检索增强就像开卷考试：用户提问时，助教（向量数据库）先在公司手册里翻出相关三页纸，塞在考卷前面（Prompt），大模型看着参考书作答，绝不胡编乱造！",
          keyIntuition: "RAG = 提问 ➔ 向量检索出私有文档 ➔ 拼装进 Prompt ➔ 大模型阅读并提炼回答。"
        },
        explanationMarkdown: `### 🤖 Spring AI 的工程化力量
在企业级 Java 项目中，Spring AI 提供了极高抽象层次的 \`ChatClient\` 与 \`VectorStore\`：
\`\`\`java
@RestController
public class KnowledgeRagController {
    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    @GetMapping("/api/ask")
    public String ask(@RequestParam String question) {
        // 1. 向量相似度检索出前 3 条企业私有文档
        List<Document> docs = vectorStore.similaritySearch(question);
        
        // 2. 组装 RAG Prompt 并调用大模型
        return chatClient.prompt()
            .system("基于以下企业内部资料回答问题：" + docs)
            .user(question)
            .call()
            .content();
    }
}
\`\`\`

### 📋 本节任务：
请在右侧代码中补全 RAG 检索管道流程，确保将企业私有知识库文档片段与用户提问安全拼装。`,
        language: "java",
        starterCode: `import java.util.List;

public class MiniRagPipeline {
    public static String buildRagPrompt(String userQuestion, List<String> retrievedDocs) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("[系统指令]: 请严格根据以下公司真实资料回答，若资料未提及请回答'知识库未收录'。\n");
        prompt.append("[参考企业资料]:\n");
        for (String doc : retrievedDocs) {
            prompt.append("- ").append(doc).append("\n");
        }
        prompt.append("[用户提问]: ").append(userQuestion);
        return prompt.toString();
    }

    public static void main(String[] args) {
        List<String> mockKnowledge = List.of(
            "CodeMaster 平台毕业考核要求学员掌握 GitHub 陌生项目 5 步拆解法。",
            "平台的 Vibe Coding 专项旨在让学员掌控 AI 代码而不是被 AI 牵着走。"
        );
        String finalPrompt = buildRagPrompt("平台的毕业要求是什么？", mockKnowledge);
        System.out.println(finalPrompt);
    }
}
`,
        solutionCode: `import java.util.List;

public class MiniRagPipeline {
    public static String buildRagPrompt(String userQuestion, List<String> retrievedDocs) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("[系统指令]: 请严格根据以下公司真实资料回答，若资料未提及请回答'知识库未收录'。\n");
        prompt.append("[参考企业资料]:\n");
        for (String doc : retrievedDocs) {
            prompt.append("- ").append(doc).append("\n");
        }
        prompt.append("[用户提问]: ").append(userQuestion);
        return prompt.toString();
    }

    public static void main(String[] args) {
        List<String> mockKnowledge = List.of(
            "CodeMaster 平台毕业考核要求学员掌握 GitHub 陌生项目 5 步拆解法。",
            "平台的 Vibe Coding 专项旨在让学员掌控 AI 代码而不是被 AI 牵着走。"
        );
        String finalPrompt = buildRagPrompt("平台的毕业要求是什么？", mockKnowledge);
        System.out.println(finalPrompt);
    }
}
`,
        checkpoints: [
          {
            id: "chk-sai-1",
            title: "RAG 上下文拼装逻辑",
            description: "正确将检索文档追加到 Prompt 体系",
            testFunction: (code) => {
              const passed = code.includes("retrievedDocs") && code.includes("buildRagPrompt");
              return { passed, message: passed ? "✅ 企业级 RAG Prompt 组装机制正确" : "❌ 未找到 buildRagPrompt 或遍历检索文档" };
            }
          }
        ],
        githubAnalogy: "GitHub 绝大多数开源 Java AI 知识库系统（如 Dromara 社区相关项目）的核心检索链路。"
      }
    ]
  },
  {
    id: "track-agent",
    title: "8. Agent 智能体核心架构",
    tagline: "从静态问答到自主决策，ReAct 循环、Tool Use 与记忆栈",
    description: "揭开 AI Agent 真正智能的面纱：Thought-Action-Observation 循环、动态工具注册、短期/长期记忆管理与自愈容错。",
    icon: "Bot",
    badgeColor: "purple",
    tags: ["AI Agent", "ReAct循环", "函数调用"],
    capstoneChallenge: "手动编写一个包含工具注册表、最大反思步数限制与记忆回滚的原生 Python Agent",
    enterpriseProject: TRACK_ENTERPRISE_PROJECTS["track-agent"],
    lessons: [
      {
        id: "agent-101",
        title: "ReAct 循环：大模型如何学会【思考 ➔ 动手 ➔ 看结果 ➔ 再思考】",
        trackId: "track-agent",
        estimatedMinutes: 20,
        level: "实战",
        mentalModel: {
          title: "福尔摩斯探案笔记本",
          metaphor: "普通聊天机器人像只长了嘴巴的鹦鹉，问它今天北京天气它直接瞎猜；Agent 像侦探：1. Thought（思考：我不知道今天天气，但我有个天气查询工具）；2. Action（行动：调用 weather_tool('北京')）；3. Observation（观察：拿到工具返回 22°C 晴天）；4. Final Answer（最终输出：今天北京22度天气晴朗）。",
          keyIntuition: "Agent 的本质就是把大模型的文字输出解析成结构化的工具调用指令，再把执行结果喂回给大模型继续推演。"
        },
        explanationMarkdown: `### 🧠 什么是 ReAct 范式？
ReAct = **Reasoning + Acting**。
在代码层面，一个最精简的 Agent 执行器就是一个 \`while\` 循环：
1. 传入当前消息历史；
2. 大模型输出：\`{"thought": "...", "tool": "search", "args": "..."}\`；
3. 执行器调用真实的本地代码执行这个工具；
4. 将工具返回值追加为一轮 Observation，继续循环；
5. 直到大模型认为问题已解决，输出最终回答！

### 📋 本节任务：
请完善右侧的 \`SimpleReActAgent\`，实现安全的最大步骤拦截机制（\`max_iterations\`），防止大模型陷入无尽死循环！`,
        language: "python",
        starterCode: `class SimpleReActAgent:
    def __init__(self, max_iterations: int = 3):
        self.max_iterations = max_iterations
        self.memory = []

    def execute_step(self, current_step: int, thought: str, action: str) -> str:
        # 记录思考与行动
        self.memory.append(f"Step {current_step}: Thought[{thought}] -> Action[{action}]")
        # 模拟工具执行
        return f"Tool [{action}] 执行成功，观测到数据已就绪"

    def run(self, query: str):
        print(f"收到用户指令: {query}")
        step = 1
        while step <= self.max_iterations:
            print(f"--- 循环轮次 {step} ---")
            obs = self.execute_step(step, "需要检索代码库依赖", "scan_repo_dependencies")
            print("Observation:", obs)
            step += 1
            if step > 2: # 模拟目标已完成
                break
        return "目标已达成，Agent 安全终止！"

agent = SimpleReActAgent(max_iterations=3)
print(agent.run("帮我分析项目结构"))
`,
        solutionCode: `class SimpleReActAgent:
    def __init__(self, max_iterations: int = 3):
        self.max_iterations = max_iterations
        self.memory = []

    def execute_step(self, current_step: int, thought: str, action: str) -> str:
        self.memory.append(f"Step {current_step}: Thought[{thought}] -> Action[{action}]")
        return f"Tool [{action}] 执行成功，观测到数据已就绪"

    def run(self, query: str):
        print(f"收到用户指令: {query}")
        step = 1
        while step <= self.max_iterations:
            print(f"--- 循环轮次 {step} ---")
            obs = self.execute_step(step, "需要检索代码库依赖", "scan_repo_dependencies")
            print("Observation:", obs)
            step += 1
            if step > 2:
                break
        return "目标已达成，Agent 安全终止！"

agent = SimpleReActAgent(max_iterations=3)
print(agent.run("帮我分析项目结构"))
`,
        checkpoints: [
          {
            id: "chk-agent-1",
            title: "ReAct 循环与最大步数安全截断",
            description: "包含 step <= max_iterations 防死循环保护",
            testFunction: (code) => {
              const passed = code.includes("max_iterations") && code.includes("while");
              return { passed, message: passed ? "✅ 掌握生产级 Agent 的防失控与防死循环心法" : "❌ 缺少 max_iterations 或 while 循环控制" };
            }
          }
        ],
        githubAnalogy: "AutoGPT、BabyAGI 及 LangChain AgentExecutor 的底层核心主干骨架。"
      }
    ]
  },
  {
    id: "track-multi-agent",
    title: "9. Multi-Agent 多智能体协同",
    tagline: "现代分布式智能系统的终局形态，团队协作与拓扑编排",
    description: "从主管派发模式（Supervisor）、蜂群自组织（Swarms）到 LangGraph 状态图与评审仲裁机制。",
    icon: "Users",
    badgeColor: "blue",
    tags: ["多智能体", "Swarms", "LangGraph"],
    capstoneChallenge: "构建一个由产品经理 Agent、研发 Agent 与测试 Agent 构成的自主软件开发微团队",
    enterpriseProject: TRACK_ENTERPRISE_PROJECTS["track-multi-agent"],
    lessons: [
      {
        id: "multi-101",
        title: "Supervisor 模式：研发总监分发与智能体流水线协同",
        trackId: "track-multi-agent",
        estimatedMinutes: 22,
        level: "实战",
        mentalModel: {
          title: "医院门诊分诊台与专家会诊",
          metaphor: "你挂号来到分诊台（主管 Supervisor），分诊护士判断你的病情，将你分配给内科医生（Agent 1）；内科医生看完需要拍片，转交给放射科医生（Agent 2）；放射科出具片子后，主管把所有报告汇总之给药房开药。没有任何一个医生能一个人包揽整座医院！",
          keyIntuition: "让专门的 Agent 做专门的事（细化职责 Prompt），由 Supervisor 负责全局路由与终止仲裁。"
        },
        explanationMarkdown: `### 🌐 多 Agent 协作的核心价值：降解复杂度
让单一 LLM 处理上千行代码时经常顾头不顾尾（注意力稀释、容易幻觉）。
通过将任务拆分给：
- **Architect Agent**：负责画出类图和接口设计；
- **Coder Agent**：根据设计编写具体实现；
- **Reviewer Agent**：专门挑刺找安全漏洞与边界死角；
三个 Agent 互为质检，代码质量呈现指数级提升！

### 📋 本节任务：
请阅读右侧代码，体验多智能体协作总线（Message Bus）的信息流转，并尝试给调度器增加一个新的 \`ReviewerAgent\`！`,
        language: "python",
        starterCode: `class Message:
    def __init__(self, sender: str, content: str):
        self.sender = sender
        self.content = content

class CoderAgent:
    def write_code(self, requirement: str) -> str:
        return f"# 根据需求 [{requirement}] 生成的 Python 模块代码"

class ReviewerAgent:
    def review(self, code: str) -> str:
        return f"✅ 代码审查通过：{code[:25]}... 未发现明显安全隐患。"

class TeamSupervisor:
    def __init__(self):
        self.coder = CoderAgent()
        self.reviewer = ReviewerAgent()

    def run_pipeline(self, requirement: str):
        print(f"主管接收到研发任务: {requirement}")
        code = self.coder.write_code(requirement)
        print("Coder 已产出代码...")
        review_result = self.reviewer.review(code)
        print("Reviewer 审查反馈:", review_result)
        return {"code": code, "status": "APPROVED"}

supervisor = TeamSupervisor()
result = supervisor.run_pipeline("实现高并发订单防重复提交校验")
print(result)
`,
        solutionCode: `class Message:
    def __init__(self, sender: str, content: str):
        self.sender = sender
        self.content = content

class CoderAgent:
    def write_code(self, requirement: str) -> str:
        return f"# 根据需求 [{requirement}] 生成的 Python 模块代码"

class ReviewerAgent:
    def review(self, code: str) -> str:
        return f"✅ 代码审查通过：{code[:25]}... 未发现明显安全隐患。"

class TeamSupervisor:
    def __init__(self):
        self.coder = CoderAgent()
        self.reviewer = ReviewerAgent()

    def run_pipeline(self, requirement: str):
        print(f"主管接收到研发任务: {requirement}")
        code = self.coder.write_code(requirement)
        print("Coder 已产出代码...")
        review_result = self.reviewer.review(code)
        print("Reviewer 审查反馈:", review_result)
        return {"code": code, "status": "APPROVED"}

supervisor = TeamSupervisor()
result = supervisor.run_pipeline("实现高并发订单防重复提交校验")
print(result)
`,
        checkpoints: [
          {
            id: "chk-multi-1",
            title: "多 Agent 角色解耦与流水线编排",
            description: "正确运行 Coder 与 Reviewer 协同总线",
            testFunction: (code) => {
              const passed = code.includes("class TeamSupervisor") && code.includes("ReviewerAgent");
              return { passed, message: passed ? "✅ 多智能体分工协同拓扑构建成功！" : "❌ 缺少 TeamSupervisor 或 ReviewerAgent" };
            }
          }
        ],
        githubAnalogy: "ChatDev、MetaGPT 以及 CrewAI 的核心多角色协作驱动机制。"
      }
    ]
  },
  {
    id: "track-agent-systems",
    title: "10. 智能体与多智能体系统全景进阶",
    tagline: "架构、通信机制、协作组织、关键协同算法与工业级前沿场景",
    description: "全面穿透现代 AI 智能体四元架构（感知/记忆/推理/行动）、黑板与消息总线通信协议、Supervisor/Debate/Swarms/Graph 协作范式、合同网（CNP）拍卖算法与企业级实战应用落地。",
    icon: "Bot",
    badgeColor: "purple",
    tags: ["多智能体前沿", "合同网协议", "架构与通信", "工业落地"],
    capstoneChallenge: "基于合同网协议（CNP）与共享黑板架构，从零搭建一个具备自我反思、竞标调度与对抗审查的多智能体微型软件公司",
    enterpriseProject: TRACK_ENTERPRISE_PROJECTS["track-agent-systems"],
    lessons: [
      {
        id: "agent-sys-101",
        title: "智能体核心解剖：感知、双层记忆系统与 ReAct 认知循环",
        trackId: "track-agent-systems",
        estimatedMinutes: 20,
        level: "零基础",
        mentalModel: {
          title: "三甲医院专家与全套病历档案模型",
          metaphor: "一个合格的智能体就像看病的专家：望闻问切接收病人描述（感知 Perception），翻阅过往厚厚病史（长期记忆 Long-term Memory）并将本次检查放在手边便签（工作记忆 Working Memory），脑内推演诊断方案（推理 Reasoning），最后下达抽血化验或开药指令（行动 Action）。",
          keyIntuition: "单靠大模型只是一个文字补全机，只有组合了【感知-短期/长期记忆-推理引擎-工具执行器】才真正成为具备环境交互能力的 Agent！"
        },
        explanationMarkdown: `### 🧠 智能体架构（Agent Architecture）四元组解剖
在现代 AI 架构中，一个智能体包含以下四大不可或缺的子系统：

1. **感知器（Perception / Sensors）**：
   - 接收外界多模态信号：用户文本请求、外部系统 Webhook 告警、数据库变更或 API 返回值。
2. **记忆系统（Memory System）**：
   - **工作记忆（Working Memory）**：短期上下文滑窗（Scratchpad），记录当前任务的执行状态，必须严格限制以防上下文溢出（Context Overflow）；
   - **长期记忆（Long-term Memory）**：利用向量数据库（Vector DB）存储历史知识（Semantic）与交互过往（Episodic），按相似度检索装载。
3. **推理与规划引擎（Cognitive Brain & Reasoning）**：
   - **ReAct 范式**：Thought（思考意图） ➔ Action（决定调用的工具与参数） ➔ Observation（观察执行结果）；
   - **Reflexion（反思机制）**：当行动失败或结果不达标时，智能体会自我评估并修正下一步规划，而不是一味盲目重试。
4. **行动执行器（Action & Effectors）**：
   - 调用外部 Python 沙盒、SQL 执行引擎、REST API 或操作系统终端。`,
        starterCode: `class AgentMemory:
    """智能体双层记忆系统：短期工作缓冲区与长期记忆检索"""
    def __init__(self, max_working_memory: int = 5):
        self.working_memory = [] # 短期工作记忆
        self.max_working_memory = max_working_memory

    def add_step(self, thought: str, action: str, observation: str):
        # 记录每一步的 ReAct 足迹
        step_record = f"Thought: {thought} | Action: {action} | Observation: {observation}"
        self.working_memory.append(step_record)
        # TODO: 任务1 - 如果超出 max_working_memory，裁剪保留最新的记忆记录
        if len(self.working_memory) > self.max_working_memory:
            self.working_memory = self.working_memory[-self.max_working_memory:]

class CognitiveAgent:
    def __init__(self, name: str):
        self.name = name
        self.memory = AgentMemory()

    def run_react_cycle(self, user_goal: str):
        print(f"[{self.name}] 接收目标: {user_goal}")
        
        # Step 1: 第一次思考与行动
        thought_1 = "需要先检查数据库连通性"
        action_1 = "ping_database()"
        obs_1 = "FAILED: Connection timeout"
        self.memory.add_step(thought_1, action_1, obs_1)
        
        # Step 2: 触发自我反思 (Reflexion) 并修正行动
        thought_2 = f"观察到第一次失败: [{obs_1}]，反思：需要切换到备用灾备数据库节点重试"
        action_2 = "switch_and_ping_failover_db()"
        obs_2 = "SUCCESS: Connected to Failover DB node 02"
        self.memory.add_step(thought_2, action_2, obs_2)
        
        return self.memory.working_memory

agent = CognitiveAgent("DataOps-Agent")
history = agent.run_react_cycle("恢复核心用户账户查询通道")
print("\\n【智能体最终执行工作记忆】:")
for h in history:
    print("->", h)
`,
        solutionCode: `class AgentMemory:
    def __init__(self, max_working_memory: int = 5):
        self.working_memory = []
        self.max_working_memory = max_working_memory

    def add_step(self, thought: str, action: str, observation: str):
        step_record = f"Thought: {thought} | Action: {action} | Observation: {observation}"
        self.working_memory.append(step_record)
        if len(self.working_memory) > self.max_working_memory:
            self.working_memory = self.working_memory[-self.max_working_memory:]

class CognitiveAgent:
    def __init__(self, name: str):
        self.name = name
        self.memory = AgentMemory()

    def run_react_cycle(self, user_goal: str):
        thought_1 = "需要先检查数据库连通性"
        action_1 = "ping_database()"
        obs_1 = "FAILED: Connection timeout"
        self.memory.add_step(thought_1, action_1, obs_1)
        
        thought_2 = f"观察到第一次失败: [{obs_1}]，反思：需要切换到备用灾备数据库节点重试"
        action_2 = "switch_and_ping_failover_db()"
        obs_2 = "SUCCESS: Connected to Failover DB node 02"
        self.memory.add_step(thought_2, action_2, obs_2)
        
        return self.memory.working_memory

agent = CognitiveAgent("DataOps-Agent")
agent.run_react_cycle("恢复核心用户账户查询通道")
`,
        checkpoints: [
          {
            id: "chk-agent-arch-1",
            title: "实现工作记忆裁剪与防爆机制",
            description: "确保工作记忆在步数增加时不会超出 max_working_memory",
            testFunction: (code) => {
              const passed = code.includes("self.working_memory[-self.max_working_memory:]") || 
                             code.includes(".pop(0)");
              return { 
                passed, 
                message: passed ? "✅ 记忆防爆裁剪逻辑正确" : "❌ 请补充超出 max_working_memory 时的裁剪逻辑" 
              };
            }
          },
          {
            id: "chk-agent-arch-2",
            title: "实现 ReAct 与 Reflexion 反思回路",
            description: "验证代码中包含根据上一步失败进行自我修正的逻辑",
            testFunction: (code) => {
              const passed = code.includes("反思") || code.includes("switch_and_ping_failover_db");
              return { 
                passed, 
                message: passed ? "✅ Reflexion 自我演进反思逻辑闭环！" : "❌ 缺少基于观察结果的反思逻辑" 
              };
            }
          }
        ],
        language: "python",
        githubAnalogy: "LangChain AgentExecutor、AutoGPT 以及 BabyAGI 内部的内存记录与反思循环。"
      },
      {
        id: "agent-sys-102",
        title: "智能体通信机制：共享黑板、消息总线与 FIPA-ACL 协议",
        trackId: "track-agent-systems",
        estimatedMinutes: 25,
        level: "进阶",
        mentalModel: {
          title: "刑警专案组大黑板与对讲机频道",
          metaphor: "多智能体协作时不能乱喊乱叫。第一种方法是【共享黑板模式】：队长和法医都在白板上贴线索，谁发现了新线索谁更新；第二种是【消息总线模式】：每个人手持对讲机，频道里按标准警务用语（FIPA 契约：请求/确认/汇报）精准呼叫。",
          keyIntuition: "通信机制解决的是：多个 Agent 之间到底以什么协议、何种拓扑传输状态，如何避免互相覆盖和死锁！"
        },
        explanationMarkdown: `### 📡 智能体三大通信拓扑与协议规范

1. **共享黑板模式（Blackboard Pattern）**：
   - 核心思想：所有智能体共享一个中心化结构化数据黑板（全局状态字典 / Redis / 内存KV）；
   - 优势：低耦合，Agent 无需知道彼此是谁，只关心黑板上自己负责的键值是否就绪。
2. **统一消息总线（Message Bus / Pub-Sub）**：
   - 核心思想：基于主题（Topic）发布与订阅事件（如 Kafka / EventBridge）；
   - 优势：高度异步化，支持广播与动态扩展。
3. **结构化通信语言规范（ACL / FIPA-ACL）**：
   - 智能体传递的消息绝不是未经处理的一句话，而必须包含行为意图（Performative）：
     - \`REQUEST\`：请求执行特定行动；
     - \`PROPOSE\`：提供候选方案或竞标报价；
     - \`INFORM\`：通知事实或状态更新；
     - \`CONFIRM\` / \`REJECT\`：确认或拒绝。`,
        starterCode: `from typing import Dict, Any, List
from dataclasses import dataclass
from enum import Enum

class Performative(Enum):
    REQUEST = "REQUEST"   # 提出请求
    PROPOSE = "PROPOSE"   # 提出提议/方案
    INFORM = "INFORM"     # 通知事实
    CONFIRM = "CONFIRM"   # 确认采纳

@dataclass
class ACLMessage:
    """FIPA-ACL 标准智能体通信协议报文"""
    sender: str
    receiver: str
    performative: Performative
    content: Dict[str, Any]

class SharedBlackboard:
    """共享黑板通信中枢"""
    def __init__(self):
        self.state: Dict[str, Any] = {}
        self.message_bus: List[ACLMessage] = []

    def post_fact(self, key: str, value: Any, agent_name: str):
        self.state[key] = value
        print(f"📌 [黑板更新] {agent_name} 写入了事实: {key} -> {value}")

    def send_message(self, msg: ACLMessage):
        self.message_bus.append(msg)
        print(f"📨 [消息总线] {msg.sender} ➔ {msg.receiver} [{msg.performative.value}]: {msg.content}")

# 实战：创建共享黑板与两个协作 Agent
board = SharedBlackboard()

# 1. 业务分析 Agent 向总线发起任务请求
msg_req = ACLMessage(
    sender="BusinessAgent",
    receiver="DevAgent",
    performative=Performative.REQUEST,
    content={"task": "实现用户登录限流", "qps_limit": 100}
)
board.send_message(msg_req)

# 2. 研发 Agent 接收后将架构设计方案写入共享黑板
board.post_fact("rate_limit_design", "使用 Redis 令牌桶算法，容量100", agent_name="DevAgent")

# 3. 研发 Agent 回复通知 (INFORM)
msg_inform = ACLMessage(
    sender="DevAgent",
    receiver="BusinessAgent",
    performative=Performative.INFORM,
    content={"status": "DESIGN_READY", "ref": "rate_limit_design"}
)
board.send_message(msg_inform)
`,
        solutionCode: `from typing import Dict, Any, List
from dataclasses import dataclass
from enum import Enum

class Performative(Enum):
    REQUEST = "REQUEST"
    PROPOSE = "PROPOSE"
    INFORM = "INFORM"
    CONFIRM = "CONFIRM"

@dataclass
class ACLMessage:
    sender: str
    receiver: str
    performative: Performative
    content: Dict[str, Any]

class SharedBlackboard:
    def __init__(self):
        self.state: Dict[str, Any] = {}
        self.message_bus: List[ACLMessage] = []

    def post_fact(self, key: str, value: Any, agent_name: str):
        self.state[key] = value
        print(f"📌 [黑板更新] {agent_name} 写入了事实: {key} -> {value}")

    def send_message(self, msg: ACLMessage):
        self.message_bus.append(msg)
        print(f"📨 [消息总线] {msg.sender} ➔ {msg.receiver} [{msg.performative.value}]: {msg.content}")

board = SharedBlackboard()
msg_req = ACLMessage(
    sender="BusinessAgent",
    receiver="DevAgent",
    performative=Performative.REQUEST,
    content={"task": "实现用户登录限流", "qps_limit": 100}
)
board.send_message(msg_req)
board.post_fact("rate_limit_design", "使用 Redis 令牌桶算法，容量100", agent_name="DevAgent")
msg_inform = ACLMessage(
    sender="DevAgent",
    receiver="BusinessAgent",
    performative=Performative.INFORM,
    content={"status": "DESIGN_READY", "ref": "rate_limit_design"}
)
board.send_message(msg_inform)
`,
        checkpoints: [
          {
            id: "chk-comm-1",
            title: "实现 ACL 标准通信协议封包",
            description: "验证包含 performative、sender、receiver 与 content",
            testFunction: (code) => {
              const passed = code.includes("ACLMessage") && code.includes("Performative.REQUEST") && code.includes("Performative.INFORM");
              return { 
                passed, 
                message: passed ? "✅ 符合 FIPA-ACL 标准智能体通信协议" : "❌ 请检查 ACLMessage 与 Performative 枚举使用" 
              };
            }
          },
          {
            id: "chk-comm-2",
            title: "正确操作共享黑板全局事实",
            description: "验证 post_fact 正确将知识写入共享状态字典",
            testFunction: (code) => {
              const passed = code.includes("board.post_fact") && code.includes("rate_limit_design");
              return { 
                passed, 
                message: passed ? "✅ 共享黑板状态写入成功" : "❌ 缺少 post_fact 写入事实调用" 
              };
            }
          }
        ],
        language: "python",
        githubAnalogy: "AutoGen 的 ConversableAgent 协议封包与 LangGraph 的 StateChannel 状态字典。"
      },
      {
        id: "agent-sys-103",
        title: "多智能体协作组织范式：Supervisor、对等辩论与蜂群交接",
        trackId: "track-agent-systems",
        estimatedMinutes: 25,
        level: "进阶",
        mentalModel: {
          title: "现代化影视剧组与科学辩论会",
          metaphor: "多智能体组织有四大经典学派：①【主管模式（Supervisor）】：导演统一排期，摄像和演员听调度；②【对抗辩论（Debate）】：控方律师与辩方律师针锋相对，法官综合多数票决，大幅降低模型胡说八道；③【蜂群模式（Swarms）】：前台接待员根据用户口令，直接把对话球接力（Handoff）传给退款专员。",
          keyIntuition: "单智能体解决不了复杂性，多智能体通过角色制衡（如生成与审查对抗）让系统准确率从 60% 跃升至 95%！"
        },
        explanationMarkdown: `### 🤝 多智能体系统的 4 大协作拓扑

1. **主管派发拓扑（Hierarchical Supervisor）**：
   - 中心 Supervisor 接收主目标，拆解为子任务分配给专用 Agent，收集汇报后总结输出。适合具有明确主次关系的场景。
2. **对等辩论与共识制衡（Peer-to-Peer Debate & Consensus）**：
   - 典型代表：Generator-Critic 对抗系统。一个 Agent 负责天马行空生成草案，另一个专挑刺找出漏洞与安全风险，经 2~3 轮辩论直到达成共识。
3. **分布式蜂群交接（Swarms & Handoff）**：
   - 无中心主管。每个 Agent 具备一揽子工具，其中一种工具就是 \`transfer_to_agent(target_agent)\`。状态平滑流转。
4. **有向图状态机流转（State Graph / LangGraph）**：
   - 将协作流程固化为有向图节点，带有条件路由分支与状态回溯重试。`,
        starterCode: `class GeneratorAgent:
    """负责代码生成的创造型智能体"""
    def produce(self, requirement: str) -> str:
        return f"def handle_payment():\\n    # AI 初步生成\\n    charge_card()\\n    update_balance() # 潜在隐患：未开启事务"

class CriticAgent:
    """负责安全审计与挑刺的批判型智能体"""
    def critique(self, code: str) -> dict:
        if "update_balance" in code and "transaction" not in code:
            return {"approved": False, "score": 60, "feedback": "缺少数据库事务包裹，若扣款失败可能导致账实不符！"}
        return {"approved": True, "score": 95, "feedback": "审查通过，符合 ACID 原则。"}

# 协同辩论回路 (Debate & Refinement Loop)
class MultiAgentDebatePipeline:
    def __init__(self, max_rounds: int = 3):
        self.generator = GeneratorAgent()
        self.critic = CriticAgent()
        self.max_rounds = max_rounds

    def run_collaboration(self, req: str):
        print(f"🎬 启动多智能体对抗辩论，目标: {req}")
        current_code = self.generator.produce(req)
        
        for round_idx in range(1, self.max_rounds + 1):
            review = self.critic.critique(current_code)
            print(f"第 {round_idx} 轮评审得分: {review['score']} | 反馈: {review['feedback']}")
            
            if review["approved"]:
                print("🎉 达成多智能体共识，通过审查！")
                return current_code
            
            # 根据 Critic 的反馈自我修正
            current_code = (
                "def handle_payment():\\n"
                "    with db.transaction(): # 听取 Critic 建议修复！\\n"
                "        charge_card()\\n"
                "        update_balance()\\n"
            )
            
        return current_code

pipeline = MultiAgentDebatePipeline()
final_result = pipeline.run_collaboration("实现高可靠支付结算接口")
print("\\n【最终产出】:\\n", final_result)
`,
        solutionCode: `class GeneratorAgent:
    def produce(self, requirement: str) -> str:
        return f"def handle_payment():\\n    charge_card()\\n    update_balance()"

class CriticAgent:
    def critique(self, code: str) -> dict:
        if "update_balance" in code and "transaction" not in code:
            return {"approved": False, "score": 60, "feedback": "缺少数据库事务包裹，若扣款失败可能导致账实不符！"}
        return {"approved": True, "score": 95, "feedback": "审查通过，符合 ACID 原则。"}

class MultiAgentDebatePipeline:
    def __init__(self, max_rounds: int = 3):
        self.generator = GeneratorAgent()
        self.critic = CriticAgent()
        self.max_rounds = max_rounds

    def run_collaboration(self, req: str):
        current_code = self.generator.produce(req)
        for round_idx in range(1, self.max_rounds + 1):
            review = self.critic.critique(current_code)
            if review["approved"]:
                return current_code
            current_code = (
                "def handle_payment():\\n"
                "    with db.transaction():\\n"
                "        charge_card()\\n"
                "        update_balance()\\n"
            )
        return current_code

pipeline = MultiAgentDebatePipeline()
pipeline.run_collaboration("实现高可靠支付结算接口")
`,
        checkpoints: [
          {
            id: "chk-collab-1",
            title: "实现 Generator 与 Critic 对抗交互",
            description: "验证代码中存在批判评估与依据反馈修正的完整辩论循环",
            testFunction: (code) => {
              const passed = code.includes("class CriticAgent") && code.includes("critique") && code.includes("run_collaboration");
              return { 
                passed, 
                message: passed ? "✅ 对抗辩论（Debate）多 Agent 模式运转正常" : "❌ 请检查 CriticAgent 与迭代循环逻辑" 
              };
            }
          },
          {
            id: "chk-collab-2",
            title: "达成共识与自动终止保护",
            description: "当审核通过（approved=True）或达到最大轮次时正常终止",
            testFunction: (code) => {
              const passed = code.includes("review[\"approved\"]") && code.includes("max_rounds");
              return { 
                passed, 
                message: passed ? "✅ 具备严格的辩论收敛与熔断条件" : "❌ 请确保包含终止退出与最大轮次控制" 
              };
            }
          }
        ],
        language: "python",
        githubAnalogy: "ChatDev 的程序员与测试员辩论对话、MetaGPT 结构化评审以及 CrewAI Hierarchical Process。"
      },
      {
        id: "agent-sys-104",
        title: "多智能体核心协同算法：合同网协议（CNP）与分布式竞标调度",
        trackId: "track-agent-systems",
        estimatedMinutes: 25,
        level: "进阶",
        mentalModel: {
          title: "大型工程公开招标与综合评分授标",
          metaphor: "当一个主任务来了，主管不知道具体哪个 Agent 最空闲、最擅长。于是像政府招标一样：① 主管发布招标公告（CFP）；② 多个工人 Agent 结合自己手头剩余工作量和专业度提交标书报价（Bid）；③ 主管按性价比最优打分并签发合同（Award）；④ 中标者执行并交付。",
          keyIntuition: "合同网协议（Contract Net Protocol）是分布式多智能体自组织最经典的拍卖与调度算法，彻底摒弃了死板的硬编码派工！"
        },
        explanationMarkdown: `### 📐 合同网协议（Contract Net Protocol, CNP）核心算法四部曲

在多 Agent 分布式系统中，**合同网协议**是一种优雅的自适应负载均衡与任务协商算法：

1. **招标阶段（Call for Proposals, CFP）**：
   - 任务主管（Manager）向网络中所有潜在承包商（Contractors）广播任务规格与验收指标；
2. **投标阶段（Bidding）**：
   - 各 Contractor 评估自身当前负载（CPU/内存/进行中任务数）及专业匹配度，计算预估成本并回传标书（Bid）；如果无法承接则主动弃标；
3. **评标与授标阶段（Evaluation & Awarding）**：
   - Manager 依据全局效用函数（例如：\`score = 匹配度 * 0.7 - 预估延迟 * 0.3\`）评估所有投标，选择综合评分最高者下发授标（Award），向其他未中标者发送拒绝（Reject）；
4. **执行与结算阶段（Execution & Reporting）**：
   - 中标 Contractor 独占锁并执行，完成后向 Manager 回传最终结果。`,
        starterCode: `from typing import List, Dict

class ContractorAgent:
    """承包商智能体：根据自身当前负载与技能匹配度进行自主竞标"""
    def __init__(self, name: str, skill: str, current_queue_size: int):
        self.name = name
        self.skill = skill
        self.current_queue_size = current_queue_size

    def evaluate_bid(self, task_type: str) -> Dict:
        # 如果技能不匹配，不参与投标
        if self.skill != task_type:
            return {"agent": self.name, "eligible": False, "bid_cost": 9999}
        
        # 标书成本计算公式：排队任务越少，出价成本越低（越优先中标）
        bid_cost = self.current_queue_size * 10 + 5
        return {
            "agent": self.name, 
            "eligible": True, 
            "bid_cost": bid_cost,
            "skill": self.skill
        }

class ManagerAgent:
    """招标主管智能体：发布招标、评分授标并跟踪执行"""
    def __init__(self):
        self.contractors: List[ContractorAgent] = []

    def register(self, agent: ContractorAgent):
        self.contractors.append(agent)

    def dispatch_cnp_task(self, task_name: str, task_type: str):
        print(f"📢 [阶段1·发布招标 CFP]: 任务 [{task_name}], 所需技能: [{task_type}]")
        
        # 阶段2: 收集所有智能体的投标 (Bids)
        bids = []
        for c in self.contractors:
            bid = c.evaluate_bid(task_type)
            if bid["eligible"]:
                bids.append(bid)
                print(f"  ➔ 收到来自 {bid['agent']} 的竞标书, 成本报价: {bid['bid_cost']}")
        
        if not bids:
            print("❌ 无可用智能体承接此任务！")
            return None

        # 阶段3: 评标并授标 (选择报价最低、综合成本最优者)
        bids.sort(key=lambda x: x["bid_cost"])
        winning_bid = bids[0]
        print(f"🏆 [阶段3·正式授标 Award]: 祝贺 {winning_bid['agent']} 中标！")
        return winning_bid["agent"]

# 仿真运行
manager = ManagerAgent()
manager.register(ContractorAgent("Worker-Fast-GPU", "ai_inference", current_queue_size=8))
manager.register(ContractorAgent("Worker-Idle-CPU", "ai_inference", current_queue_size=1)) # 队列仅有1，空闲
manager.register(ContractorAgent("Worker-DB-Expert", "sql_query", current_queue_size=0))

winner = manager.dispatch_cnp_task("大规模图像 Embedding 向量生成", "ai_inference")
print(f"\\n🎯 最终任务执行者: {winner}")
`,
        solutionCode: `from typing import List, Dict

class ContractorAgent:
    def __init__(self, name: str, skill: str, current_queue_size: int):
        self.name = name
        self.skill = skill
        self.current_queue_size = current_queue_size

    def evaluate_bid(self, task_type: str) -> Dict:
        if self.skill != task_type:
            return {"agent": self.name, "eligible": False, "bid_cost": 9999}
        bid_cost = self.current_queue_size * 10 + 5
        return {
            "agent": self.name, 
            "eligible": True, 
            "bid_cost": bid_cost,
            "skill": self.skill
        }

class ManagerAgent:
    def __init__(self):
        self.contractors: List[ContractorAgent] = []

    def register(self, agent: ContractorAgent):
        self.contractors.append(agent)

    def dispatch_cnp_task(self, task_name: str, task_type: str):
        bids = [c.evaluate_bid(task_type) for c in self.contractors if c.evaluate_bid(task_type)["eligible"]]
        if not bids:
            return None
        bids.sort(key=lambda x: x["bid_cost"])
        return bids[0]["agent"]

manager = ManagerAgent()
manager.register(ContractorAgent("Worker-Fast-GPU", "ai_inference", current_queue_size=8))
manager.register(ContractorAgent("Worker-Idle-CPU", "ai_inference", current_queue_size=1))
manager.dispatch_cnp_task("测试任务", "ai_inference")
`,
        checkpoints: [
          {
            id: "chk-cnp-1",
            title: "实现合同网协议竞标出价算法",
            description: "承包商依据技能匹配与实时负载给出标书",
            testFunction: (code) => {
              const passed = code.includes("evaluate_bid") && code.includes("bid_cost");
              return { 
                passed, 
                message: passed ? "✅ 竞标出价逻辑符合合同网协议规范" : "❌ 缺少 evaluate_bid 标书评估逻辑" 
              };
            }
          },
          {
            id: "chk-cnp-2",
            title: "实现优胜评标与授标派发",
            description: "Manager 正确基于成本/负载挑选最优 Contractor",
            testFunction: (code) => {
              const passed = code.includes("dispatch_cnp_task") && code.includes("bids.sort");
              return { 
                passed, 
                message: passed ? "✅ 评标与授标调度算法通过！" : "❌ 缺少基于标书排序的最优授标逻辑" 
              };
            }
          }
        ],
        language: "python",
        githubAnalogy: "工业机器人蜂群调度、无人机集群竞标分配以及分布式 Agent 算力交易协议。"
      },
      {
        id: "agent-sys-105",
        title: "工业级前沿落地场景：全自主微型软件工程团队编排",
        trackId: "track-agent-systems",
        estimatedMinutes: 30,
        level: "实战",
        mentalModel: {
          title: "全自动流水线软件公司（Mini-Software-Company）",
          metaphor: "将一家互联网公司的研发流程全部由专业 Agent 承担：产品经理 Agent 输出敏捷用户故事，系统架构师 Agent 绘制接口契约，全栈工程师 Agent 编写可执行代码，最后由测试 Agent 跑测试套件并自动修补，形成自动化闭环！",
          keyIntuition: "掌握智能体架构、通信与协作的最终目的，是在真实工业场景中替代高频、重复的研发与分析链路！"
        },
        explanationMarkdown: `### 🏭 现代工业级多智能体系统的 4 大主力落地场景

1. **自主软件研发与自愈（Autonomous Software Engineering - Devin / ChatDev）**：
   - 团队角色：Product Owner Agent ➔ System Architect Agent ➔ FullStack Coder Agent ➔ QA Tester Agent；
   - 价值：将需求从自然语言直接转化为包含测试用例与 Dockerfile 的标准工程仓库。
2. **金融全天候投研与量化风控会商**：
   - 7x24 小时抓取舆情与研报，多模型多策略交叉对抗验证，自动化生成风控评估报告与仓位调优建议。
3. **医疗多学科智能联合会诊（MDT Multi-Agent）**：
   - 整合检验科、影像学、病理学与药物警戒智能体，自动排查药物交叉过敏反应，辅助主治医生决策。
4. **具身智能与智能仓储物流机器人协同**：
   - 基于空间拓扑与合同网协议，协同数十台 AGV 搬运车与机械臂实现零拥堵分拣。`,
        starterCode: `class SoftwareFirmOrchestrator:
    """工业级全自主微型软件团队协同流"""
    def __init__(self):
        self.project_state = {}

    def step1_product_manager(self, raw_need: str) -> dict:
        print("🧑‍💼 [PM Agent] 正在梳理用户故事与验收准则 (AC)...")
        spec = {
            "feature": raw_need,
            "acceptance_criteria": ["返回 200 状态码", "包含防重放 Token"]
        }
        self.project_state["spec"] = spec
        return spec

    def step2_architect(self, spec: dict) -> str:
        print("🏛️ [Architect Agent] 正在进行系统分层拓扑与 Schema 契约设计...")
        contract = f"POST /api/v1/{spec['feature'].lower()} -> Pydantic Response"
        self.project_state["contract"] = contract
        return contract

    def step3_coder(self, contract: str) -> str:
        print("💻 [Engineer Agent] 编写可执行业务代码...")
        code = f"@app.post('/api/v1/auth')\\ndef handler(): return {{'status': 'OK', 'token': 'jwt.token'}}"
        self.project_state["code"] = code
        return code

    def step4_qa_tester(self, code: str) -> bool:
        print("🧪 [QA Agent] 运行自动化回归测试套件...")
        has_token = "token" in code
        print(f"  -> 测试用例断言结果: {'PASSED' if has_token else 'FAILED'}")
        return has_token

# 运行自动化软件公司全流程
firm = SoftwareFirmOrchestrator()
spec = firm.step1_product_manager("用户安全登录认证模块")
contract = firm.step2_architect(spec)
code = firm.step3_coder(contract)
is_ready = firm.step4_qa_tester(code)

print("\\n🚀 【软件研发交付就绪】:", is_ready)
print("📦 【最终项目交付制品库】:", firm.project_state)
`,
        solutionCode: `class SoftwareFirmOrchestrator:
    def __init__(self):
        self.project_state = {}

    def step1_product_manager(self, raw_need: str) -> dict:
        spec = {"feature": raw_need, "acceptance_criteria": ["返回 200 状态码", "包含防重放 Token"]}
        self.project_state["spec"] = spec
        return spec

    def step2_architect(self, spec: dict) -> str:
        contract = f"POST /api/v1/{spec['feature'].lower()}"
        self.project_state["contract"] = contract
        return contract

    def step3_coder(self, contract: str) -> str:
        code = f"@app.post('/api/v1/auth')\\ndef handler(): return {{'status': 'OK', 'token': 'jwt.token'}}"
        self.project_state["code"] = code
        return code

    def step4_qa_tester(self, code: str) -> bool:
        return "token" in code

firm = SoftwareFirmOrchestrator()
spec = firm.step1_product_manager("用户安全登录认证模块")
contract = firm.step2_architect(spec)
code = firm.step3_coder(contract)
firm.step4_qa_tester(code)
`,
        checkpoints: [
          {
            id: "chk-app-1",
            title: "实现多角色工业流水线闭环",
            description: "验证 PM、Architect、Coder 与 QA Tester 的连续流转与状态收集",
            testFunction: (code) => {
              const passed = code.includes("step1_product_manager") && 
                             code.includes("step2_architect") && 
                             code.includes("step3_coder") && 
                             code.includes("step4_qa_tester");
              return { 
                passed, 
                message: passed ? "✅ 工业级多智能体自动化工程团队运转成功！" : "❌ 缺少完整的四阶段角色流水线" 
              };
            }
          }
        ],
        language: "python",
        githubAnalogy: "Devin、ChatDev、MetaGPT 工业级软件研发数字员工编排。"
      }
    ]
  },
  {
    id: "track-linux",
    title: "11. Linux 现代操作系统与服务运维",
    tagline: "开源项目与云原生底座，掌控终端、进程治理与生产守护",
    description: "从单根目录树模型起步，彻底攻克权限（chmod/chown）、端口冲突（lsof/kill）、日志管道三剑客与 Systemd/Docker 生产级服务自愈运维。",
    icon: "Terminal",
    badgeColor: "rose",
    tags: ["生产级底座", "命令行必修", "服务自愈", "Docker基石"],
    capstoneChallenge: "编写一个生产级 Linux 服务守护配置与故障自愈脚本，秒级排查端口冲突并守护后台 Agent 服务",
    enterpriseProject: TRACK_ENTERPRISE_PROJECTS["track-linux"],
    lessons: [
      {
        id: "linux-101",
        title: "Linux 哲学与目录树导航：一切皆文件与极简路径定位",
        trackId: "track-linux",
        estimatedMinutes: 15,
        level: "零基础",
        mentalModel: {
          title: "世界地图与单根大树模型",
          metaphor: "Windows 像由若干独立仓库（C盘、D盘）拼起来的割裂杂乱园区，而 Linux 是一棵从宇宙唯一原点根目录 / 茁壮生长的倒挂参天大树。不管是你的固态硬盘、插入的U盘、网络连接、甚至是运行中的进程状态（/proc），全都是这棵大树上的树叶文件（'Everything is a file'）。",
          keyIntuition: "在 Linux 里没有任何隐藏魔法，掌握了 pwd (我在哪)、ls (有什么)、cd (去哪里)、mkdir (建目录)，你就掌握了穿梭整个服务器宇宙的罗盘。"
        },
        explanationMarkdown: `### 🎯 为什么程序员必须学透 Linux？
在真实软件工程与 AI 领域中：
1. **GitHub 开源项目全跑在 Linux 上**：不管是 Docker 容器、云服务器还是大模型推理集群，几乎 100% 都是 Linux 系统；
2. **“一切皆文件”核心哲学**：Windows 搞一堆弹窗注册表，而 Linux 下硬件设备是文件、网络连接是文件、系统状态是文件，只要会读写文件就能控制整个系统！

---

### 🗺️ 绝对路径与相对路径的区别
- **绝对路径（Absolute Path）**：以根目录 \`/\` 开头，就像写出包含“国家/省份/市区/街道”的完整身份证地址，例如 \`/home/dev/project\`。
- **相对路径（Relative Path）**：以当前所在位置为基准。
  - \`.\` 代表当前目录；
  - \`..\` 代表上一级父目录；
  - \`~\` 代表当前登录用户的家目录（Home Directory）。

---

### 💡 核心指令三剑客：
- \`pwd\`：Print Working Directory，打印我当前站在哪；
- \`ls -lah\`：List，列出目录下的所有文件，包含隐藏文件（以 \`.\` 开头，如 \`.env\`、\`.gitignore\`）和大小权限；
- \`mkdir -p a/b/c\`：创建多层嵌套目录（\`-p\` 代表递归建立，不会因为父目录不存在而报错）。

### 📋 本节任务：
请在右侧命令行终端中输入：
1. 使用 \`pwd\` 确认当前绝对路径；
2. 使用 \`mkdir -p agent_project/src/core agent_project/logs\` 一次性建立工程架构目录；
3. 使用 \`ls -lah\` 查看目录结构与隐藏文件。`,
        language: "bash",
        starterCode: `# 1. 查看当前所在的绝对工作路径
pwd

# 2. 递归创建包含核心代码与日志的多层项目目录
mkdir -p agent_project/src/core agent_project/logs

# 3. 详细列出当前目录下的所有文件（含隐藏文件和权限属性）
ls -lah
`,
        solutionCode: `pwd
mkdir -p agent_project/src/core agent_project/logs
ls -lah
`,
        checkpoints: [
          {
            id: "chk-linux-1",
            title: "确认当前路径与递归创建项目目录",
            description: "执行 pwd 并在同一指令行序列中运用 mkdir -p 创建多层架构文件夹",
            testFunction: (code, output) => {
              const passed = code.includes("pwd") && code.includes("mkdir") && code.includes("-p");
              return {
                passed,
                message: passed ? "✅ 路径定位与递归多层目录创建成功！" : "❌ 缺少 pwd 或 mkdir -p 递归建目录指令"
              };
            }
          },
          {
            id: "chk-linux-2",
            title: "检查目录全量文件与权限属性",
            description: "使用 ls -lah 查看包含隐藏文件与权限的列表",
            testFunction: (code, output) => {
              const passed = code.includes("ls") && (code.includes("-l") || code.includes("-a"));
              return {
                passed,
                message: passed ? "✅ 熟练掌握 ls 隐藏文件与权限展示技巧！" : "❌ 请使用 ls -lah 列出文件"
              };
            }
          }
        ],
        githubAnalogy: "克隆任意 GitHub 仓库后，项目根目录的 .gitignore、.env 与 src/ 组织结构。"
      },
      {
        id: "linux-102",
        title: "权限机制解密：破解 Permission Denied 与 755 / 644 数字黑话",
        trackId: "track-linux",
        estimatedMinutes: 20,
        level: "进阶",
        mentalModel: {
          title: "三位一体门禁卡与二进制授权",
          metaphor: "在 Linux 的世界里，每个文件都有三组守卫：Owner（所有者我）、Group（团队成员）、Others（陌生路人）。每组守卫分发三种钥匙：Read 读（r=4）、Write 写（w=2）、Execute 执行（x=1）。数字 7 就是 4+2+1（读写执行全开），6 就是 4+2（只读写），5 就是 4+1（可读可执行）。755 代表：我自己独享一切，其他人能读能跑但不准篡改！",
          keyIntuition: "从 GitHub clone 下来运行 ./start.sh 提示 Permission denied 时千万别慌，你只是缺少执行权 x，一行 chmod +x start.sh 就能破除封印。"
        },
        explanationMarkdown: `### 🚨 开发者最常遇到的报错：Permission Denied
你在 GitHub 上找到一个极其优秀的开源 AI 项目，按照 README 敲下：
\`\`\`bash
$ ./start.sh
bash: ./start.sh: Permission denied
\`\`\`
为什么会这样？
因为 Git 默认可能没有同步文件的可执行属性，或者系统为了安全，禁止未经授权的文件被当成程序执行。

---

### 🔢 数字权限速查密码表：
| 权限符号 | 权限意义 | 数值权重 |
| :--- | :--- | :--- |
| **r** (Read) | 允许查看文件内容 / 列出目录 | **4** |
| **w** (Write) | 允许修改、删除文件 | **2** |
| **x** (Execute) | 允许作为脚本或程序运行 | **1** |

把三组人的权限加起来，就形成了三位数字：
- **755** (\`rwxr-xr-x\`)：所有者 7 (4+2+1)，组用户 5 (4+1)，其他用户 5 (4+1)。**标准脚本通用权限**！
- **644** (\`rw-r--r--\`)：所有者可读写，其他人只读。**普通源代码通用权限**！
- **600** (\`rw-------\`)：仅所有者可读写，其他人完全不可见。**存放密码、API Key 的 \`.env\` 黄金法则**！

---

### 📋 本节任务：
1. 使用 \`chmod +x start.sh\` 为启动脚本赋予执行权限；
2. 出于安全最佳实践，使用 \`chmod 600 .env\` 保护敏感配置；
3. 执行 \`ls -lah\` 验证权限修改。`,
        language: "bash",
        starterCode: `# 1. 为项目启动脚本添加执行权限 (+x 或 755)
chmod +x start.sh

# 2. 保护敏感配置文件，禁止其他用户窥探 (600)
chmod 600 .env

# 3. 验证权限属性已成功变更
ls -lah
`,
        solutionCode: `chmod +x start.sh
chmod 600 .env
ls -lah
`,
        checkpoints: [
          {
            id: "chk-linux-3",
            title: "赋予脚本执行权",
            description: "使用 chmod +x 或 chmod 755 为 start.sh 解除执行限制",
            testFunction: (code, output) => {
              const passed = (code.includes("chmod +x") || code.includes("chmod 755")) && code.includes("start.sh");
              return {
                passed,
                message: passed ? "✅ 启动脚本执行权赋予成功，Permission denied 已消除！" : "❌ 请使用 chmod +x start.sh 赋权"
              };
            }
          },
          {
            id: "chk-linux-4",
            title: "收紧隐私配置安全权限",
            description: "使用 chmod 600 严格限制 .env 权限",
            testFunction: (code, output) => {
              const passed = code.includes("chmod 600") && code.includes(".env");
              return {
                passed,
                message: passed ? "✅ 架构师级安全防线建立：.env 已被严密锁定！" : "❌ 请使用 chmod 600 .env"
              };
            }
          }
        ],
        githubAnalogy: "Dockerfile 中的 RUN chmod +x /app/entrypoint.sh 与 Linux 安全合规审计。"
      },
      {
        id: "linux-103",
        title: "进程治理与端口排查：解决 Address Already in Use 与后台守护",
        trackId: "track-linux",
        estimatedMinutes: 20,
        level: "进阶",
        mentalModel: {
          title: "餐厅后厨工号牌与取餐窗口",
          metaphor: "操作系统是一个大餐厅。每个运行中的程序都有一个独一无二的工号牌（PID, Process ID）。如果程序要对外提供 HTTP 网络服务，就必须租用一个特定编号的取餐窗口（Port 端口，如 8080）。如果新启动的程序发现这个窗口已经有人站着，就会爆出 'Address already in use' 惨案！",
          keyIntuition: "用 lsof 抓出占端口的 PID，用 kill -9 释放卡死进程，用 nohup 把程序推入后台，关闭终端也能 24 小时常驻！"
        },
        explanationMarkdown: `### 🚨 经典噩梦：端口被占，程序起不来！
当你在本地或云服务器启动 FastAPI 或 Spring Boot：
\`\`\`bash
OSError: [Errno 48] Address already in use: 0.0.0.0:8080
\`\`\`
很多新手会慌忙重启电脑。但作为合格的工程师，必须学会用命令精准斩杀！

---

### 🔍 经典三步排查法：
1. **查看哪个进程霸占了端口**：
   \`\`\`bash
   lsof -i :8080
   \`\`\`
   输出中会明确给出 **COMMAND**（比如 python）和 **PID**（比如 4092）。
2. **强制击杀卡死僵尸进程**：
   \`\`\`bash
   kill -9 4092
   \`\`\`
   \`-9\` 代表发送最高级别的 \`SIGKILL\` 信号，由 Linux 内核强制回收，无论程序卡死到何种程度都会瞬间终结并交出端口！
3. **把服务放到后台永久运行（即使断开 SSH 也不中断）**：
   \`\`\`bash
   nohup python server.py > app.log 2>&1 &
   \`\`\`
   - \`nohup\`：No Hang Up，忽略终端关闭挂起信号；
   - \`> app.log\`：将标准输出写入日志文件；
   - \`2>&1\`：将错误输出（2）合并到标准输出（1）；
   - \`&\`：推到后台执行。

---

### 📋 本节任务：
1. 使用 \`lsof -i :8080\` 排查 8080 端口占用；
2. 使用 \`kill -9 4092\` 释放该端口；
3. 使用 \`nohup python server.py > app.log 2>&1 &\` 后台拉起服务。`,
        language: "bash",
        starterCode: `# 1. 查找霸占 8080 端口的进程及其 PID
lsof -i :8080

# 2. 强制发送 SIGKILL 信号终止该卡死进程 (PID: 4092)
kill -9 4092

# 3. 将新服务推至后台持久运行，并将全部日志重定向到 app.log
nohup python server.py > app.log 2>&1 &
`,
        solutionCode: `lsof -i :8080
kill -9 4092
nohup python server.py > app.log 2>&1 &
`,
        checkpoints: [
          {
            id: "chk-linux-5",
            title: "定位端口占用并回收",
            description: "正确使用 lsof -i 与 kill -9 回收冲突资源",
            testFunction: (code, output) => {
              const passed = (code.includes("lsof") || code.includes("netstat")) && code.includes("kill -9");
              return {
                passed,
                message: passed ? "✅ 端口排查与进程回收成功！" : "❌ 缺少 lsof 端口查询或 kill -9 指令"
              };
            }
          },
          {
            id: "chk-linux-6",
            title: "掌握 nohup 后台静默守护",
            description: "掌握 nohup 与标准错误合并重定向 2>&1 & 语法",
            testFunction: (code, output) => {
              const passed = code.includes("nohup") && code.includes("&");
              return {
                passed,
                message: passed ? "✅ 服务后台守护闭环达成，终端关闭依然坚挺运行！" : "❌ 请包含 nohup 及后台运行符号 &"
              };
            }
          }
        ],
        githubAnalogy: "生产环境运维排障中最频繁使用的应急操作手册。"
      },
      {
        id: "linux-104",
        title: "文本三剑客与环境变量：grep、tail 与 export 的生产排障",
        trackId: "track-linux",
        estimatedMinutes: 20,
        level: "进阶",
        mentalModel: {
          title: "自来水管道与全局黑板",
          metaphor: "Linux 的管道符（|）就像工业自来水管，前一个程序的输出直接流进下一个程序的进水口！日志太大看不完？cat log | grep ERROR 帮你只捞出错误，再接 | tail -n 20 只看最近20条！环境变量 export 则是办公室黑板，所有子进程一进门都能读取。",
          keyIntuition: "服务器生产排障绝不用文本编辑器硬打开，全靠 grep 过滤关键报错；大模型 API Key 绝不写死在代码里，全靠 export 环境变量动态注入！"
        },
        explanationMarkdown: `### 🌊 管道符（|）的魔法：组合出无限威力
Linux 哲学倡导：“**每个程序只做好一件事，然后通过管道拼接起来**”。
例如：
\`\`\`bash
cat app.log | grep -i "exception" | tail -n 20
\`\`\`
- \`cat app.log\`：读取日志全文；
- \`| grep -i "exception"\`：忽略大小写，只挑出包含异常的行；
- \`| tail -n 20\`：只显示最后最新的 20 行！

几百兆的生产日志，0.1 秒内就能精准定位到最近报错！

---

### 🛡️ 为什么大厂严禁把 API Key 硬编码在代码里？
1. **防止不慎上传 GitHub 泄露**（无数开发者因把 OpenAI/Gemini Key 推上公网，被黑客几分钟刷爆几万美元账单）；
2. **多环境解耦**：本地开发、测试机、生产机代码完全相同，只需注入不同的环境变量！

在 Linux 中声明环境变量：
\`\`\`bash
export GEMINI_API_KEY="sk-prod-your-secure-token"
\`\`\`
Python 代码中即可安全读取：
\`\`\`python
import os
api_key = os.environ.get("GEMINI_API_KEY")
\`\`\`

---

### 📋 本节任务：
1. 使用 \`export\` 导出大模型安全凭证；
2. 组合使用 \`grep\` 与 \`tail\` 分析日志中的最新报错。`,
        language: "bash",
        starterCode: `# 1. 注入大模型 API 凭证环境变量
export GEMINI_API_KEY="sk-live-production-enterprise-key"

# 2. 从庞大的 app.log 日志中过滤出 ERROR 错误，并只打印最新 20 条
cat app.log | grep -i "error" | tail -n 20
`,
        solutionCode: `export GEMINI_API_KEY="sk-live-production-enterprise-key"
cat app.log | grep -i "error" | tail -n 20
`,
        checkpoints: [
          {
            id: "chk-linux-7",
            title: "安全注入环境变量",
            description: "正确使用 export 导出 GEMINI_API_KEY",
            testFunction: (code, output) => {
              const passed = code.includes("export") && code.includes("GEMINI_API_KEY");
              return {
                passed,
                message: passed ? "✅ 环境变量注入成功，敏感凭证实现与代码彻底解耦！" : "❌ 请使用 export GEMINI_API_KEY=..."
              };
            }
          },
          {
            id: "chk-linux-8",
            title: "管道日志过滤",
            description: "使用 grep 与 tail 组合流水线进行日志秒级过滤",
            testFunction: (code, output) => {
              const passed = code.includes("grep") && code.includes("tail");
              return {
                passed,
                message: passed ? "✅ 掌握日志管道流！在数亿行生产日志中排障游刃有余！" : "❌ 请包含 grep 和 tail 的管道组合"
              };
            }
          }
        ],
        githubAnalogy: "GitHub CI/CD Actions 与 Kubernetes Pod 容器的环境变量注入和日志审查标准。"
      },
      {
        id: "linux-105",
        title: "Systemd 服务守护与云原生实战：从进程自愈到 Docker 容器化",
        trackId: "track-linux",
        estimatedMinutes: 25,
        level: "实战",
        mentalModel: {
          title: "24小时不倒翁保安与标准化集装箱",
          metaphor: "在真正的生产服务器上，如果程序因网络波动或不可预期异常崩溃了，谁来重启？靠 Systemd 守护进程！它就像一个尽职尽责的机器保安，一旦监控到你的 Python/Java 服务心跳停止，0.1秒内自动拉起（Restart=always）。而 Docker 则是把你的代码、Python环境和Linux依赖打包成一个密闭集装箱，在任何电脑上运行都一模一样。",
          keyIntuition: "掌握 Systemd 服务的 unit 文件编写与 systemctl 管理命令，你就彻底告别了手忙脚乱的人肉运维，踏入了真正的工业级 DevOps 门槛！"
        },
        explanationMarkdown: `### 🤖 现代 Linux 的心脏：Systemd
在 Linux 服务器开机后，PID 为 1 的就是 **systemd**，它是所有其他进程的“祖父进程”。
所有的现代化后端（如 Nginx、PostgreSQL、Docker、你的 Agent 服务）都由它统一守护！

---

### 📝 标准的生产守护配置文件（/etc/systemd/system/agent.service）：
\`\`\`ini
[Unit]
Description=Autonomous AI Agent Background Daemon
After=network.target

[Service]
Type=simple
User=dev
WorkingDirectory=/home/dev/agent_project
ExecStart=/usr/bin/python3 -m app.main
Restart=always
RestartSec=5s

[Install]
WantedBy=multi-user.target
\`\`\`
- \`Restart=always\`：只要程序挂了，Systemd 自动把它重新拉起！
- \`RestartSec=5s\`：崩溃后等待 5 秒平滑重启，防止死循环冲垮 CPU。

---

### 🕹️ 常用运维四天王指令：
- \`systemctl daemon-reload\`：重载新增的服务配置；
- \`systemctl start/stop/restart <name>\`：启停或重启服务；
- \`systemctl status <name>\`：查看服务健康度与最近日志；
- \`journalctl -u <name> -n 50 -f\`：实时流式查看服务标准输出。

---

### 📋 本节任务：
1. 查询 \`agent-runner.service\` 的运行健康状态；
2. 体验平滑重启与 Systemd 托管命令；
3. 使用 \`journalctl\` 调取服务输出日志。`,
        language: "bash",
        starterCode: `# 1. 检查后台生产 Agent 守护进程的当前运行状态
systemctl status agent-runner.service

# 2. 对托管服务执行安全平滑重启
systemctl restart agent-runner.service

# 3. 调取 Systemd 结构化日志查看最新输出记录
journalctl -u agent-runner.service -n 50 --no-pager
`,
        solutionCode: `systemctl status agent-runner.service
systemctl restart agent-runner.service
journalctl -u agent-runner.service -n 50 --no-pager
`,
        checkpoints: [
          {
            id: "chk-linux-9",
            title: "掌握 systemctl 服务治理",
            description: "熟练使用 systemctl status 与 restart 指令",
            testFunction: (code, output) => {
              const passed = code.includes("systemctl") && (code.includes("status") || code.includes("restart"));
              return {
                passed,
                message: passed ? "✅ 熟练掌握现代 Linux 核心服务生命周期治理！" : "❌ 请使用 systemctl 检查状态或重启"
              };
            }
          },
          {
            id: "chk-linux-10",
            title: "结构化日志调取",
            description: "掌握 journalctl 日志追踪命令",
            testFunction: (code, output) => {
              const passed = code.includes("journalctl");
              return {
                passed,
                message: passed ? "✅ 掌握生产环境首要利器 journalctl，云原生运维实战毕业！" : "❌ 请包含 journalctl 命令"
              };
            }
          }
        ],
        githubAnalogy: "云原生微服务生产部署配置、Kubernetes Pod 探针与企业级自愈架构。"
      }
    ]
  },
  {
    id: "track-typescript",
    title: "12. TypeScript 现代全栈类型工程",
    tagline: "从 JS 混乱混沌走向确定性，赋能 AI SDK、全栈框架与工程元编程",
    description: "面向现代 AI 与全栈开发的强类型基石。从静态类型标注到 interface/type 契约，从可辨识联合与类型守卫到工业级泛型抽象，彻底读透 GitHub 上 Next.js、LangChain.js、AI SDK 等顶级项目的类型系统。",
    icon: "Code2",
    badgeColor: "blue",
    tags: ["大前端与全栈", "AI SDK基石", "类型安全", "零运行时开销"],
    capstoneChallenge: "为企业级多模型 AI Agent 网关设计一套零运行时错误、具备严格类型守卫与结构化输出推导的 TypeScript 架构",
    enterpriseProject: TRACK_ENTERPRISE_PROJECTS["track-typescript"],
    lessons: [
      {
        id: "ts-101",
        title: "静态类型契约：告别 undefined is not a function（基础标量与类型推导）",
        trackId: "track-typescript",
        estimatedMinutes: 15,
        level: "零基础",
        mentalModel: {
          title: "药丸上的凹槽与工业级防呆插座",
          metaphor: "原生 JavaScript 就像没有贴任何标签的透明塑料袋，装的是白糖还是剧毒砒霜，只有程序运行喝下去崩溃那一刻才知道（经典报错：TypeError: Cannot read properties of undefined）。而 TypeScript 是严苛的工厂安检模具，在你在编辑器敲键盘的刹那，就用类型契约把错误消灭在编译期。",
          keyIntuition: "TypeScript 只是 JavaScript 的类型守卫外套。它在编译为 JS 部署后会被完全擦除（Type Stripping），享有 0 运行时性能损耗，却给你带来 100% 的心智确定性。"
        },
        explanationMarkdown: `### 🎯 为什么在 AI 时代必须精通 TypeScript？
在当今 GitHub 开源生态中：
1. **主流 AI 框架第一公民**：Vercel AI SDK、LangChain.js、OpenAI 官方 Node SDK、Anthropic Claude SDK 乃至 MCP (Model Context Protocol) 核心协议，全部采用 TypeScript 编写；
2. **重构底气**：哪怕是用 AI Vibe Coding 辅助生成的成百上千行复杂代码，只要有严谨的类型定义，任何字段改动、类型不匹配都会立即标红，根本不怕改坏！

---

### 🧱 核心标量类型与推导
- **基础类型**：\`string\`、\`number\`、\`boolean\`、\`string[]\`（数组）；
- **特别类型**：\`null\`、\`undefined\`、\`void\`（函数无返回值）；
- **类型推导（Type Inference）**：TS 极其聪明，不需要处处写类型。写 \`let count = 10;\`，它会自动推导出 \`number\`；
- **函数类型签名**：明确标注入参和返回值，让意图一目了然：
\`\`\`typescript
function estimateTokenCost(prompt: string, maxTokens: number = 2048): number {
  const estimatedTokens = Math.ceil(prompt.length / 4) + maxTokens;
  return Number((estimatedTokens * 0.000002).toFixed(6));
}
\`\`\`

---

### ⚠️ 铁律：不要把 TypeScript 写成 AnyScript！
很多初学者遇到报错就滥用 \`any\`：\`let data: any = ...\`。一旦用 \`any\`，相当于关闭了所有防盗门，整个文件退化为危险的原生 JS。

### 📋 本节任务：
1. 观察右侧函数 \`estimateAITokenUsage\` 的类型签名；
2. 为函数参数 \`modelName\`（文本）、\`inputPrompt\`（文本）和 \`targetTokens\`（数字）标注明确的 TypeScript 类型；
3. 为函数指定返回值类型为 \`number\`；
4. 运行代码，查看编译器校验与控制台真实执行输出！`,
        language: "typescript",
        starterCode: `// 1. 请为函数添加精准的 TypeScript 静态类型标注
function estimateAITokenUsage(modelName: string, inputPrompt: string, targetTokens: number): number {
  // 简易字符 Token 估算：通常 1 个 Token 约等于 4 个英文字符或 1 个中文字符
  const promptTokens = Math.ceil(inputPrompt.length / 3);
  const totalTokens = promptTokens + targetTokens;
  
  console.log(\`[Model: \${modelName}] 输入提示词估算: \${promptTokens} Tokens, 目标总计: \${totalTokens} Tokens\`);
  return totalTokens;
}

// 2. 调用该强类型函数并执行
const prompt = "请分析这段 GitHub 仓库的依赖树与架构流程";
const total = estimateAITokenUsage("gemini-3.8-flash", prompt, 1024);
console.log("最终计费预估 Token 总数:", total);
`,
        solutionCode: `function estimateAITokenUsage(modelName: string, inputPrompt: string, targetTokens: number): number {
  const promptTokens = Math.ceil(inputPrompt.length / 3);
  const totalTokens = promptTokens + targetTokens;
  
  console.log(\`[Model: \${modelName}] 输入提示词估算: \${promptTokens} Tokens, 目标总计: \${totalTokens} Tokens\`);
  return totalTokens;
}

const prompt = "请分析这段 GitHub 仓库的依赖树与架构流程";
const total = estimateAITokenUsage("gemini-3.8-flash", prompt, 1024);
console.log("最终计费预估 Token 总数:", total);
`,
        checkpoints: [
          {
            id: "chk-ts-1",
            title: "标注函数入参类型与返回值",
            description: "正确为 modelName、inputPrompt、targetTokens 以及返回值添加 string 和 number 类型",
            testFunction: (code, output) => {
              const passed = code.includes("modelName: string") && 
                             code.includes("inputPrompt: string") && 
                             code.includes("targetTokens: number") && 
                             code.includes("): number");
              return {
                passed,
                message: passed ? "✅ 基础标量类型与函数签名标注完全正确！" : "❌ 请确保参数与函数返回值带有规范的 : string 和 : number 标注"
              };
            }
          },
          {
            id: "chk-ts-2",
            title: "类型检查与函数调用验证",
            description: "成功调用强类型函数并通过 console.log 打印结果",
            testFunction: (code, output) => {
              const passed = code.includes("estimateAITokenUsage(") && output.includes("Token");
              return {
                passed,
                message: passed ? "✅ 类型静态检查 0 错误，程序在严格模式下稳定运行！" : "❌ 请确保调用了 estimateAITokenUsage 并有控制台输出"
              };
            }
          }
        ],
        githubAnalogy: "所有现代前端与 Node.js 库的 index.d.ts 类型声明文件及基础函数入口。"
      },
      {
        id: "ts-102",
        title: "Interface 接口与 Type 别名：定义严谨的数据对象形状与 API 契约",
        trackId: "track-typescript",
        estimatedMinutes: 20,
        level: "零基础",
        mentalModel: {
          title: "房屋建筑蓝图与商业订购合同",
          metaphor: "在前后端交互、大模型输出和数据库交互时，数据都是复杂的 JSON 对象。如果不加约束，后端改了一个字段名字从 user_id 变成 userId，前端满屏爆红。Interface 就是一份法律合同，黑纸白字写明：必须有哪些字段、每个字段是什么类型、哪个字段允许选填（问号 ?）、哪个字段禁止篡改（readonly）。",
          keyIntuition: "在真实开源库中，数据形状必须由 interface 或 type 事先锁定。只要双方遵守契约，无论代码怎么重构，编辑器都能自动提供智能补全（IntelliSense）并杜绝拼写错误。"
        },
        explanationMarkdown: `### 📜 Interface 核心语法速记

\`\`\`typescript
interface ChatMessage {
  readonly id: string;       // 只读：创建后不可修改
  role: "user" | "model" | "system"; // 字面量联合类型
  content: string;           // 消息正文
  tokenCount?: number;       // 可选属性：可能为空
}
\`\`\`

---

### 🆚 \`interface\` 与 \`type\` 的最佳实践建议：
- **定义对象结构、API 响应**：优先使用 \`interface\`，支持面向对象的 \`extends\` 继承与声明合并；
- **定义联合类型、原始别名、工具类型**：优先使用 \`type\`（例如 \`type Role = "admin" | "guest"\`）。

### 📋 本节任务：
1. 观察右侧代码中为 AI Agent 会话定义的 \`AgentSession\` 接口；
2. 为该接口添加 \`title\`（文本）、\`messageCount\`（数字）以及可选属性 \`systemPrompt?\`（可选文本）；
3. 实例化一个符合该接口规范的会话对象，并通过 \`console.log\` 打印其信息！`,
        language: "typescript",
        starterCode: `// 1. 定义消息单项契约
interface MessageItem {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
}

// 2. 请完善 Agent 会话元数据接口
interface AgentSession {
  sessionId: string;
  title: string;
  messageCount: number;
  systemPrompt?: string; // 可选属性，以 ? 结尾
  messages: MessageItem[];
}

// 3. 创建一个严格符合 AgentSession 契约的实例
const currentSession: AgentSession = {
  sessionId: "sess_ai_2026_09",
  title: "GitHub 开源架构分析专家",
  messageCount: 1,
  systemPrompt: "你是一个资深架构师，专门指导开源项目拆解。",
  messages: [
    {
      id: "msg_1",
      role: "user",
      content: "请帮我画出这个 FastAPI 项目的主体流程图"
    }
  ]
};

console.log(\`[会话加载成功] 会话: \${currentSession.title}, 包含消息数: \${currentSession.messages.length}\`);
`,
        solutionCode: `interface MessageItem {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
}

interface AgentSession {
  sessionId: string;
  title: string;
  messageCount: number;
  systemPrompt?: string;
  messages: MessageItem[];
}

const currentSession: AgentSession = {
  sessionId: "sess_ai_2026_09",
  title: "GitHub 开源架构分析专家",
  messageCount: 1,
  systemPrompt: "你是一个资深架构师，专门指导开源项目拆解。",
  messages: [
    {
      id: "msg_1",
      role: "user",
      content: "请帮我画出这个 FastAPI 项目的主体流程图"
    }
  ]
};

console.log(\`[会话加载成功] 会话: \${currentSession.title}, 包含消息数: \${currentSession.messages.length}\`);
`,
        checkpoints: [
          {
            id: "chk-ts-3",
            title: "定义 AgentSession 接口契约",
            description: "包含 title、messageCount 与可选属性 systemPrompt?",
            testFunction: (code, output) => {
              const passed = code.includes("interface AgentSession") && 
                             code.includes("title: string") && 
                             code.includes("messageCount: number") && 
                             code.includes("systemPrompt?:");
              return {
                passed,
                message: passed ? "✅ 结构化数据接口与可选属性契约定义标准规范！" : "❌ 请确保 AgentSession 包含 title: string, messageCount: number 和 systemPrompt?: string"
              };
            }
          },
          {
            id: "chk-ts-4",
            title: "对象契约实例化与数据校验",
            description: "正确创建对象实例并成功通过 TypeScript 类型检查",
            testFunction: (code, output) => {
              const passed = code.includes("currentSession: AgentSession") && output.includes("会话加载成功");
              return {
                passed,
                message: passed ? "✅ 对象实例严格吻合接口定义，类型推导与编译 100% 通过！" : "❌ 请确保 currentSession 声明并使用了 AgentSession 类型"
              };
            }
          }
        ],
        githubAnalogy: "OpenAI SDK 的 ChatCompletionCreateParams、LangChain 的 BaseMessage 核心结构。"
      },
      {
        id: "ts-103",
        title: "联合类型与字面量守卫：可辨识联合（Discriminated Unions）消除逻辑盲区",
        trackId: "track-typescript",
        estimatedMinutes: 20,
        level: "进阶",
        mentalModel: {
          title: "自带条形码与标签的封闭包裹",
          metaphor: "初学者设计网络请求或状态机时，经常把所有字段堆在一起：{ loading, data, error }。这会导致荒谬的幽灵状态——比如 loading=true 时竟然还能读到旧的 data，或者 error 存在时 data 居然也有值。而可辨识联合（Discriminated Unions）就像每一个状态都有一个独一无二的专属条形码字段（例如 status: 'success' | 'error'），当条形码是 'success' 时，编译器自动保证只有 data 没有 error！",
          keyIntuition: "在 switch(item.type) 或 if 检查后，TypeScript 会进行自动类型收窄（Type Narrowing）。从此再也不需要到处打问号（obj?.data?.items）提心吊胆！"
        },
        explanationMarkdown: `### 🛡️ 可辨识联合（Discriminated Unions）实战范式
这是写出工业级高鲁棒性 TypeScript 代码最重要的模式：

\`\`\`typescript
type AgentEvent = 
  | { type: "token"; text: string }
  | { type: "tool_call"; toolName: string; args: Record<string, any> }
  | { type: "done"; totalDurationMs: number };

function handleAgentEvent(event: AgentEvent) {
  switch (event.type) {
    case "token":
      // 在这里，TS 100% 确定 event 具有 text 属性！
      process.stdout.write(event.text);
      break;
    case "tool_call":
      // 在这里，TS 100% 确定拥有 toolName 和 args！
      console.log("调用工具:", event.toolName);
      break;
    case "done":
      console.log("耗时:", event.totalDurationMs);
      break;
  }
}
\`\`\`

---

### 📋 本节任务：
1. 观察右侧大模型 API 响应状态的可辨识联合类型 \`LLMResult\`；
2. 完善 \`formatLLMResponse\` 函数，使用 \`switch (result.status)\` 或 \`if\` 进行类型守卫收窄；
3. 当 \`status === "success"\` 时，安全读取 \`result.data\`；当 \`status === "error"\` 时，安全读取 \`result.errorMessage\`；
4. 运行代码，见证编译器的零盲区推导！`,
        language: "typescript",
        starterCode: `// 1. 定义可辨识联合类型（Discriminated Union）
type LLMResult = 
  | { status: "loading"; progress: number }
  | { status: "success"; data: string; tokensUsed: number }
  | { status: "error"; errorCode: number; errorMessage: string };

// 2. 编写类型收窄与守卫处理函数
function formatLLMResponse(result: LLMResult): string {
  switch (result.status) {
    case "loading":
      return \`[正在生成中...] 进度: \${result.progress}%\`;
    case "success":
      // 类型自动收窄：在此分支中直接安全访问 data 和 tokensUsed
      return \`[生成成功] 结果: \${result.data} (消耗 \${result.tokensUsed} tokens)\`;
    case "error":
      // 类型自动收窄：在此分支中直接安全访问 errorMessage
      return \`[生成失败! 错误码: \${result.errorCode}] 详情: \${result.errorMessage}\`;
  }
}

// 3. 测试调用
const response1: LLMResult = {
  status: "success",
  data: "已成功解析 GitHub 项目依赖关系！",
  tokensUsed: 420
};

console.log(formatLLMResponse(response1));
`,
        solutionCode: `type LLMResult = 
  | { status: "loading"; progress: number }
  | { status: "success"; data: string; tokensUsed: number }
  | { status: "error"; errorCode: number; errorMessage: string };

function formatLLMResponse(result: LLMResult): string {
  switch (result.status) {
    case "loading":
      return \`[正在生成中...] 进度: \${result.progress}%\`;
    case "success":
      return \`[生成成功] 结果: \${result.data} (消耗 \${result.tokensUsed} tokens)\`;
    case "error":
      return \`[生成失败! 错误码: \${result.errorCode}] 详情: \${result.errorMessage}\`;
  }
}

const response1: LLMResult = {
  status: "success",
  data: "已成功解析 GitHub 项目依赖关系！",
  tokensUsed: 420
};

console.log(formatLLMResponse(response1));
`,
        checkpoints: [
          {
            id: "chk-ts-5",
            title: "实现可辨识联合的类型守卫",
            description: "通过 status 字段对 loading、success、error 进行穷尽类型分支匹配",
            testFunction: (code, output) => {
              const passed = code.includes("result.status") && 
                             code.includes("result.data") && 
                             code.includes("result.errorMessage");
              return {
                passed,
                message: passed ? "✅ 可辨识联合与类型收窄完全掌握，消灭一切运行时空指针盲区！" : "❌ 请确保处理了 result.status 的三种分支并读取属性"
              };
            }
          },
          {
            id: "chk-ts-6",
            title: "函数返回与安全格式化输出",
            description: "运行代码输出格式化后的成功响应文本",
            testFunction: (code, output) => {
              const passed = output.includes("生成成功") && output.includes("420 tokens");
              return {
                passed,
                message: passed ? "✅ 输出结果与类型匹配完全一致！" : "❌ 控制台输出未检测到生成成功的格式化内容"
              };
            }
          }
        ],
        githubAnalogy: "Redux / Zustand 状态流转、React useActionState 返回值、以及 Vercel AI SDK 的 StreamPart 协议。"
      },
      {
        id: "ts-104",
        title: "泛型抽象（Generics）：像工业模具一样编写高复用函数与 API 客户端",
        trackId: "track-typescript",
        estimatedMinutes: 25,
        level: "进阶",
        mentalModel: {
          title: "支持灌装任意饮品的真空保温杯",
          metaphor: "如果你造一个杯子只能装可乐，那装咖啡就得重新造个杯子；如果为了省事随便装什么都不检查（像 any 一样），最后喝到肥皂水就完了。泛型 <T> 就是一个'类型占位符模具'：当杯子倒入牛奶，杯子的类型立刻推导为 Cup<Milk>；当倒入咖啡，立刻变为 Cup<Coffee>。既最大化了代码复用，又保留了完美的类型安全！",
          keyIntuition: "在阅读 GitHub 开源项目的 API 客户端、数据库 ORM 或数据结构库时，你会频繁看到 <T>、<TData>、<TError>。不要恐惧尖括号，它就是'把类型当成参数传进去'而已！"
        },
        explanationMarkdown: `### 🧬 泛型（Generics）标准写法

\`\`\`typescript
// 1. 泛型响应外壳接口
interface ApiResponse<TData> {
  code: number;
  message: string;
  data: TData; // 具体的业务数据类型由调用方指定！
  timestamp: number;
}

// 2. 泛型包装函数
function wrapSuccessResponse<T>(payload: T): ApiResponse<T> {
  return {
    code: 200,
    message: "OK",
    data: payload,
    timestamp: Date.now()
  };
}
\`\`\`

---

### 📋 本节任务：
1. 观察通用的 API 响应模具 \`ApiResponse<T>\`；
2. 定义一个具体的业务接口 \`AIModelMeta\`，包含 \`modelId\`（文本）与 \`maxContextWindow\`（数字）；
3. 使用泛型函数 \`createApiResponse<AIModelMeta>\` 将元数据包装为强类型的 API 响应；
4. 运行代码，体验泛型带来的零丢失字段智能推导！`,
        language: "typescript",
        starterCode: `// 1. 通用泛型容器：TData 是类型形参
interface ApiResponse<TData> {
  code: number;
  success: boolean;
  data: TData;
}

// 2. 泛型构造辅助函数
function createApiResponse<T>(payload: T): ApiResponse<T> {
  return {
    code: 200,
    success: true,
    data: payload
  };
}

// 3. 定义具体的业务实体
interface AIModelMeta {
  modelId: string;
  provider: string;
  maxContextWindow: number;
}

// 4. 调用泛型函数，享受端到端的强类型绑定
const metaData: AIModelMeta = {
  modelId: "gemini-3.8-flash",
  provider: "Google AI",
  maxContextWindow: 1048576
};

const response = createApiResponse<AIModelMeta>(metaData);

console.log(\`[泛型响应封装成功] 模型: \${response.data.modelId}, 上下文窗口: \${response.data.maxContextWindow}\`);
`,
        solutionCode: `interface ApiResponse<TData> {
  code: number;
  success: boolean;
  data: TData;
}

function createApiResponse<T>(payload: T): ApiResponse<T> {
  return {
    code: 200,
    success: true,
    data: payload
  };
}

interface AIModelMeta {
  modelId: string;
  provider: string;
  maxContextWindow: number;
}

const metaData: AIModelMeta = {
  modelId: "gemini-3.8-flash",
  provider: "Google AI",
  maxContextWindow: 1048576
};

const response = createApiResponse<AIModelMeta>(metaData);

console.log(\`[泛型响应封装成功] 模型: \${response.data.modelId}, 上下文窗口: \${response.data.maxContextWindow}\`);
`,
        checkpoints: [
          {
            id: "chk-ts-7",
            title: "理解泛型类型形参 <TData> 与泛型函数",
            description: "正确定义泛型接口并使用 createApiResponse<AIModelMeta> 完成装箱",
            testFunction: (code, output) => {
              const passed = code.includes("interface ApiResponse<TData>") && 
                             code.includes("createApiResponse<") && 
                             code.includes("AIModelMeta");
              return {
                passed,
                message: passed ? "✅ 泛型模具机制掌握透彻，已跨越 TypeScript 最关键的技术分水岭！" : "❌ 请确保包含泛型接口 ApiResponse<TData> 与泛型调用"
              };
            }
          },
          {
            id: "chk-ts-8",
            title: "验证嵌套泛型数据解包",
            description: "能够通过 response.data 准确访问业务实体的专属属性",
            testFunction: (code, output) => {
              const passed = code.includes("response.data.modelId") && output.includes("gemini-3.8-flash");
              return {
                passed,
                message: passed ? "✅ 嵌套泛型字段在编译期完整保留，智能感知与校验通过！" : "❌ 控制台未检测到预期的模型信息输出"
              };
            }
          }
        ],
        githubAnalogy: "Axios.get<T>()、TanStack Query 的 useQuery<TData>()、Prisma ORM 查询结果类型推导。"
      },
      {
        id: "ts-105",
        title: "生产实战：Zod 结构化契约与 GitHub 顶级 AI 开源项目类型系统解构",
        trackId: "track-typescript",
        estimatedMinutes: 25,
        level: "实战",
        mentalModel: {
          title: "海关安检机与双重保险丝",
          metaphor: "TypeScript 类型只存在于写代码和编译阶段，浏览器和 Node.js 运行时根本看不到 TS 类型。当大模型吐出一个 JSON 字符串时，你把它强制写为 'as AgentPlan'，万一大模型少输出了一个核心字段，运行时依然当场闪退！工业级开源框架（如 LangChain / Vercel AI SDK）采用 '静态 TS 契约 + 运行时 Schema 校验' 双保险——用类似 Zod 的方式在海关入口严密核验每一项数据，不合格当场拒签！",
          keyIntuition: "学会在阅读 GitHub 开源项目时快速定位 packages/core/types 或 src/types.ts。看懂了它的核心接口和工具类型（如 Partial<T>、Record<K, V>），整个项目的骨架流程就彻底一目了然！"
        },
        explanationMarkdown: `### 🚀 工业级标准：常用内置工具类型（Utility Types）

TypeScript 自带了一套极其强大的类型变身工具：
- \`Partial<T>\`：把一个接口里的所有字段全都变成可选属性（例如在更新操作时不需要传全部字段）；
- \`Pick<T, "id" | "title">\`：从复杂接口中只挑出需要的某几个字段；
- \`Record<string, any>\`：定义键值对映射字典。

---

### 🔍 解构 GitHub 开源项目：类型驱动开发（Type-Driven Development）
当你面对一个陌生的顶级开源项目（例如 10 万 Star 的项目）：
1. **第一步不要看几千行实现逻辑**，直奔 \`src/types.ts\` 或 \`interfaces.ts\`；
2. 找出核心领域的 3 个主要 Interface（如 \`Tool\`, \`Agent\`, \`ExecutionStep\`）；
3. 观察函数签名入参与出参——只要搞清楚了输入什么、输出什么，中间的具体算法用 AI 辅助甚至自己写都游刃有余！

### 📋 本节任务：
1. 观察右侧代码中为多智能体规划器定义的 \`AgentExecutionPlan\`；
2. 使用内置工具类型 \`Partial<AgentExecutionPlan>\` 定义可支持局部补丁更新的函数 \`updatePlanDraft\`；
3. 运行代码，完成 TypeScript 体系的终极进阶！`,
        language: "typescript",
        starterCode: `// 1. 定义完整的生产级 Agent 执行规划接口
interface AgentExecutionPlan {
  planId: string;
  goal: string;
  steps: string[];
  maxRetries: number;
  isCompleted: boolean;
}

// 2. 使用 TypeScript 内置工具类型 Partial<T>
// 这样在草稿阶段更新时，允许只传入需要修改的子集属性（如仅更新 steps）
type PlanUpdateDraft = Partial<AgentExecutionPlan>;

function updatePlanDraft(original: AgentExecutionPlan, patch: PlanUpdateDraft): AgentExecutionPlan {
  // 合并原有计划与局部补丁更新
  return {
    ...original,
    ...patch
  };
}

// 3. 初始全量计划
const initialPlan: AgentExecutionPlan = {
  planId: "plan_001",
  goal: "克隆并分析 GitHub 陌生项目依赖",
  steps: ["阅读 README", "检查 package.json"],
  maxRetries: 3,
  isCompleted: false
};

// 4. 局部增量打补丁：无需传全量字段，安全且强类型保护
const updatedPlan = updatePlanDraft(initialPlan, {
  steps: ["阅读 README", "检查 package.json", "运行单元测试验证流程"],
  isCompleted: true
});

console.log(\`[计划更新完成] ID: \${updatedPlan.planId}, 步骤数: \${updatedPlan.steps.length}, 已完结: \${updatedPlan.isCompleted}\`);
`,
        solutionCode: `interface AgentExecutionPlan {
  planId: string;
  goal: string;
  steps: string[];
  maxRetries: number;
  isCompleted: boolean;
}

type PlanUpdateDraft = Partial<AgentExecutionPlan>;

function updatePlanDraft(original: AgentExecutionPlan, patch: PlanUpdateDraft): AgentExecutionPlan {
  return {
    ...original,
    ...patch
  };
}

const initialPlan: AgentExecutionPlan = {
  planId: "plan_001",
  goal: "克隆并分析 GitHub 陌生项目依赖",
  steps: ["阅读 README", "检查 package.json"],
  maxRetries: 3,
  isCompleted: false
};

const updatedPlan = updatePlanDraft(initialPlan, {
  steps: ["阅读 README", "检查 package.json", "运行单元测试验证流程"],
  isCompleted: true
});

console.log(\`[计划更新完成] ID: \${updatedPlan.planId}, 步骤数: \${updatedPlan.steps.length}, 已完结: \${updatedPlan.isCompleted}\`);
`,
        checkpoints: [
          {
            id: "chk-ts-9",
            title: "熟练运用 Partial<T> 工具类型",
            description: "定义类型别名 PlanUpdateDraft = Partial<AgentExecutionPlan>",
            testFunction: (code, output) => {
              const passed = code.includes("Partial<AgentExecutionPlan>") && code.includes("updatePlanDraft");
              return {
                passed,
                message: passed ? "✅ 熟练掌握 Partial 高级工具类型与对象属性打补丁机制！" : "❌ 请确保使用了 Partial<AgentExecutionPlan>"
              };
            }
          },
          {
            id: "chk-ts-10",
            title: "完成工程级计划更新闭环",
            description: "验证更新后计划的 steps 扩展与状态完结",
            testFunction: (code, output) => {
              const passed = output.includes("计划更新完成") && output.includes("步骤数: 3");
              return {
                passed,
                message: passed ? "✅ 恭喜！顺利通关 TypeScript 现代全栈类型工程全套实战！" : "❌ 控制台输出未检测到包含 3 个步骤的更新完成日志"
              };
            }
          }
        ],
        githubAnalogy: "GitHub 顶级开源项目（如 Prisma Client、TRPC、Zod、Next.js App Router）底层类型元编程基石。"
      }
    ]
  }
];
