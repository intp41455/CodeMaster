/**
 * AI 连接器 —— OpenAI 兼容统一客户端（BYOK 用户自带 Key）
 *
 * 设计要点：
 * - 一个 chat/completions 请求格式覆盖全部主流模型：
 *   OpenAI / Gemini（官方 OpenAI 兼容端点）/ DeepSeek / 通义 / 智谱 / Moonshot / Ollama
 * - 用户 Key 仅保存在浏览器本地（codemaster_llm_config），不出站、不经过本站服务器
 * - 未配置 Key 时 getLLMConfig() 返回 null，调用方自动降级
 */

export interface LLMProviderPreset {
  id: string;
  label: string;
  baseURL: string;
  defaultModel: string;
  placeholder?: string;
  docs?: string;
}

export const LLM_PROVIDERS: LLMProviderPreset[] = [
  { id: "openai", label: "OpenAI", baseURL: "https://api.openai.com/v1", defaultModel: "gpt-4o-mini" },
  { id: "gemini", label: "Google Gemini", baseURL: "https://generativelanguage.googleapis.com/v1beta/openai", defaultModel: "gemini-2.5-flash", docs: "https://aistudio.google.com/apikey" },
  { id: "deepseek", label: "DeepSeek", baseURL: "https://api.deepseek.com/v1", defaultModel: "deepseek-chat", docs: "https://platform.deepseek.com" },
  { id: "qwen", label: "通义千问", baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1", defaultModel: "qwen-plus", docs: "https://bailian.console.aliyun.com" },
  { id: "zhipu", label: "智谱 GLM", baseURL: "https://open.bigmodel.cn/api/paas/v4", defaultModel: "glm-4-flash", docs: "https://open.bigmodel.cn" },
  { id: "moonshot", label: "Moonshot Kimi", baseURL: "https://api.moonshot.cn/v1", defaultModel: "moonshot-v1-8k", docs: "https://platform.moonshot.cn" },
  { id: "ollama", label: "Ollama 本地", baseURL: "http://localhost:11434/v1", defaultModel: "llama3.2", placeholder: "本地模型无需 Key，可留空" },
  { id: "custom", label: "自定义 OpenAI 兼容端点", baseURL: "", defaultModel: "", placeholder: "示例：https://your-gateway.example.com/v1" },
];

export interface LLMConfig {
  providerId: string;
  baseURL: string;
  apiKey: string;
  model: string;
  temperature?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const CONFIG_KEY = "codemaster_llm_config";

function normalizeBaseURL(base: string): string {
  const trimmed = (base || "").trim().replace(/\/+$/, "");
  return trimmed.length > 0 ? trimmed + "/" : "";
}

/** 读取用户配置（无/损坏返回 null） */
export function getLLMConfig(): LLMConfig | null {
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const cfg = JSON.parse(raw) as LLMConfig;
    if (!cfg || !cfg.baseURL || !cfg.model) return null;
    if (!cfg.apiKey && cfg.providerId !== "ollama") return null;
    return cfg;
  } catch {
    return null;
  }
}

export function saveLLMConfig(cfg: LLMConfig): void {
  try {
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  } catch {
    /* 存储不可用时静默失败 */
  }
}

export function clearLLMConfig(): void {
  try {
    window.localStorage.removeItem(CONFIG_KEY);
  } catch {
    /* ignore */
  }
}

/** 当前生效配置的人类可读标签（供 UI 展示"当前模型"） */
export function currentModelLabel(): string | null {
  const cfg = getLLMConfig();
  if (!cfg) return null;
  const provider = LLM_PROVIDERS.find((p) => p.id === cfg.providerId);
  return provider ? `${provider.label} · ${cfg.model}` : cfg.model;
}

/**
 * OpenAI 兼容 chat/completions 调用。
 * 支持 AbortSignal 超时；失败抛带状态码与详情的中文错误。
 */
export async function chatCompletion(
  cfg: LLMConfig,
  messages: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  const url = normalizeBaseURL(cfg.baseURL) + "chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey || ""}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: cfg.temperature ?? 0.7,
      max_tokens: 2048,
    }),
    signal,
  });

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j?.error?.message || JSON.stringify(j).slice(0, 240);
    } catch {
      detail = (await res.text()).slice(0, 240);
    }
    throw new Error(`模型接口返回 ${res.status}：${detail}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text) {
    throw new Error("模型接口返回了空内容");
  }
  return text;
}

/** 测试连接：发一条最小指令，返回是否成功及模型回复摘要 */
export async function testConnection(cfg: LLMConfig): Promise<{ ok: boolean; message: string }> {
  try {
    const signal = AbortSignal.timeout(20000);
    const reply = await chatCompletion(cfg, [{ role: "user", content: "只回复两个字：OK" }], signal);
    return { ok: true, message: `连接成功，模型回复：${reply.slice(0, 60)}` };
  } catch (e: any) {
    return { ok: false, message: String(e?.message || e).slice(0, 200) };
  }
}