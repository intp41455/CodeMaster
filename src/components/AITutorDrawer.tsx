import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Bot, 
  Send, 
  Sparkles, 
  HelpCircle, 
  RotateCcw, 
  User, 
  Lightbulb, 
  Terminal,
  ChevronRight
} from "lucide-react";
import { askTutor } from "../utils/aiGateway";
import { currentModelLabel } from "../utils/llmClient";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AITutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrackTitle?: string;
  currentLessonTitle?: string;
  currentCode?: string;
}

const QUICK_QUESTIONS = [
  "我完全零基础，代码本质到底是什么？",
  "面对一个陌生 GitHub 项目，第一步具体看哪个文件？",
  "让 AI 写复杂代码时，怎样才能做到心里有数？",
  "为什么 Agent 必须有最大步数限制（max_turns）？",
  "FastAPI 的 async def 到底比传统同步快在哪里？"
];

export const AITutorDrawer: React.FC<AITutorDrawerProps> = ({
  isOpen,
  onClose,
  currentTrackTitle,
  currentLessonTitle,
  currentCode,
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `你好！我是你的 **CodeMaster 架构师与 AI 伴读导师**。👋
无论你是零基础对某个术语感到困惑，还是在分析 GitHub 项目架构、审查 AI 生成的代码时遇到了疑问，随时都可以向我提问！我会用最生活化、最形象的白话比喻为你拆解底层真相。`,
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const reply = await askTutor(newMessages, {
        topic: currentLessonTitle,
        track: currentTrackTitle,
        code: currentCode,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (err: any) {
      const queried = [...newMessages];
      const lastContent = queried[queried.length - 1]?.content || "你好";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `（AI 服务暂时不可用，请稍后再试。\n您可以先手动学习当前课程内容。）\n\n刚才的问题是：${lastContent.slice(0, 120)}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const modelLabel = currentModelLabel();

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] border-l border-[rgba(26,26,26,0.08)] bg-white shadow-2xl flex flex-col text-[#1a1a1a] animate-slideInRight font-['Geist',sans-serif]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] px-5 py-4 bg-[#f8f7f4]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-blue-50 border border-blue-200 text-blue-700 shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-[#1a1a1a]">AI 伴读导师</span>
              <span className={`flex h-2 w-2 rounded-full animate-ping ${modelLabel ? "bg-emerald-500" : "bg-amber-500"}`} />
            </div>
            <p className="text-[11px] text-[rgba(26,26,26,0.5)]">
              {modelLabel ? `驱动模型：${modelLabel}` : "内置本地引擎 · 点右上角钥匙图标可接入你的 AI Key"}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-neutral-200 text-neutral-500 hover:text-[#1a1a1a] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm bg-white">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${
              m.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded shrink-0 text-xs ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 border border-neutral-200 text-blue-700"
              }`}
            >
              {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div
              className={`rounded-lg p-3.5 max-w-[85%] leading-relaxed ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none shadow-xs"
                  : "bg-[#f8f7f4] border border-[rgba(26,26,26,0.08)] text-[#1a1a1a] rounded-tl-none whitespace-pre-wrap font-sans"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-blue-600 text-xs p-2">
            <Bot className="h-4 w-4 animate-spin" />
            <span>AI 导师正在深入思考并组织最通俗的语言...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Starters */}
      <div className="border-t border-[rgba(26,26,26,0.08)] px-4 py-2.5 bg-[#f8f7f4]">
        <div className="flex items-center gap-1.5 text-[11px] text-[rgba(26,26,26,0.6)] mb-2">
          <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
          <span>初学者高频疑问（点击即问）：</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              className="shrink-0 rounded bg-white hover:bg-neutral-100 px-3 py-1 text-neutral-700 border border-[rgba(26,26,26,0.12)] transition-colors shadow-xs"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="border-t border-[rgba(26,26,26,0.08)] p-3 sm:p-4 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="问问导师：代码是什么意思？这个架构怎么理解？"
            className="flex-1 rounded bg-[#f8f7f4] border border-[rgba(26,26,26,0.12)] px-4 py-2.5 text-xs sm:text-sm text-[#1a1a1a] placeholder-neutral-400 focus:outline-none focus:border-blue-600"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn btn-run rounded h-10 w-10 flex items-center justify-center p-0 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
