import { GitHubProjectLab } from "../types";

export const GITHUB_LAB_PROJECTS: GitHubProjectLab[] = [
  {
    id: "lab-fastapi-agent",
    title: "实战案例一：FastAPI 异步智能体微服务",
    repoName: "open-agentic/fastapi-agent-worker",
    stars: "14.2k",
    techStack: ["Python 3.11", "FastAPI", "Pydantic v2", "Asyncio", "OpenAI / Gemini SDK"],
    summary: "GitHub 上典型的工业级异步 Agent 后端，负责接收前端 WebSocket/HTTP 提示词，调度注册的工具集，并以流式 SSE 返回思考过程。",
    readme: `# FastAPI Agent Worker (企业级异步智能体微服务)

## 📌 项目定位
本项目提供了一套高并发、无状态的 Agent 执行环境。支持动态注册本地工具（Python 函数），驱动 LLM 进行 ReAct 循环，并通过 SSE (Server-Sent Events) 向客户端实时推送推理日志。

## 🚀 3分钟快速启动
\`\`\`bash
# 1. 创建虚拟环境并安装依赖
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2. 配置环境变量
cp .env.example .env

# 3. 启动开发服务器 (支持热重载)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
\`\`\`

## 📂 核心目录架构
- \`app/main.py\`: FastAPI 应用初始化与全局生命周期 (Lifespan)
- \`app/routers/agent.py\`: 暴露 \`/api/v1/agent/run\` 路由
- \`app/core/engine.py\`: Agent 思考-行动循环执行核心 (ReAct)
- \`app/tools/registry.py\`: 本地工具注册与动态参数解析
- \`tests/test_agent.py\`: 自动化单元测试与端到端测试
`,
    architectureBlueprint: {
      layers: [
        {
          name: "1. 接入层 (API Gateway / Router)",
          role: "处理 HTTP 请求校验，阻断畸形参数，响应客户端",
          components: ["FastAPI App", "routers/agent.py", "Pydantic Schemas"],
          color: "border-sky-500 bg-sky-950/40 text-sky-300"
        },
        {
          name: "2. 核心调度层 (Agent Core Engine)",
          role: "状态机维护、Prompt 组装、ReAct 循环控制器",
          components: ["core/engine.py", "AgentState", "MaxTurnGuard"],
          color: "border-purple-500 bg-purple-950/40 text-purple-300"
        },
        {
          name: "3. 工具注册中心 (Tool Registry)",
          role: "将 Python 普通函数自动映射为 LLM Function Calling 格式",
          components: ["tools/registry.py", "search_tool", "calc_tool"],
          color: "border-emerald-500 bg-emerald-950/40 text-emerald-300"
        },
        {
          name: "4. 外部提供商 (LLM Provider)",
          role: "异步网络 IO，接收流式 Token 回调",
          components: ["Gemini / OpenAI API", "AsyncHttpClient"],
          color: "border-amber-500 bg-amber-950/40 text-amber-300"
        }
      ],
      dataFlow: "HTTP POST ➔ Pydantic 校验 ➔ Engine 初始化状态 ➔ LLM 生成 Thought/Action ➔ Tool 命中执行 ➔ Observation 拼装 ➔ 最终输出"
    },
    fileTree: {
      name: "fastapi-agent-worker",
      path: "/",
      type: "directory",
      children: [
        {
          name: "requirements.txt",
          path: "/requirements.txt",
          type: "file",
          language: "text",
          roleDescription: "【看依赖】识别技术栈：看到 fastapi, pydantic, uvicorn, httpx，立刻知道是异步接口服务",
          content: `fastapi>=0.110.0
uvicorn[standard]>=0.28.0
pydantic>=2.6.0
httpx>=0.27.0
pytest>=8.0.0
python-dotenv>=1.0.0`
        },
        {
          name: "app",
          path: "/app",
          type: "directory",
          children: [
            {
              name: "main.py",
              path: "/app/main.py",
              type: "file",
              language: "python",
              roleDescription: "【看入口】程序的诞生地，初始化 FastAPI 实例、挂载中间件和路由",
              content: `from fastapi import FastAPI
from app.routers import agent_router

app = FastAPI(title="FastAPI Agent Worker", version="1.0.0")

# 挂载核心业务路由
app.include_router(agent_router.router, prefix="/api/v1/agent")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "agent-worker"}`
            },
            {
              name: "routers",
              path: "/app/routers",
              type: "directory",
              children: [
                {
                  name: "agent_router.py",
                  path: "/app/routers/agent_router.py",
                  type: "file",
                  language: "python",
                  roleDescription: "【看路由】定义接口入参格式与 HTTP 状态码",
                  content: `from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.engine import AgentEngine

router = APIRouter()

class RunRequest(BaseModel):
    query: str
    max_turns: int = 5

@router.post("/run")
async def run_agent(req: RunRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    engine = AgentEngine(max_turns=req.max_turns)
    result = await engine.execute(req.query)
    return result`
                }
              ]
            },
            {
              name: "core",
              path: "/app/core",
              type: "directory",
              children: [
                {
                  name: "engine.py",
                  path: "/app/core/engine.py",
                  type: "file",
                  language: "python",
                  roleDescription: "【看核心】ReAct 思考循环引擎，本项目的灵魂代码",
                  content: `import asyncio
from app.tools.registry import execute_tool

class AgentEngine:
    def __init__(self, max_turns: int = 5):
        self.max_turns = max_turns
        self.history = []

    async def execute(self, query: str):
        turn = 0
        current_thought = query
        while turn < self.max_turns:
            turn += 1
            # 模拟 LLM 决策
            if "天气" in current_thought:
                tool_result = execute_tool("get_weather", {"city": "Beijing"})
                current_thought = f"已获取天气: {tool_result}"
                continue
            # 最终回答
            return {"status": "SUCCESS", "answer": f"已完成任务: {current_thought}", "turns_used": turn}
        return {"status": "FAILED", "reason": "Max turns exceeded"}`
                }
              ]
            },
            {
              name: "tools",
              path: "/app/tools",
              type: "directory",
              children: [
                {
                  name: "registry.py",
                  path: "/app/tools/registry.py",
                  type: "file",
                  language: "python",
                  roleDescription: "【看工具】工具注册中心与反射调用",
                  content: `TOOLS = {
    "get_weather": lambda args: f"{args.get('city', '未知城市')} 晴 22℃",
    "calc": lambda args: "42"
}

def execute_tool(name: str, args: dict):
    tool = TOOLS.get(name)
    if not tool:
        raise ValueError(f"Unknown tool: {name}")
    return tool(args)`
                }
              ]
            }
          ]
        }
      ]
    },
    requestTrace: {
      title: "追踪一次真实的请求全链路：用户发送 '查询北京天气'",
      description: "理解从客户端在浏览器点击发送，到代码逐层跳转，最后返回 JSON 的完整时序路径。",
      steps: [
        {
          step: 1,
          location: "客户端 ➔ Nginx/Uvicorn",
          action: "接收原始网络数据包并进行 HTTP 报文解析",
          detail: "端口 8000 捕获 TCP 连接，通过 ASGI 协议将请求字典传递给 FastAPI 应用程序",
          incomingData: 'POST /api/v1/agent/run {"query": "查询北京天气", "max_turns": 5}',
          outgoingData: "ASGI scope 与 receive callable 准备完毕"
        },
        {
          step: 2,
          location: "app/routers/agent_router.py",
          action: "Pydantic 校验与路由分发",
          detail: "RunRequest 校验传入字段类型，确保 query 为有效字符串，max_turns 默认为 5",
          incomingData: '原始 JSON 负载 {"query": "查询北京天气"}',
          outgoingData: "Python 强类型 RunRequest 对象已实例化"
        },
        {
          step: 3,
          location: "app/core/engine.py: execute()",
          action: "进入 ReAct 状态机循环第 1 轮",
          detail: "检查当前 query 包含'天气'，决策出需要调用工具 get_weather，构建工具调用入参 {'city': 'Beijing'}",
          incomingData: "query: '查询北京天气'",
          outgoingData: "发起工具执行指令: tool_name='get_weather'"
        },
        {
          step: 4,
          location: "app/tools/registry.py: execute_tool()",
          action: "执行真实 Python 函数并返回 Observation",
          detail: "从 TOOLS 字典中查找 get_weather 函数，传入参数并计算结果",
          incomingData: "{'city': 'Beijing'}",
          outgoingData: "'Beijing 晴 22℃'"
        },
        {
          step: 5,
          location: "app/core/engine.py ➔ agent_router.py",
          action: "拼装最终答案并返回 200 OK",
          detail: "引擎判定已满足用户诉求，跳出 while 循环，返回统一封装响应体",
          incomingData: "Observation: 'Beijing 晴 22℃'",
          outgoingData: 'HTTP 200 {"status": "SUCCESS", "answer": "已完成任务: 已获取天气: Beijing 晴 22℃", "turns_used": 1}'
        }
      ]
    },
    keySourceWalkthrough: {
      filePath: "/app/core/engine.py",
      title: "核心 ReAct 引擎关键源码透析",
      code: `class AgentEngine:
    def __init__(self, max_turns: int = 5):
        self.max_turns = max_turns

    async def execute(self, query: str):
        turn = 0
        current_thought = query
        while turn < self.max_turns:
            turn += 1
            # 1. 模拟调用 LLM 获取思考与行动计划
            # 2. 如果判定为工具调用，则调度 registry.execute_tool
            # 3. 如果判定已得出答案，直接 return 退出循环
            return {"status": "SUCCESS", "answer": current_thought, "turns_used": turn}
        return {"status": "FAILED", "reason": "Max turns exceeded"}`,
      breakdowns: [
        {
          lineRange: "Line 2 - 3",
          codeSnippet: "def __init__(self, max_turns: int = 5):",
          plainChineseExplanation: "【防御性设计】永远不要允许 Agent 无限制执行！这里设置 max_turns 是为了防止大模型遇到异常时不断重试，造成巨额 Token 账单或服务器拒绝服务。",
          architectureSignificance: "生产级 Agent 系统的熔断器（Circuit Breaker）基础组件。"
        },
        {
          lineRange: "Line 7 - 12",
          codeSnippet: "while turn < self.max_turns:\n    turn += 1",
          plainChineseExplanation: "【状态机步进】每一轮循环代表一次'思考-行动-观测'。在实际商业项目中，这里会配合 await asyncio.sleep 避免过度密集打崩模型网关。",
          architectureSignificance: "单步状态转移设计，支持流式日志推送与断点恢复（Checkpointing）。"
        }
      ]
    },
    hotfixChallenge: {
      id: "hotfix-fastapi-1",
      title: "开源实战演练：修复未捕获的工具未知异常导致服务 500 崩溃的 Bug",
      scenario: "在生产监控中发现：当用户询问一个没有注册的工具时（如'帮我翻译'），execute_tool 抛出未捕获的 ValueError，导致整个 FastAPI 接口抛出 500 Internal Server Error，严重影响服务可用性。我们需要完成一个小改动：将其优雅降级捕获，告知模型工具不存在，而不是直接炸崩服务！",
      targetFile: "/app/tools/registry.py",
      buggyCode: `def execute_tool(name: str, args: dict):
    tool = TOOLS.get(name)
    if not tool:
        # BUG: 这里直接抛出异常导致上层 500 崩溃
        raise ValueError(f"Unknown tool: {name}")
    return tool(args)`,
      expectedFixDescription: "修改 execute_tool 函数：当 not tool 时，不要抛出异常，而是优雅返回错误提示字符串：f'错误：未找到名为 {name} 的工具，请检查工具列表。'",
      testValidation: (code: string) => {
        const hasRaise = code.includes("raise ValueError");
        const hasGracefulReturn = code.includes("return") && (code.includes("未找到") || code.includes("not found") || code.includes("Unknown tool"));
        if (hasRaise) {
          return { passed: false, feedback: "❌ 仍然包含 raise ValueError，这会导致生产环境 500 报错未修复！" };
        }
        if (!hasGracefulReturn) {
          return { passed: false, feedback: "❌ 缺少优雅降级返回语句，当 not tool 时应 return 友好错误提示。" };
        }
        return { passed: true, feedback: "🎉 完美！你成功为该开源项目完成了一次高质量的 Bug 修复与热补丁，避免了生产环境 500 崩溃！" };
      },
      hint: "将 raise ValueError(f'Unknown tool: {name}') 替换为 return f'错误：未找到名为 {name} 的工具'。"
    }
  },
  {
    id: "lab-spring-ai-hub",
    title: "实战案例二：Spring AI 企业知识库 RAG 中台",
    repoName: "enterprise-cloud/spring-ai-rag-platform",
    stars: "9.8k",
    techStack: ["Java 21", "Spring Boot 3.3", "Spring AI", "PgVector", "Maven"],
    summary: "企业级 Java 智能体中台项目，通过 Spring AI 的 ChatClient 与 VectorStore 封装，打通企业私有文档的切片、Embedding 向量化与在线相似度召回。",
    readme: `# Spring AI RAG Platform (企业级检索增强平台)

## 📌 架构特征
- 纯正 Spring 风格配置，基于 \`application.yml\` 无缝切换本地 Ollama 与线上 Gemini
- 原生整合 \`VectorStore\`，利用 PostgreSQL PgVector 插件进行十万级向量余弦相似度检索
- 统一 RESTful API 与 Spring Actuator 生产级健康度检查

## 🚀 启动指引
\`\`\`bash
# 启动本地 PostgreSQL 向量数据库
docker compose up -d

# Maven 构建与启动
./mvnw spring-boot:run
\`\`\`
`,
    architectureBlueprint: {
      layers: [
        {
          name: "1. 控制层 (Web / REST Controller)",
          role: "处理 HTTP 请求，接收用户知识库检索提问",
          components: ["RagChatController.java", "QuestionDto.java"],
          color: "border-emerald-500 bg-emerald-950/40 text-emerald-300"
        },
        {
          name: "2. 业务中枢 (Service / RAG Pipeline)",
          role: "执行相似度检索，构建 RAG Prompt 模板，调用模型",
          components: ["KnowledgeRagService.java", "ChatClient", "PromptTemplate"],
          color: "border-indigo-500 bg-indigo-950/40 text-indigo-300"
        },
        {
          name: "3. 存储与向量检索 (Vector Store)",
          role: "维护私有文档分块（Chunks），计算余弦相似度（Cosine Distance）",
          components: ["VectorStoreConfig.java", "PgVectorStore", "DocumentChunkRepository"],
          color: "border-amber-500 bg-amber-950/40 text-amber-300"
        }
      ],
      dataFlow: "用户提问 ➔ Controller ➔ VectorStore 检索 Top 3 文档 ➔ 模板引擎渲染系统上下文 ➔ Spring AI ChatClient ➔ 结构化答案输出"
    },
    fileTree: {
      name: "spring-ai-rag-platform",
      path: "/",
      type: "directory",
      children: [
        {
          name: "pom.xml",
          path: "/pom.xml",
          type: "file",
          language: "xml",
          roleDescription: "【看依赖】Maven 工程配置文件，管理 Spring Boot 与 Spring AI 版本",
          content: `<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.enterprise.ai</groupId>
  <artifactId>spring-ai-rag-platform</artifactId>
  <version>1.0.0</version>
  <dependencies>
    <dependency>
      <groupId>org.springframework.ai</groupId>
      <artifactId>spring-ai-gemini-spring-boot-starter</artifactId>
      <version>1.0.0-M1</version>
    </dependency>
    <dependency>
      <groupId>org.springframework.ai</groupId>
      <artifactId>spring-ai-pgvector-store-spring-boot-starter</artifactId>
    </dependency>
  </dependencies>
</project>`
        },
        {
          name: "src",
          path: "/src",
          type: "directory",
          children: [
            {
              name: "main",
              path: "/src/main",
              type: "directory",
              children: [
                {
                  name: "java",
                  path: "/src/main/java",
                  type: "directory",
                  children: [
                    {
                      name: "com/enterprise/ai/controller/RagChatController.java",
                      path: "/src/main/java/com/enterprise/ai/controller/RagChatController.java",
                      type: "file",
                      language: "java",
                      roleDescription: "【看接口】Controller 暴露 /api/rag/ask 入口",
                      content: `package com.enterprise.ai.controller;

import org.springframework.web.bind.annotation.*;
import com.enterprise.ai.service.KnowledgeRagService;

@RestController
@RequestMapping("/api/rag")
public class RagChatController {
    private final KnowledgeRagService ragService;

    public RagChatController(KnowledgeRagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/ask")
    public String askQuestion(@RequestParam String question) {
        return ragService.generateAnswer(question);
    }
}`
                    },
                    {
                      name: "com/enterprise/ai/service/KnowledgeRagService.java",
                      path: "/src/main/java/com/enterprise/ai/service/KnowledgeRagService.java",
                      type: "file",
                      language: "java",
                      roleDescription: "【看核心】Service 实现 RAG 检索拼装与 ChatClient 调用",
                      content: `package com.enterprise.ai.service;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class KnowledgeRagService {
    public String generateAnswer(String question) {
        // 1. 模拟向量相似度检索
        List<String> docs = List.of("CodeMaster 包含 9 大技术体系与 GitHub 源码实战专项。");
        // 2. 拼装 Prompt 并返回
        return "基于知识库为您解答：[" + question + "] -> " + docs.get(0);
    }
}`
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    requestTrace: {
      title: "Spring Boot 核心请求链路追踪：POST /api/rag/ask",
      description: "观察 Spring 动态代理、依赖注入容器与 Spring AI 的协作全过程。",
      steps: [
        {
          step: 1,
          location: "Tomcat Connector ➔ DispatcherServlet",
          action: "前端控制器拦截 HTTP 请求",
          detail: "Spring MVC 核心总管 DispatcherServlet 根据 HandlerMapping 匹配到 RagChatController",
          incomingData: 'POST /api/rag/ask?question=CodeMaster的毕业考核是什么',
          outgoingData: "找到映射方法 askQuestion"
        },
        {
          step: 2,
          location: "RagChatController ➔ KnowledgeRagService",
          action: "通过构造器注入的 Service 实例调用",
          detail: "Spring 容器自动管理单例生命周期，解耦 Controller 与业务层",
          incomingData: "'CodeMaster的毕业考核是什么'",
          outgoingData: "进入 Service 业务管道"
        },
        {
          step: 3,
          location: "KnowledgeRagService ➔ VectorStore",
          action: "余弦相似度检索向量库",
          detail: "将问题转换为 768 维 Embedding 向量，向 PgVector 发起最近邻（ANN）查询",
          incomingData: "Embedding: [0.12, -0.45, ...]",
          outgoingData: "返回相关度最高的文档片段"
        },
        {
          step: 4,
          location: "Spring AI ChatClient",
          action: "注入 System Prompt 触发模型推理",
          detail: "把文档和问题结合，通过 HTTP 协议发送给底层大模型",
          incomingData: "完整 RAG Prompt 上下文",
          outgoingData: "模型生成的纯净回答文本"
        }
      ]
    },
    keySourceWalkthrough: {
      filePath: "/src/main/java/com/enterprise/ai/service/KnowledgeRagService.java",
      title: "Spring AI 核心业务服务源码解析",
      code: `@Service
public class KnowledgeRagService {
    public String generateAnswer(String question) {
        List<String> docs = List.of("CodeMaster 包含 9 大技术体系与 GitHub 源码实战专项。");
        return "基于知识库为您解答：[" + question + "] -> " + docs.get(0);
    }
}`,
      breakdowns: [
        {
          lineRange: "Line 1",
          codeSnippet: "@Service",
          plainChineseExplanation: "【Spring 注解声明】这行注解告诉 Spring 容器：请在启动时自动把这个类实例化为一个 Bean，并随时准备注入给 Controller 使用。",
          architectureSignificance: "Spring 控制反转（IOC）体系的基础标志。"
        }
      ]
    },
    hotfixChallenge: {
      id: "hotfix-spring-ai-1",
      title: "开源实战演练：为知识库问答增加空输入防护与默认兜底响应",
      scenario: "用户如果在前端输入空白字符或纯空格，系统直接发给向量库会导致不必要的数据库查询开销。我们需要在 generateAnswer 方法开头加上输入防御性检查！",
      targetFile: "/src/main/java/com/enterprise/ai/service/KnowledgeRagService.java",
      buggyCode: `public String generateAnswer(String question) {
    // 缺少空值校验
    List<String> docs = List.of("CodeMaster 包含 9 大技术体系与 GitHub 源码实战专项。");
    return "基于知识库为您解答：[" + question + "] -> " + docs.get(0);
}`,
      expectedFixDescription: "在方法开头添加判断：如果 question == null 或者 question.trim().isEmpty()，直接返回 '请输入有效的问题内容！'",
      testValidation: (code: string) => {
        const hasNullCheck = code.includes("question == null");
        const hasEmptyCheck = code.includes("isEmpty()") || code.includes("trim().length() == 0");
        const hasReturn = code.includes("return \"请输入有效的问题内容！\"") || code.includes("return '请输入有效的问题内容！'") || code.includes("请输入有效");
        if (!hasNullCheck && !hasEmptyCheck) {
          return { passed: false, feedback: "❌ 未检测到 question == null 或 isEmpty() 空值判定！" };
        }
        if (!hasReturn) {
          return { passed: false, feedback: "❌ 校验失败后未返回指定的兜底提示信息。" };
        }
        return { passed: true, feedback: "🎉 太棒了！你为企业级 Spring AI 平台成功添加了健壮的防御性输入防护代码！" };
      },
      hint: "在方法最前面加入：if (question == null || question.trim().isEmpty()) { return \"请输入有效的问题内容！\"; }"
    }
  }
];
