import { VibeCodingCase } from "../types";

export const VIBE_CODING_CASES: VibeCodingCase[] = [
  {
    id: "vibe-agent-loop",
    title: "案例一：AI 生成的 Agent 自动重试死循环与 Token 雪崩陷阱",
    aiPromptUsed: "帮我写一个 Python 智能体工具执行器，要求非常健壮，遇到任何网络错误都要一直重试，直到拿到正确结果为止。",
    language: "python",
    generatedCode: `import time

def call_external_agent_api(query: str):
    # 模拟外部大模型 API 调用，假设遭遇 401 密钥失效或 404 端点错误
    raise ConnectionRefusedError("HTTP 401: Unauthorized API Key")

def execute_agent_task(prompt: str):
    # AI 写的看似'绝不放弃'的代码：
    while True:
        try:
            print(f"尝试执行 Agent 任务: {prompt}...")
            response = call_external_agent_api(prompt)
            return response
        except Exception:
            # AI 认为这样可以'容错'
            print("调用失败，立即重试...")
            time.sleep(0.1) # 几乎无延迟无限轰炸`,
    vibeIllusion: "小白第一眼看上去：有 try...except，遇到错误会重试，似乎'很顽强、很自动化'，在本地跑两下没报错就直接丢上线了。",
    hiddenDisasters: [
      {
        type: "无限重试死锁与拒绝服务",
        severity: "CRITICAL",
        lineLocation: "while True 与 except Exception",
        mechanism: "如果错误是由于【API Key 过期】、【参数格式错误 (400)】或【服务下线 (404)】等永久性致命错误引起的，无论重试一亿次也绝不可能成功！",
        consequence: "服务器 CPU 占用飙到 100%，以每秒几十次的频率疯狂轰炸上游接口，账号瞬间被封禁，更可能在云端产生天价账单！"
      },
      {
        type: "无退避抖动机制",
        severity: "HIGH",
        lineLocation: "time.sleep(0.1)",
        mechanism: "缺乏指数退避（Exponential Backoff）和随机抖动（Jitter），上游若刚好突发高负载，重试风暴会直接打垮下游整条微服务集群。",
        consequence: "引发经典的分布式系统'惊群效应'（Thundering Herd Problem）。"
      }
    ],
    verificationStrategy: {
      step1_mentalCheck: "【逻辑逆推】：追问自己：这个循环在什么情况下【绝对出不来】？当遇到不可恢复的错误（如密码不对）时，代码会怎样？",
      step2_bugHunt: "【漏洞猎杀】：寻找是否有退出计数器（max_retries）？是否有针对特定瞬态异常（如 Timeout）的精细化捕获？",
      step3_counterExampleTest: "【反例击穿】：故意传入一个抛出 ConnectionRefusedError 的模拟函数，观察程序是否能在 3 次以内放弃并抛出警告，而不是卡死终端。",
      step4_cleanRefactor: "【硬化重构】：加入最大重试限制、退避延迟倍增、区分可重试异常与不可重试异常。"
    },
    starterFixCode: `import time

def call_external_agent_api(query: str):
    raise ConnectionRefusedError("HTTP 401: Unauthorized API Key")

# 你的任务：改造 execute_agent_task
# 1. 增加 max_retries 参数（默认为 3）
# 2. 每次重试时休眠时间翻倍（指数退避，如 0.5s -> 1.0s -> 2.0s）
# 3. 超过最大重试次数后抛出 RuntimeError 或返回失败字典，严禁死循环！

def execute_agent_task(prompt: str, max_retries: int = 3):
    attempts = 0
    delay = 0.5
    while attempts < max_retries:
        try:
            attempts += 1
            print(f"尝试第 {attempts}/{max_retries} 次调用...")
            return call_external_agent_api(prompt)
        except ConnectionRefusedError as e:
            print(f"遇到网络连接异常: {e}")
            if attempts >= max_retries:
                break
            time.sleep(delay)
            delay *= 2
    return {"status": "FAILED", "reason": "已达最大重试上限，熔断保护触发"}

print(execute_agent_task("帮我查询研报"))
`,
    correctRefactoredCode: `import time

def call_external_agent_api(query: str):
    raise ConnectionRefusedError("HTTP 401: Unauthorized API Key")

def execute_agent_task(prompt: str, max_retries: int = 3):
    attempts = 0
    delay = 0.5
    while attempts < max_retries:
        try:
            attempts += 1
            print(f"尝试第 {attempts}/{max_retries} 次调用...")
            return call_external_agent_api(prompt)
        except ConnectionRefusedError as e:
            print(f"捕获瞬态错误: {e}")
            if attempts >= max_retries:
                break
            time.sleep(delay)
            delay *= 2
    return {"status": "FAILED", "reason": "已达最大重试上限，熔断保护触发"}

result = execute_agent_task("帮我查询研报", max_retries=3)
print(result)
`,
    testCheck: (userCode: string) => {
      const hasMaxRetries = userCode.includes("max_retries") && (userCode.includes("attempts < max_retries") || userCode.includes("range(max_retries)") || userCode.includes("attempts >="));
      const noInfiniteWhile = !userCode.includes("while True:");
      if (!hasMaxRetries) {
        return { passed: false, message: "❌ 仍缺少明确的最大重试次数限制（max_retries）控制。" };
      }
      if (!noInfiniteWhile) {
        return { passed: false, message: "❌ 仍然残留了无条件 while True 结构，这在极端异常下依然有死循环风险！" };
      }
      return { passed: true, message: "🎉 精彩！你成功驯服了 AI 生成的死循环代码，为系统建立了坚固的重试熔断防线！" };
    }
  },
  {
    id: "vibe-fastapi-block",
    title: "案例二：FastAPI 异步路由中混入同步阻塞 IO 的全局卡死惨剧",
    aiPromptUsed: "用 FastAPI 写一个异步接口，抓取远程网页内容并分析，要高性能高并发。",
    language: "python",
    generatedCode: `from fastapi import FastAPI
import time
import requests # 致命隐患：这是同步阻塞库！

app = FastAPI()

@app.post("/api/fetch-analyze")
async def analyze_webpage(url: str):
    # AI 表面上写了 async def，却在里面调用了同步阻塞的 requests 和 time.sleep
    print(f"正在抓取 {url}...")
    # 模拟耗时网络 IO
    time.sleep(2.0) # 阻塞单线程事件循环 2 秒！
    content = requests.get(url).text # 再次同步阻塞！
    return {"length": len(content)}`,
    vibeIllusion: "接口声明了 async def，Swagger 文档也能正常点开，单个测试时返回也没问题，很多人便以为自己已经写出了'异步高并发微服务'。",
    hiddenDisasters: [
      {
        type: "单线程事件循环整体冻结 (Event Loop Starvation)",
        severity: "CRITICAL",
        lineLocation: "time.sleep(2.0) 与 requests.get",
        mechanism: "Python 的 asyncio 底层只有一个主事件循环线程。在 async def 内部调用同步阻塞函数，会直接霸占整个线程的 CPU，其他成百上千个等待在事件循环上的协程彻底被挂起，无法处理任何网络包！",
        consequence: "哪怕只有 5 个并发请求进来，整台服务器响应时间瞬间从 10ms 暴涨到 10 秒以上，用户端频繁超时 504 Gateway Timeout。"
      }
    ],
    verificationStrategy: {
      step1_mentalCheck: "【逻辑逆推】：在 async def 里看到任何没有加 await 的第三方网络库或 sleep 时，敲响警钟！",
      step2_bugHunt: "【漏洞猎杀】：寻找 requests, urllib, time.sleep 等阻塞库，必须替换为 httpx.AsyncClient 或 asyncio.sleep。",
      step3_counterExampleTest: "【反例击穿】：使用并发压测模拟两个同时进来的请求，观察第二个请求是否必须傻等第一个请求完成。",
      step4_cleanRefactor: "【硬化重构】：将 time.sleep 改为 await asyncio.sleep，将 requests 改为原生异步库或 run_in_executor。"
    },
    starterFixCode: `from fastapi import FastAPI
import asyncio
# 你的任务：
# 1. 绝不使用 time.sleep，改用 await asyncio.sleep
# 2. 确保在 async def 内部所有耗时操作都有 await 让出控制权！

app = FastAPI()

@app.post("/api/fetch-analyze")
async def analyze_webpage(url: str):
    print(f"正在非阻塞异步抓取 {url}...")
    # 请修复：使用 await asyncio.sleep 模拟非阻塞等待
    await asyncio.sleep(0.1)
    
    # 返回非阻塞结果
    return {"status": "ok", "url": url, "message": "非阻塞异步调度成功，事件循环未被卡死！"}

print("异步事件循环防护校验就绪！")
`,
    correctRefactoredCode: `from fastapi import FastAPI
import asyncio

app = FastAPI()

@app.post("/api/fetch-analyze")
async def analyze_webpage(url: str):
    print(f"正在非阻塞异步抓取 {url}...")
    await asyncio.sleep(0.1)
    return {"status": "ok", "url": url, "message": "非阻塞异步调度成功，事件循环未被卡死！"}

print("异步事件循环防护校验就绪！")
`,
    testCheck: (userCode: string) => {
      const hasAsyncSleep = userCode.includes("await asyncio.sleep");
      const noTimeSleep = !userCode.includes("time.sleep");
      if (!hasAsyncSleep) {
        return { passed: false, message: "❌ 缺少 await asyncio.sleep() 非阻塞挂起操作！" };
      }
      if (!noTimeSleep) {
        return { passed: false, message: "❌ 代码中仍存在阻塞主线程的 time.sleep()！" };
      }
      return { passed: true, message: "🎉 漂亮！你准确避开了 Python 异步编程中最具欺骗性的事件循环阻塞大坑！" };
    }
  }
];
