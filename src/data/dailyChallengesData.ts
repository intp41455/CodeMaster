import { DailyChallenge } from "../types";

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: "daily-2026-09-21",
    dateStr: "2026-09-21",
    title: "AI 生成代码审判：致命的异步协程阻塞隐患",
    category: "ai_code_reading",
    categoryLabel: "AI代码精读审判",
    difficulty: "中等",
    xpReward: 100,
    question: "你在 Review 某团队由 AI 生成的 FastAPI 高并发商品秒杀接口。请仔细阅读以下代码，指出这段代码在 1000 QPS 生产高并发下会引发什么灾难性故障？",
    contextCode: `from fastapi import FastAPI
import time
import asyncio

app = FastAPI()

@app.post("/api/v1/seckill/order")
async def create_seckill_order(item_id: str, user_id: str):
    # 模拟从库存中心网络校验库存（耗时 200ms）
    time.sleep(0.2)  # <--- 注意此行
    
    # 执行下单写入
    order_id = f"ORDER_{user_id}_{item_id}"
    return {"status": "SUCCESS", "order_id": order_id}
`,
    language: "python",
    type: "multiple_choice",
    options: [
      {
        id: "opt-1",
        text: "代码没有任何问题，async def 会自动把 time.sleep 转为多线程后台休眠。",
        isCorrect: false,
        explanation: "错误！Python asyncio 事件循环运行在单线程上，无法自动感知和转移同步阻塞调用。"
      },
      {
        id: "opt-2",
        text: "致命同步阻塞：time.sleep 会霸占整个事件循环单线程 200ms，导致服务器在该期间无法处理其他任何并发请求，QPS 断崖式跌零！",
        isCorrect: true,
        explanation: "正确！在 async def 中必须使用 await asyncio.sleep(0.2)，绝对不能调用同步阻塞的 time.sleep()！"
      },
      {
        id: "opt-3",
        text: "FastAPI 会抛出 SyntaxError，无法启动服务器。",
        isCorrect: false,
        explanation: "错误！语法完全合法，程序能正常启动，但这正是 AI 代码最隐蔽的生产地雷。"
      },
      {
        id: "opt-4",
        text: "会导致内存无限泄漏（OOM），因为 order_id 字符串拼接占用过大内存。",
        isCorrect: false,
        explanation: "错误！字符串拼接内存极小，核心矛盾是 CPU 事件循环被同步 sleep 独占冻结。"
      }
    ],
    hint: "思考：Python asyncio 协程运行在几个系统线程上？调用普通阻塞函数时，事件循环能不能切换去干别的事？",
    takeaway: "💡 架构师心法：在现代异步框架（FastAPI / Tornado / Node.js）中，单线程事件循环最忌讳同步 IO 阻塞！遇到 sleep 用 await asyncio.sleep，遇到同步第三方库需使用 run_in_executor 或 fastapi.concurrency.run_in_threadpool。"
  },
  {
    id: "daily-2026-09-22",
    dateStr: "2026-09-22",
    title: "微算法演练：O(1) 幂等去重哈希滑动窗口",
    category: "micro_algorithm",
    categoryLabel: "经典微算法",
    difficulty: "简单",
    xpReward: 100,
    question: "在微服务分布式接口中，需要防止网络重试导致的重复扣款。请补全 check_and_record_idempotency 函数，使用哈希集合在 O(1) 时间内判断 request_id 是否已经处理过：如果已处理过返回 False，未处理过则加入集合并返回 True。",
    language: "python",
    type: "code_fix",
    starterCode: `class IdempotentGuard:
    def __init__(self):
        self.processed_tokens = set()

    def check_and_record(self, request_id: str) -> bool:
        # TODO: 请补全逻辑
        # 1. 检查 request_id 是否在 self.processed_tokens 中
        # 2. 如果已存在，返回 False
        # 3. 如果不存在，记录进集合并返回 True
        pass

# 测试验证
guard = IdempotentGuard()
print(guard.check_and_record("REQ_1001")) # 应输出 True
print(guard.check_and_record("REQ_1001")) # 应输出 False（重复请求被拦截）
`,
    solutionCode: `class IdempotentGuard:
    def __init__(self):
        self.processed_tokens = set()

    def check_and_record(self, request_id: str) -> bool:
        if request_id in self.processed_tokens:
            return False
        self.processed_tokens.add(request_id)
        return True
`,
    validator: (code: string) => {
      const passed = code.includes("in self.processed_tokens") && 
                     code.includes("self.processed_tokens.add") &&
                     code.includes("return False") &&
                     code.includes("return True");
      return {
        passed,
        feedback: passed 
          ? "✅ 太棒了！正确运用哈希集合实现 O(1) 幂等防重拦截！" 
          : "❌ 请检查是否包含判断 request_id in self.processed_tokens 与 add 添加逻辑。"
      };
    },
    hint: "使用 Python 的 set() 拥有平均 O(1) 的查找和插入效率，利用 `if request_id in self.processed_tokens:` 判断即可。",
    takeaway: "💡 算法心法：哈希表不仅是做 LeetCode 的工具，更是所有分布式幂等 Token 校验、Redis 缓存去重与分布式锁的核心原型！"
  },
  {
    id: "daily-2026-09-23",
    dateStr: "2026-09-23",
    title: "AI 代码审判：未保护的 LLM 生成与 Token 账单黑洞",
    category: "ai_code_reading",
    categoryLabel: "AI代码精读审判",
    difficulty: "挑战",
    xpReward: 100,
    question: "某开发者让 AI 写了一个智能客服循环问答 Agent，上线第一晚消耗了 2000 美元 API 账单。阅读以下代码，找出导致死循环与 Token 账单雪崩的致命 Bug 是什么？",
    contextCode: `def run_support_agent(user_query: str):
    history = [{"role": "user", "content": user_query}]
    
    # 智能客服自动反思回路
    while True:
        # 调用大模型生成回答
        response = call_llm(history)
        
        # 检查是否满足用户诉求
        if "【问题已解决】" in response:
            return response
            
        # AI 自我反思并继续下一轮
        history.append({"role": "assistant", "content": response})
        history.append({"role": "user", "content": "请继续补充更详细的信息直至满意"})
`,
    language: "python",
    type: "multiple_choice",
    options: [
      {
        id: "opt-1",
        text: "history 没有使用 tuple 元组存储，导致内存溢出。",
        isCorrect: false,
        explanation: "错误！列表本身占内存极小，不是主要矛盾。"
      },
      {
        id: "opt-2",
        text: "致命死循环与上下文滚雪球：没有设置最大迭代轮次（max_steps）熔断，且只要模型没精确吐出【问题已解决】，history 就会无限倍增请求，单次请求消耗数万 Token 直至欠费卡死！",
        isCorrect: true,
        explanation: "正确！任何 Agent 的 while True 必须强制配备 max_steps 步数上限和超时熔断，不能完全寄希望于模型输出特定关键词！"
      },
      {
        id: "opt-3",
        text: "call_llm 缺少返回类型注解。",
        isCorrect: false,
        explanation: "错误！类型注解不影响运行逻辑，不会引发账单故障。"
      },
      {
        id: "opt-4",
        text: "该代码没有任何逻辑问题，是调用方网络抖动造成的。",
        isCorrect: false,
        explanation: "错误！缺少退出熔断机制是 Agent 生产中最著名的致命事故之一。"
      }
    ],
    hint: "如果大模型永远不吐出【问题已解决】这 7 个字，这个 while 循环会执行多少次？每次把累积越来越长的 history 再发给大模型，Token 消耗是线性增长还是平方级剧增？",
    takeaway: "💡 架构师心法：编写任何带有自我迭代或 ReAct 的 Agent 时，铁律第一条：【永远设置 max_iterations 熔断上限】（通常设为 5~10 轮）！"
  },
  {
    id: "daily-2026-09-24",
    dateStr: "2026-09-24",
    title: "Linux 生产排障审判：端口占用与孤儿进程排查",
    category: "ai_code_reading",
    categoryLabel: "Linux运维实战审判",
    difficulty: "中等",
    xpReward: 100,
    question: "你的云服务器在部署最新的 FastAPI Agent 服务时突然报错：`OSError: [Errno 48] Address already in use: 0.0.0.0:8000`。某初级运维建议直接执行 `sudo reboot` 重启整台机器。作为资深工程师，最安全规范且不影响机房其他服务的操作是什么？",
    contextCode: `# 生产服务器终端报错现场：
$ uvicorn app.main:app --port 8000
ERROR: [Errno 48] Address already in use
Exiting process...
`,
    language: "bash",
    type: "multiple_choice",
    options: [
      {
        id: "opt-1",
        text: "直接执行 sudo reboot 重启服务器，既彻底又省事。",
        isCorrect: false,
        explanation: "严重事故！在生产服务器上 reboot 会导致整台宿主机上的所有数据库、容器和其他微服务全部中断！"
      },
      {
        id: "opt-2",
        text: "修改代码把端口临时改成 8001，逃避 8000 端口冲突。",
        isCorrect: false,
        explanation: "治标不治本！不仅导致外层 Nginx 反向代理无法路由，且原本占用的僵尸进程仍在暗中消耗内存。"
      },
      {
        id: "opt-3",
        text: "使用 lsof -i :8000 精准查出占用该端口的残留进程 PID，核实后使用 kill -9 <PID> 强制释放端口，然后正常重启服务。",
        isCorrect: true,
        explanation: "正确！lsof -i :<port> 或 netstat -tulnp 是最规范、精准且零副作用的定位并终结僵尸进程的标准手势。"
      },
      {
        id: "opt-4",
        text: "运行 chmod -R 777 /app 赋予最大权限。",
        isCorrect: false,
        explanation: "错误！这是网络套接字端口被占用的问题，和文件系统权限毫无关系，乱打 777 还会带来严重安全风险。"
      }
    ],
    hint: "思考：怎么查出是哪个进程（PID）在偷听 8000 端口？怎么在不影响系统其他进程的情况下单独清理它？",
    takeaway: "💡 架构师心法：生产服务器切忌无脑重启！掌握【端口查询 (lsof -i / netstat) -> 确认身份 (ps -fp <PID>) -> 信号终止 (kill -15 优雅退出 / kill -9 强杀)】标准三部曲。"
  },
  {
    id: "daily-2026-09-25",
    dateStr: "2026-09-25",
    title: "TypeScript 类型击穿事故：类型断言 (as) 与运行时白屏陷阱",
    category: "ai_code_reading",
    categoryLabel: "TypeScript全栈实战审判",
    difficulty: "中等",
    xpReward: 100,
    question: "某开发者为快速调通大模型接口，使用了类型断言：`const result = (await callLLM()) as AgentPlan;`。结果在生产环境中，大模型偶尔未输出 `planSteps` 字段，导致后续页面访问 `result.planSteps.length` 时直接触发 `TypeError: Cannot read properties of undefined` 引发白屏事故。作为技术负责人，最严谨可靠的防御方案是什么？",
    contextCode: `// 生产线隐患代码：
interface AgentPlan {
  planTitle: string;
  planSteps: string[];
}

async function handleUserTask() {
  // 危险操作：强制把未经验证的 LLM 原始 JSON 断言为 AgentPlan
  const raw = await callLLM();
  const plan = raw as AgentPlan;
  
  // 当 LLM 漏输出 planSteps 时，此行直接导致生产崩溃！
  console.log("执行步骤数:", plan.planSteps.length);
}
`,
    language: "typescript",
    type: "multiple_choice",
    options: [
      {
        id: "opt-1",
        text: "在 tsconfig.json 中关闭 strict 严格模式，让编译器不报错即可。",
        isCorrect: false,
        explanation: "严重错误！关闭 strict 只是自欺欺人，不仅无法解决运行时崩溃，还会使整个项目的类型防御彻底失效。"
      },
      {
        id: "opt-2",
        text: "把 TypeScript 全部重构成原生 JavaScript，就不会有类型困扰了。",
        isCorrect: false,
        explanation: "荒谬！换成原生 JS 同样会在读取 undefined.length 时抛出致命 TypeError 崩溃。"
      },
      {
        id: "opt-3",
        text: "引入运行时校验（如 Zod / 运行时类型守卫），在数据进入系统边界时做 Schema 验证，验证不通过则触发重试或降级，杜绝盲目使用 'as' 假装数据安全。",
        isCorrect: true,
        explanation: "正确！TS 类型在运行时会被完全擦除。面对不可控的外部数据（大模型输出、第三方 API），必须结合运行时校验（如 Zod Schema）构筑真实防线！"
      },
      {
        id: "opt-4",
        text: "每次报错后让用户手动刷新浏览器页面。",
        isCorrect: false,
        explanation: "错误！这是完全不负责任的体验，严重损坏系统的可靠性与品牌形象。"
      }
    ],
    hint: "思考：TypeScript 的类型在代码编译部署到 Node.js 或浏览器之后还存在吗？大模型吐出的 JSON 是不是完全不受控的外部输入？",
    takeaway: "💡 架构师心法：'as SomeType'（类型断言）本质是在对编译器说谎。针对任何非受控外部数据（API 返回、LLM 文本），永远坚持【运行时 Schema 验证 + TS 静态推导】的零击穿金标准！"
  }
];

export function getTodayChallenge(): DailyChallenge {
  // Select challenge based on current date index to allow fresh rotation
  const today = new Date();
  const dayIndex = (today.getDate() + today.getMonth() * 31) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[dayIndex];
}
