export interface GraduationChallenge {
  id: string;
  stageName: string;
  phase: "STAGE_1_ARCH" | "STAGE_2_AUDIT" | "STAGE_3_TRACE" | "STAGE_4_HOTFIX";
  title: string;
  description: string;
  contextCode: string;
  objective: string;
  options?: { id: string; label: string; isCorrect: boolean; explanation: string }[];
  codeChallenge?: {
    starter: string;
    target: string;
    validator: (code: string) => { passed: boolean; message: string };
  };
}

export const GRADUATION_PROJECT = {
  title: "🎓 终极毕业综合考核：企业级多智能体开源中台 (Enterprise Multi-Agent Platform)",
  description: "检验你是否真正具备【面对陌生开源项目胸有成竹、面对AI生成的代码掌控自如】的硬核工程师实力。通过 4 大维度穿透考核，颁发全栈与AI时代高级工程师认证。",
  stages: [
    {
      id: "stage-1",
      stageName: "第一阶段：陌生开源架构穿透能力",
      phase: "STAGE_1_ARCH",
      title: "【架构测绘】5分钟穿透一个拥有 20 个模块的未知开源仓库",
      description: "你在 GitHub 发现了一个全新的智能体微服务仓库，里面有 main.py, config.py, controllers/, services/, models/, agents/ 等目录。根据 5 步穿透法，你第一步应该做什么？",
      objective: "考察面对陌生工程时的定位直觉与架构测绘习惯",
      options: [
        {
          id: "opt-1",
          label: "一头扎进 services 目录逐行读每一个几十行的实现细节",
          isCorrect: false,
          explanation: "❌ 错误！未见森林先见树木，极易在数百个方法里迷失方向并产生挫败感。"
        },
        {
          id: "opt-2",
          label: "先读 README 与依赖清单（requirements.txt/pom.xml），再找程序启动入口（main.py/Application.java）",
          isCorrect: true,
          explanation: "✅ 正确！依赖清单告诉你用了什么技术栈，启动入口告诉你系统在内存中如何被装配与启动。"
        },
        {
          id: "opt-3",
          label: "随便找一个文件直接开始改代码看能不能跑",
          isCorrect: false,
          explanation: "❌ 盲目修改可能改到非核心死代码，无法建立系统心智模型。"
        }
      ]
    },
    {
      id: "stage-2",
      stageName: "第二阶段：AI 时代 Vibe Coding 审计与反思",
      phase: "STAGE_2_AUDIT",
      title: "【AI代码反客为主】审查由 Cursor/Claude 生成的 Agent 并发调度代码",
      description: "AI 为你的多智能体系统生成了以下代码，声称'可以并发执行多个任务'。请用你的眼睛找出里面致命的生产级缺陷：",
      contextCode: `tasks_queue = []

def add_task(task_name):
    # AI 写的代码：没有加锁保护的全局列表
    tasks_queue.append(task_name)

def worker_consume():
    if len(tasks_queue) > 0:
        # 潜在竞态条件：在多线程或多协程下，这里刚判断完，元素可能被另一个worker弹出！
        task = tasks_queue.pop(0)
        return f"Processing {task}"
    return "Empty"`,
      objective: "识别 AI 生成代码在并发与共享可变状态下的竞态条件（Race Condition）隐患",
      options: [
        {
          id: "opt-audit-1",
          label: "代码完全没有问题，Python 会自动给所有变量加全局锁因此线程绝对安全",
          isCorrect: false,
          explanation: "❌ 错误！尽管有 GIL，pop(0) 与 len() 的复合检查不是原子操作，并发下会抛出 IndexError 崩溃！"
        },
        {
          id: "opt-audit-2",
          label: "存在经典的'检查后执行'（Check-Then-Act）竞态条件漏洞，需改用线程安全队列（如 Queue / asyncio.Queue）",
          isCorrect: true,
          explanation: "✅ 命中要害！AI 经常使用原生 list 模拟任务队列，生产并发下极易引发 IndexError 或任务重复消费。"
        }
      ]
    },
    {
      id: "stage-3",
      stageName: "第三阶段：单请求时序链路追踪",
      phase: "STAGE_3_TRACE",
      title: "【链路侦探】还原 Spring AI 或 FastAPI 从接收到输出的调用栈",
      description: "当一个用户在智能体系统输入一条消息后，整个系统的数据流向先后顺序是怎样的？",
      objective: "考察能否在脑海中清晰放映代码在各个模块间的传递时序",
      options: [
        {
          id: "opt-trace-1",
          label: "数据库 ➔ 大模型 ➔ 路由控制器 ➔ 客户端",
          isCorrect: false,
          explanation: "❌ 顺序完全混乱。"
        },
        {
          id: "opt-trace-2",
          label: "HTTP 请求 ➔ Router参数校验 ➔ Agent Engine状态判定 ➔ Tool/Vector检索 ➔ LLM推理 ➔ 结果组装响应",
          isCorrect: true,
          explanation: "✅ 完美！这正是所有生产级现代化 AI 服务的经典金字塔调用链路！"
        }
      ]
    },
    {
      id: "stage-4",
      stageName: "第四阶段：动手小改动验证（Hotfix 实操）",
      phase: "STAGE_4_HOTFIX",
      title: "【工程交付】为核心智能体增加执行耗时与安全审计日志埋点",
      description: "在开源维护或企业开发中，即使代码是 AI 写的，你也必须能够亲手植入可观察性代码（Observability）。请完善函数，记录当前任务耗时。",
      contextCode: `import time

def trace_agent_execution(task_func, query: str):
    # 请完善该函数：
    # 1. 记录 start_time
    # 2. 执行 task_func(query)
    # 3. 计算耗时 elapsed_ms (毫秒)
    # 4. 返回包含 'result' 和 'elapsed_ms' 的字典
    pass`,
      objective: "编写高内聚可复用的审计装饰/环绕逻辑并验证输出",
      codeChallenge: {
        starter: `import time

def trace_agent_execution(task_func, query: str):
    start_time = time.time()
    result = task_func(query)
    elapsed_ms = round((time.time() - start_time) * 1000, 2)
    return {"result": result, "elapsed_ms": elapsed_ms}

# 测试桩
mock_task = lambda q: f"Completed: {q}"
print(trace_agent_execution(mock_task, "分析代码依赖"))
`,
        target: "具备精确计时与返回值包装",
        validator: (code: string) => {
          const hasTime = code.includes("time.time()") || code.includes("time.perf_counter()");
          const hasReturn = code.includes("elapsed_ms") && code.includes("result");
          if (!hasTime || !hasReturn) {
            return { passed: false, message: "❌ 请使用 time.time() 并在返回字典中包含 result 与 elapsed_ms 字段。" };
          }
          return { passed: true, message: "🎉 考核圆满通过！你已经掌握了可观察性埋点与防御性工程的核心能力！" };
        }
      }
    }
  ]
};
