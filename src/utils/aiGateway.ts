/**
 * 统一 AI 网关 —— 三级降级链
 *
 * 优先级：
 *   1. 用户已配置 BYOK（自带 Key）→ llmClient 前端直连 OpenAI 兼容端点
 *   2. 后端存在 → 原 /api/gemini/*（本地开发跑服务时有效）
 *   3. 内置本地规则引擎（aiFallbackEngine）→ 永不落空
 *
 * 纯静态部署（无后端）下失效的只有第 2 级，其余照常工作。
 */

import { getLLMConfig, chatCompletion } from "./llmClient";
import type { ChatMessage } from "./llmClient";
import { generateIntelligentExplanation, generateIntelligentReview, generateIntelligentTutorReply } from "./aiFallbackEngine";

const A = {
  system: "system", user: "user", assistant: "assistant",
} as const;

function trimReply(text: string): string {
  return (text || "").trim();
}

async function tryBackend<T>(url: string, body: unknown, pick: (data: any) => T | null): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    const picked = pick(data);
    return picked && typeof picked === "string" && picked.trim() ? (picked as T) : null;
  } catch {
    return null;
  }
}

/** 智能伴读导师对话 */
export async function askTutor(
  messages: { role: string; content: string }[],
  ctx?: { topic?: string; track?: string; code?: string }
): Promise<string> {
  const cfg = getLLMConfig();
  if (cfg) {
    try {
      const sys: ChatMessage = {
        role: A.system,
        content:
          `你是 CodeMaster 编程学院的 AI 伴读导师。用最生活化、最形象的白话比喻拆解底层原理，` +
          `像好朋友一样循循善诱，绝不使用生僻术语堆砌。` +
          (ctx?.topic ? `当前正在学习的课题：${ctx.topic}。` : "") +
          (ctx?.track ? `所属课程：${ctx.track}。` : "") +
          (ctx?.code ? `用户当前的代码：\n\`\`\`\n${(ctx.code || "").slice(0, 1500)}\n\`\`\`` : ""),
      };
      const reply = await chatCompletion(cfg, [sys, ...(messages as ChatMessage[])]);
      return trimReply(reply);
    } catch {
      /* 降级下一级 */
    }
  }

  const backend = await tryBackend("/api/gemini/tutor", {
    messages,
    currentTopic: ctx?.topic,
    currentTrack: ctx?.track,
    currentCode: ctx?.code,
  }, (d) => d?.reply);
  if (backend) return backend;

  return generateIntelligentTutorReply(messages, ctx?.topic, ctx?.track, ctx?.code).reply;
}

/** 代码逐行讲解 */
export async function askExplain(code: string, language: string, question: string): Promise<string> {
  const cfg = getLLMConfig();
  if (cfg) {
    try {
      const reply = await chatCompletion(cfg, [
        { role: A.system, content: "你是资深的编程架构师讲师。用最通俗直观的比喻拆解代码执行逻辑，讲清每一行在做什么、为什么这样做。回答使用 Markdown 排版。" },
        { role: A.user, content: `语言：${language}\n用户的疑问：${question}\n\n代码：\n\`\`\`${language}\n${(code || "").slice(0, 4000)}\n\`\`\`` },
      ]);
      return trimReply(reply);
    } catch {
      /* 降级 */
    }
  }

  const backend = await tryBackend("/api/gemini/explain", { code, language, question }, (d) => d?.explanation);
  if (backend) return backend;

  const local = generateIntelligentExplanation(code, language, undefined, question);
  return [local.explanation, `**思维模型**：${local.mentalModel}`, `**核心要点**：${local.keyTakeaway}`].join("\n\n");
}

/** Vibe Coding 代码审评 */
export async function askReview(code: string, language: string, intent: string): Promise<string> {
  const cfg = getLLMConfig();
  if (cfg) {
    try {
      const reply = await chatCompletion(cfg, [
        { role: A.system, content: "你是严格到苛刻的架构师评审。审查 AI 生成的代码：还原真实执行链路、猎杀隐藏致命隐患、给出反例测试击穿方案与生产级重构建议。回答使用 Markdown 排版。" },
        { role: A.user, content: `审查意图：${intent}\n技术栈：${language}\n\n代码：\n\`\`\`${language}\n${(code || "").slice(0, 4000)}\n\`\`\`` },
      ]);
      return trimReply(reply);
    } catch {
      /* 降级 */
    }
  }

  const backend = await tryBackend("/api/gemini/review", { code, language, intent }, (d) => d?.review);
  if (backend) return backend;

  return generateIntelligentReview(code, language, intent).review;
}