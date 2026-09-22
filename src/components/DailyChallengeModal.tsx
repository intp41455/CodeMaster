import React, { useState } from "react";
import { 
  X, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Award, 
  HelpCircle, 
  Lightbulb, 
  Send, 
  RotateCcw,
  ArrowRight
} from "lucide-react";
import { DailyChallenge, UserProgress } from "../types";

interface DailyChallengeModalProps {
  challenge: DailyChallenge;
  isOpen: boolean;
  onClose: () => void;
  onCompleteChallenge: (challengeId: string, xpEarned: number) => void;
  isCompleted: boolean;
  progress: UserProgress;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  challenge,
  isOpen,
  onClose,
  onCompleteChallenge,
  isCompleted,
  progress,
}) => {
  if (!isOpen) return null;

  // Multiple choice state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  // Code fix state
  const [userCode, setUserCode] = useState<string>(challenge.starterCode || "");
  const [feedback, setFeedback] = useState<{ passed: boolean; message: string } | null>(
    isCompleted ? { passed: true, message: "你今天已经完成该挑战，成功领取了 100 XP！" } : null
  );
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(isCompleted);

  // Handle Option selection
  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
    const opt = challenge.options?.find((o) => o.id === optId);
    if (!opt) return;

    if (opt.isCorrect) {
      setFeedback({ passed: true, message: `🎉 回答正确！${opt.explanation}` });
      if (!isCompleted) {
        onCompleteChallenge(challenge.id, challenge.xpReward);
        setHasCelebrated(true);
      }
    } else {
      setFeedback({ passed: false, message: `❌ 隐患判断有误：${opt.explanation}` });
    }
  };

  // Handle Code Fix Validation
  const handleValidateCode = () => {
    if (!challenge.validator) return;
    const res = challenge.validator(userCode);
    setFeedback({ passed: res.passed, message: res.feedback });
    if (res.passed && !isCompleted) {
      onCompleteChallenge(challenge.id, challenge.xpReward);
      setHasCelebrated(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs animate-fadeIn font-['Geist',sans-serif]">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-[rgba(26,26,26,0.12)] bg-white p-6 sm:p-8 shadow-2xl space-y-6 text-[#1a1a1a]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded hover:bg-neutral-100 text-neutral-500 hover:text-[#1a1a1a] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(26,26,26,0.08)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800 font-mono">
                <Flame className="h-3.5 w-3.5 fill-current text-amber-600" />
                <span>每日代码挑战</span>
              </span>
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-mono text-neutral-600 border border-neutral-200">
                {challenge.dateStr}
              </span>
              <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-700 font-mono">
                {challenge.categoryLabel}
              </span>
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-mono text-neutral-600 border border-neutral-200">
                难度：{challenge.difficulty}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1a1a1a] pt-1">
              {challenge.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800 flex items-center gap-1.5 shadow-xs font-mono">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>奖励 +{challenge.xpReward} XP</span>
            </span>
          </div>
        </div>

        {/* Success Celebration Banner */}
        {hasCelebrated && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-emerald-100 text-emerald-700 shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-sm text-emerald-900">
                  🎉 今日挑战达成！连续打卡天数 +1
                </div>
                <div className="text-emerald-800 mt-0.5">
                  已累计连续练习 <strong className="text-amber-800 font-mono">{progress.currentStreakDays} 天</strong>，额外获得 +{challenge.xpReward} XP！
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Question & Instructions */}
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-[rgba(26,26,26,0.8)] leading-relaxed font-sans">
            {challenge.question}
          </p>

          {/* Context Code block */}
          {challenge.contextCode && (
            <div className="rounded border border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] p-4 font-mono text-xs text-[#1a1a1a] whitespace-pre-wrap leading-6 overflow-x-auto">
              {challenge.contextCode}
            </div>
          )}

          {/* Type 1: Multiple Choice Options */}
          {challenge.type === "multiple_choice" && challenge.options && (
            <div className="space-y-2.5 pt-1">
              <div className="text-xs font-semibold text-neutral-600 mb-1">
                请选择你的判定结论：
              </div>
              {challenge.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex items-start gap-3 p-3.5 rounded border cursor-pointer transition-all ${
                      isSelected
                        ? opt.isCorrect
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-emerald-500"
                          : "border-rose-600 bg-rose-50 text-rose-950 shadow-xs ring-1 ring-rose-500"
                        : "border-[rgba(26,26,26,0.08)] bg-white text-neutral-800 hover:border-blue-300 hover:bg-blue-50/20"
                    }`}
                  >
                    <div
                      className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? opt.isCorrect
                            ? "border-emerald-600 bg-emerald-600"
                            : "border-rose-600 bg-rose-600"
                          : "border-neutral-300"
                      }`}
                    >
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs sm:text-sm leading-relaxed">{opt.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Type 2: Code Fix Challenge */}
          {challenge.type === "code_fix" && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs text-neutral-600">
                <span className="flex items-center gap-1.5 text-blue-700 font-mono">
                  <Terminal className="h-4 w-4" />
                  <span>在下方修复并补全算法逻辑：</span>
                </span>
                <button
                  onClick={() => setUserCode(challenge.starterCode || "")}
                  className="hover:text-[#1a1a1a] flex items-center gap-1 text-neutral-500"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>重置代码</span>
                </button>
              </div>

              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                rows={10}
                className="w-full rounded bg-[#f8f7f4] border border-[rgba(26,26,26,0.12)] p-4 font-mono text-xs sm:text-sm text-[#1a1a1a] leading-6 focus:outline-none focus:border-blue-600"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleValidateCode}
                  className="btn btn-run rounded px-5 py-2 text-xs sm:text-sm font-semibold flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>运行测试 & 提交挑战</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`rounded border p-4 text-xs space-y-1.5 animate-fadeIn ${
                feedback.passed
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border-rose-300 bg-rose-50 text-rose-900"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {feedback.passed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                )}
                <span>{feedback.passed ? "判定准确 / 算法通过！" : "尚未通过"}</span>
              </div>
              <p className="leading-relaxed">{feedback.message}</p>
            </div>
          )}

          {/* Architectural Takeaway Box */}
          {(feedback?.passed || showHint) && (
            <div className="rounded border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-950 space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Lightbulb className="h-4 w-4 text-amber-600" />
                <span>架构师精读心法 (Key Takeaway)</span>
              </div>
              <p className="text-neutral-700 leading-relaxed text-[11px] font-sans">
                {challenge.takeaway}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[rgba(26,26,26,0.08)] pt-4">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{showHint ? "收起思路提示" : "查看思路提示"}</span>
          </button>

          <button
            onClick={onClose}
            className="btn btn-ghost rounded px-5 py-2 text-xs font-semibold"
          >
            完成打卡并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
