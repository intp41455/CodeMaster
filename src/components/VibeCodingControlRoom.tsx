import React, { useState } from "react";
import { 
  ShieldAlert, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Bug, 
  Play, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw,
  ArrowRight
} from "lucide-react";
import { VIBE_CODING_CASES } from "../data/vibeCodingLabData";
import { VibeCodingCase } from "../types";
import { generateIntelligentReview } from "../utils/aiFallbackEngine";

interface VibeCodingControlRoomProps {
  onCompleteCase: (caseId: string) => void;
  completedCaseIds: string[];
}

export const VibeCodingControlRoom: React.FC<VibeCodingControlRoomProps> = ({
  onCompleteCase,
  completedCaseIds,
}) => {
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);
  const currentCase: VibeCodingCase = VIBE_CODING_CASES[activeCaseIndex];

  const [userCode, setUserCode] = useState<string>(currentCase.starterFixCode);
  const [validationResult, setValidationResult] = useState<{ passed: boolean; message: string } | null>(null);
  const [aiReviewOutput, setAiReviewOutput] = useState<string>("");
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  // Switch case
  const handleSwitchCase = (idx: number) => {
    setActiveCaseIndex(idx);
    setUserCode(VIBE_CODING_CASES[idx].starterFixCode);
    setValidationResult(null);
    setAiReviewOutput("");
  };

  // Run Test Verification
  const handleVerify = () => {
    const res = currentCase.testCheck(userCode);
    setValidationResult(res);
    if (res.passed) {
      onCompleteCase(currentCase.id);
    }
  };

  // Trigger Gemini Deep Audit
  const handleRequestGeminiAudit = async () => {
    setIsReviewing(true);
    try {
      const res = await fetch("/api/gemini/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: userCode,
          language: currentCase.language,
          intent: currentCase.aiPromptUsed,
        }),
      });
      const data = await res.json();
      if (data && data.review) {
        setAiReviewOutput(data.review);
      } else {
        const local = generateIntelligentReview(userCode, currentCase.language, currentCase.aiPromptUsed);
        setAiReviewOutput(local.review);
      }
    } catch (e: any) {
      const local = generateIntelligentReview(userCode, currentCase.language, currentCase.aiPromptUsed);
      setAiReviewOutput(local.review);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-['Geist',sans-serif] text-[#1a1a1a]">
      {/* Top Banner: Vibe Coding Mastery */}
      <div className="rounded-2xl border border-[rgba(26,26,26,0.08)] bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-0.5 text-xs font-semibold text-amber-800">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              <span>专项能力二：AI 时代 Vibe Coding 掌控力与代码防线</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1a1a1a] font-['Cormorant_Garamond',serif]">
              代码主要由 AI 写，如何确保每一行都在你的掌控之中？
            </h1>
            <p className="text-xs sm:text-sm text-[rgba(26,26,26,0.6)] max-w-3xl">
              拒绝成为“无知的代码搬运工”！学习架构师<strong>“4 步掌控法则”</strong>：逻辑逆推 ➔ 漏洞猎杀 ➔ 埋点可观察 ➔ 反例测试击穿。学会识别 AI 写的死循环、并发竞争与阻塞大坑！
            </p>
          </div>

          {/* Case Selector */}
          <div className="flex items-center gap-2 bg-[#f8f7f4] p-1.5 rounded-xl border border-[rgba(26,26,26,0.08)]">
            {VIBE_CODING_CASES.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => handleSwitchCase(idx)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeCaseIndex === idx
                    ? "btn btn-run"
                    : "text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a]"
                }`}
              >
                案例 {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Step Methodology Guide Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-6 mt-4 border-t border-[rgba(26,26,26,0.08)] text-xs">
          <div className="rounded-xl bg-[#f8f7f4] border border-[rgba(26,26,26,0.08)] p-3 space-y-1">
            <div className="font-semibold text-amber-800">① 逻辑单步逆推</div>
            <p className="text-[rgba(26,26,26,0.6)] text-[11px]">还原输入、中间状态跳转和最终返回，讲清楚它做了什么。</p>
          </div>
          <div className="rounded-xl bg-[#f8f7f4] border border-[rgba(26,26,26,0.08)] p-3 space-y-1">
            <div className="font-semibold text-rose-800">② 隐患死角猎杀</div>
            <p className="text-[rgba(26,26,26,0.6)] text-[11px]">排查死循环、并发竞态、未捕获异常、Token雪崩与单线程卡死。</p>
          </div>
          <div className="rounded-xl bg-[#f8f7f4] border border-[rgba(26,26,26,0.08)] p-3 space-y-1">
            <div className="font-semibold text-blue-800">③ 植入可观察性</div>
            <p className="text-[rgba(26,26,26,0.6)] text-[11px]">亲手补充结构化日志、耗时追踪与熔断计数器，让黑盒变透明。</p>
          </div>
          <div className="rounded-xl bg-[#f8f7f4] border border-[rgba(26,26,26,0.08)] p-3 space-y-1">
            <div className="font-semibold text-emerald-800">④ 编写反例测试</div>
            <p className="text-[rgba(26,26,26,0.6)] text-[11px]">用极端边界值和网络故障反例敲打代码，直到测试完全通过。</p>
          </div>
        </div>
      </div>

      {/* Main Case Audit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Illusion & Hidden Disasters (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Prompt & What AI Generated */}
          <div className="rounded-2xl border border-[rgba(26,26,26,0.08)] bg-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-[#1a1a1a]">
                当时给 AI 的 Prompt 提示词：
              </span>
            </div>
            <div className="rounded-lg bg-[#f8f7f4] p-3 text-xs text-blue-900 font-mono italic border border-[rgba(26,26,26,0.08)]">
              "{currentCase.aiPromptUsed}"
            </div>

            {/* Generated Code Display */}
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-[rgba(26,26,26,0.6)]">
                AI 生成的代码（表面看似正常）：
              </span>
              <pre className="rounded-lg bg-[#f8f7f4] p-3 font-mono text-xs text-rose-800 whitespace-pre-wrap leading-5 border border-rose-200 overflow-x-auto">
                {currentCase.generatedCode}
              </pre>
            </div>

            {/* The Illusion */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 space-y-1">
              <strong>🎭 为什么容易骗过初学者？</strong>
              <p className="text-[rgba(26,26,26,0.7)] text-[11px] leading-relaxed">
                {currentCase.vibeIllusion}
              </p>
            </div>
          </div>

          {/* Hidden Disasters Deep Dive */}
          <div className="rounded-2xl border border-rose-200 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <Bug className="h-4 w-4" />
              <span>潜藏的致命生产事故隐患 (Bug Hunt)</span>
            </div>

            <div className="space-y-3">
              {currentCase.hiddenDisasters.map((dis, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-800">{dis.type}</span>
                    <span className="rounded bg-rose-100 border border-rose-200 px-2 py-0.5 text-[10px] font-mono text-rose-700">
                      {dis.severity}
                    </span>
                  </div>

                  <div className="text-[rgba(26,26,26,0.6)] text-[11px]">
                    <strong>发生位置：</strong>
                    <span className="font-mono text-[#1a1a1a] ml-1">{dis.lineLocation}</span>
                  </div>

                  <p className="text-[rgba(26,26,26,0.7)] leading-relaxed text-[11px]">
                    <strong>炸崩机制：</strong>
                    {dis.mechanism}
                  </p>

                  <div className="rounded bg-rose-50 p-2 text-[11px] text-rose-800 border border-rose-200">
                    <strong>💣 事故后果：</strong>
                    {dis.consequence}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Refactoring & Testing Workshop (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-[rgba(26,26,26,0.08)] bg-white p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] pb-3">
              <div className="space-y-0.5">
                <h3 className="font-semibold text-sm text-[#1a1a1a] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>硬化重构工作台 (Refactor & Fix)</span>
                </h3>
                <p className="text-xs text-[rgba(26,26,26,0.6)]">
                  请独立修改并修正 AI 的缺陷代码，加上熔断保护与健全边界！
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRequestGeminiAudit}
                  disabled={isReviewing}
                  className="inline-flex items-center gap-1.5 rounded bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>{isReviewing ? "AI 审计中..." : "Gemini 深度审查"}</span>
                </button>

                <button
                  onClick={() => setUserCode(currentCase.starterFixCode)}
                  className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-[#1a1a1a] transition-colors"
                  title="重置代码"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] overflow-hidden">
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                rows={14}
                className="w-full bg-transparent p-4 font-mono text-xs sm:text-sm text-[#1a1a1a] leading-6 focus:outline-none selection:bg-blue-100"
              />
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-[rgba(26,26,26,0.6)]">
                验证策略：{currentCase.verificationStrategy.step4_cleanRefactor}
              </div>

              <button
                onClick={handleVerify}
                className="btn btn-run inline-flex items-center gap-2 rounded px-5 py-2 text-xs sm:text-sm font-semibold transition-all active:scale-95"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>运行反例测试 & 验证掌控力</span>
              </button>
            </div>

            {/* Validation Feedback */}
            {validationResult && (
              <div
                className={`rounded-xl border p-4 text-xs space-y-1.5 animate-fadeIn ${
                  validationResult.passed
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-rose-300 bg-rose-50 text-rose-900"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {validationResult.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                  )}
                  <span>
                    {validationResult.passed ? "恭喜！成功驯服 AI 代码！" : "测试未通过"}
                  </span>
                </div>
                <p className="leading-relaxed">{validationResult.message}</p>
              </div>
            )}

            {/* Gemini Live AI Audit Report */}
            {aiReviewOutput && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wide">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <span>Gemini 架构师代码质询报告</span>
                </div>
                <pre className="font-mono text-xs text-[#1a1a1a] whitespace-pre-wrap leading-5 bg-white p-3 rounded-lg border border-[rgba(26,26,26,0.08)] max-h-60 overflow-y-auto">
                  {aiReviewOutput}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
