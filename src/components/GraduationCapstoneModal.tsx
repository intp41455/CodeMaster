import React, { useState } from "react";
import { 
  X, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Send, 
  Terminal, 
  RotateCcw,
  Star
} from "lucide-react";
import { GRADUATION_PROJECT } from "../data/graduationProjectData";

interface GraduationCapstoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGraduationPass: () => void;
  isGraduated: boolean;
}

export const GraduationCapstoneModal: React.FC<GraduationCapstoneModalProps> = ({
  isOpen,
  onClose,
  onGraduationPass,
  isGraduated,
}) => {
  if (!isOpen) return null;

  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [codeAnswer, setCodeAnswer] = useState<string>(
    GRADUATION_PROJECT.stages[3].codeChallenge?.starter || ""
  );
  const [stageError, setStageError] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState<boolean>(isGraduated);

  const stage = GRADUATION_PROJECT.stages[currentStageIdx];
  const isLastStage = currentStageIdx === GRADUATION_PROJECT.stages.length - 1;

  // Handle Option selection
  const handleSelectOption = (optId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [stage.id]: optId }));
    setStageError(null);
  };

  // Next or Submit Stage
  const handleProceed = () => {
    // Validate current stage
    if (stage.options) {
      const selectedId = selectedAnswers[stage.id];
      if (!selectedId) {
        setStageError("请先选择一个你认为最合理的答案选项！");
        return;
      }
      const option = stage.options.find((o) => o.id === selectedId);
      if (!option?.isCorrect) {
        setStageError(`❌ 回答有误：${option?.explanation}`);
        return;
      }
    } else if (stage.codeChallenge) {
      const res = stage.codeChallenge.validator(codeAnswer);
      if (!res.passed) {
        setStageError(res.message);
        return;
      }
    }

    // Passed current stage!
    setStageError(null);
    if (!isLastStage) {
      setCurrentStageIdx((prev) => prev + 1);
    } else {
      // Completed all stages!
      setShowCertificate(true);
      onGraduationPass();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs animate-fadeIn font-['Geist',sans-serif]">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-[rgba(26,26,26,0.12)] bg-white p-6 sm:p-8 shadow-2xl space-y-6 text-[#1a1a1a]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded hover:bg-neutral-100 text-neutral-400 hover:text-[#1a1a1a] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Certificate View (If passed) */}
        {showCertificate ? (
          <div className="space-y-6 text-center py-4">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded bg-blue-50 border border-blue-200 text-blue-700 shadow-sm">
              <Award className="h-10 w-10 animate-bounce" />
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-amber-400 flex items-center justify-center text-neutral-900 font-bold text-xs">
                ★
              </div>
            </div>

            <div className="space-y-2">
              <span className="rounded bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700 font-mono">
                CodeMaster 官方最高级认证
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1a1a]">
                全栈与 AI 时代开源架构师通关证书
              </h2>
              <p className="text-xs sm:text-sm text-[rgba(26,26,26,0.7)] max-w-xl mx-auto leading-relaxed">
                兹证明学员已完成 Python、Java、数据结构、SQL、FastAPI、Spring Boot、Spring AI 到多智能体的全链路学习，并成功通关 GitHub 陌生项目 5 步穿透法与 Vibe Coding 代码掌控力考核！
              </p>
            </div>

            {/* Radar / Skills Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2 text-left">
              <div className="rounded bg-[#f8f7f4] p-3.5 border border-[rgba(26,26,26,0.08)] space-y-1">
                <span className="text-[10px] text-neutral-500 font-mono">开源项目穿透力</span>
                <div className="text-sm font-bold text-emerald-700 font-mono">MASTER (S级)</div>
                <div className="h-1 w-full bg-emerald-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 w-full" />
                </div>
              </div>
              <div className="rounded bg-[#f8f7f4] p-3.5 border border-[rgba(26,26,26,0.08)] space-y-1">
                <span className="text-[10px] text-neutral-500 font-mono">Vibe Coding 掌控力</span>
                <div className="text-sm font-bold text-amber-700 font-mono">EXPERT (S级)</div>
                <div className="h-1 w-full bg-amber-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-600 w-full" />
                </div>
              </div>
              <div className="rounded bg-[#f8f7f4] p-3.5 border border-[rgba(26,26,26,0.08)] space-y-1">
                <span className="text-[10px] text-neutral-500 font-mono">链路时序反推力</span>
                <div className="text-sm font-bold text-blue-700 font-mono">100% 精确</div>
                <div className="h-1 w-full bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-full" />
                </div>
              </div>
              <div className="rounded bg-[#f8f7f4] p-3.5 border border-[rgba(26,26,26,0.08)] space-y-1">
                <span className="text-[10px] text-neutral-500 font-mono">防御性重构补丁</span>
                <div className="text-sm font-bold text-purple-700 font-mono">PASS (已验证)</div>
                <div className="h-1 w-full bg-purple-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 w-full" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => {
                  setShowCertificate(false);
                  setCurrentStageIdx(0);
                }}
                className="btn btn-ghost rounded px-5 py-2.5 text-xs font-semibold"
              >
                重温考核过程
              </button>

              <button
                onClick={onClose}
                className="btn btn-run rounded px-6 py-2.5 text-xs font-semibold shadow-sm"
              >
                收下证书并返回学院
              </button>
            </div>
          </div>
        ) : (
          /* Assessment Flow View */
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] pb-4">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider font-mono">
                  阶段 {currentStageIdx + 1} / {GRADUATION_PROJECT.stages.length}
                </span>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1a1a1a] mt-0.5">
                  {stage.stageName}
                </h2>
              </div>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {GRADUATION_PROJECT.stages.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === currentStageIdx
                        ? "w-6 bg-blue-600"
                        : i < currentStageIdx
                        ? "w-2 bg-emerald-500"
                        : "w-2 bg-neutral-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Question Card */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-[#1a1a1a]">{stage.title}</h3>
                <p className="text-xs sm:text-sm text-[rgba(26,26,26,0.7)] leading-relaxed">
                  {stage.description}
                </p>
              </div>

              {/* Context Code (if any) */}
              {stage.contextCode && (
                <div className="rounded bg-[#f8f7f4] p-4 border border-[rgba(26,26,26,0.08)] font-mono text-xs text-neutral-800 whitespace-pre-wrap leading-6">
                  {stage.contextCode}
                </div>
              )}

              {/* Multiple Choice Options */}
              {stage.options && (
                <div className="space-y-2.5 pt-2">
                  {stage.options.map((opt) => {
                    const isSelected = selectedAnswers[stage.id] === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`flex items-start gap-3 p-3.5 rounded border cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/50 text-[#1a1a1a] shadow-xs"
                            : "border-[rgba(26,26,26,0.08)] bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                        }`}
                      >
                        <div
                          className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-blue-600 bg-blue-600"
                              : "border-neutral-300"
                          }`}
                        >
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-xs sm:text-sm leading-relaxed">{opt.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Code Challenge Workspace (for Stage 4) */}
              {stage.codeChallenge && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="flex items-center gap-1.5 text-blue-700 font-mono">
                      <Terminal className="h-4 w-4" />
                      <span>请直接在下方编辑并补全埋点逻辑：</span>
                    </span>
                    <button
                      onClick={() => setCodeAnswer(stage.codeChallenge!.starter)}
                      className="hover:text-[#1a1a1a] flex items-center gap-1"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>重置代码</span>
                    </button>
                  </div>
                  <textarea
                    value={codeAnswer}
                    onChange={(e) => setCodeAnswer(e.target.value)}
                    rows={8}
                    className="w-full rounded bg-[#f8f7f4] border border-[rgba(26,26,26,0.12)] p-4 font-mono text-xs sm:text-sm text-[#1a1a1a] leading-6 focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}

              {/* Error feedback */}
              {stageError && (
                <div className="rounded border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 flex items-start gap-2 animate-fadeIn">
                  <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{stageError}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[rgba(26,26,26,0.08)] pt-4">
              <button
                onClick={() => {
                  if (currentStageIdx > 0) setCurrentStageIdx((prev) => prev - 1);
                }}
                disabled={currentStageIdx === 0}
                className="text-xs text-neutral-500 hover:text-[#1a1a1a] disabled:opacity-30 disabled:pointer-events-none"
              >
                返回上一步
              </button>

              <button
                onClick={handleProceed}
                className="btn btn-run rounded inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-xs"
              >
                <span>{isLastStage ? "提交终审 & 获取证书" : "验证并通过该阶段"}</span>
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
