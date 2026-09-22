import React, { useState, useEffect } from "react";
import { 
  Play, 
  CheckCircle, 
  RotateCcw, 
  HelpCircle, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Lightbulb, 
  GitBranch, 
  Terminal as TerminalIcon, 
  Copy, 
  Check, 
  AlertCircle,
  Eye,
  Activity,
  Bot,
  Award,
  Bug,
  Flame
} from "lucide-react";
import { Lesson, TrackInfo } from "../types";
import { generateIntelligentExplanation } from "../utils/aiFallbackEngine";
import { InteractiveComputerAnatomy } from "./InteractiveComputerAnatomy";
import { InteractiveVariablePlayground } from "./InteractiveVariablePlayground";
import { InteractiveCodeExecutionLab } from "./InteractiveCodeExecutionLab";
import { InteractiveComputerAndCompilerLab } from "./InteractiveComputerAndCompilerLab";
import { VisualCodeDebugger } from "./VisualCodeDebugger";
import { generateCodeExecutionTrace, TraceStep } from "../utils/codeTraceEngine";

interface CodecademyWorkspaceProps {
  lesson: Lesson;
  track: TrackInfo;
  onPrevLesson?: () => void;
  onNextLesson?: () => void;
  hasPrevLesson: boolean;
  hasNextLesson: boolean;
  onLessonComplete: (lessonId: string) => void;
  isCompleted: boolean;
  onAskAIAboutCode: (code: string, language: string, question?: string) => void;
  onOpenEnterpriseProject?: () => void;
}

export const CodecademyWorkspace: React.FC<CodecademyWorkspaceProps> = ({
  lesson,
  track,
  onPrevLesson,
  onNextLesson,
  hasPrevLesson,
  hasNextLesson,
  onLessonComplete,
  isCompleted,
  onAskAIAboutCode,
  onOpenEnterpriseProject,
}) => {
  const [code, setCode] = useState<string>(lesson.starterCode);
  const [output, setOutput] = useState<string>("");
  const [activeRightTab, setActiveRightTab] = useState<"terminal" | "debugger" | "trace" | "ai-explain">("debugger");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [checkpointStatus, setCheckpointStatus] = useState<Record<string, { passed: boolean; message: string }>>({});
  const [showHint, setShowHint] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [isExplaining, setIsExplaining] = useState<boolean>(false);

  const [hasEverRun, setHasEverRun] = useState<boolean>(false);
  const [lastRunStatus, setLastRunStatus] = useState<"idle" | "success" | "error" | "empty">("idle");
  const [lastErrorMsg, setLastErrorMsg] = useState<string>("");

  // Visual Debugger state
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>(() => generateCodeExecutionTrace(lesson.starterCode, lesson.language));
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const currentLessonIndex = track.lessons.findIndex((l) => l.id === lesson.id);

  // Sync state when lesson changes
  useEffect(() => {
    setCode(lesson.starterCode);
    setOutput("");
    setCheckpointStatus({});
    setShowHint(false);
    setShowSolution(false);
    setAiExplanation("");
    setHasEverRun(false);
    setLastRunStatus("idle");
    setLastErrorMsg("");
    const steps = generateCodeExecutionTrace(lesson.starterCode, lesson.language);
    setTraceSteps(steps);
    setCurrentStepIndex(0);
    setActiveRightTab("debugger");
  }, [lesson.id]);

  // Recalculate trace steps whenever code is updated
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    const steps = generateCodeExecutionTrace(newCode, lesson.language);
    setTraceSteps(steps);
    if (currentStepIndex >= steps.length) {
      setCurrentStepIndex(Math.max(0, steps.length - 1));
    }
  };

  // Run code safely via real sandbox runtime
  const handleRunCode = async () => {
    setIsRunning(true);
    setHasEverRun(true);
    // Automatically switch to terminal so user can immediately observe the real execution output
    setActiveRightTab("terminal");
    try {
      // Re-generate trace steps on run
      const steps = generateCodeExecutionTrace(code, lesson.language);
      setTraceSteps(steps);
      setCurrentStepIndex(steps.length > 0 ? steps.length - 1 : 0);

      const response = await fetch("/api/run-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: lesson.language,
        }),
      });
      const data = await response.json();
      const outputText = data.output || "";
      setOutput(outputText);
      setExecutionTime(data.executionTimeMs ?? 15);

      const isErr = data.status === "error" || outputText.includes("SyntaxError") || outputText.includes("NameError") || outputText.includes("IndentationError") || outputText.includes("TypeError") || outputText.includes("Error:");
      const isEmpty = data.status === "empty" || !code.trim();

      if (isEmpty) {
        setLastRunStatus("empty");
        setLastErrorMsg("编辑器代码为空，未执行");
      } else if (isErr) {
        setLastRunStatus("error");
        setLastErrorMsg(outputText);
      } else {
        setLastRunStatus("success");
        setLastErrorMsg("");
      }

      // Auto evaluate checkpoints ONLY with the real output from sandbox
      evaluateCheckpoints(code, outputText, isErr, isEmpty);
    } catch (err: any) {
      const errTxt = `Error: ${err.message}`;
      setOutput(errTxt);
      setLastRunStatus("error");
      setLastErrorMsg(errTxt);
      evaluateCheckpoints(code, errTxt, true, false);
    } finally {
      setIsRunning(false);
    }
  };

  // Evaluate each checkpoint with strict gatekeeping:
  // Must have run, must not be empty, and must not have fatal runtime/syntax errors
  const evaluateCheckpoints = (currentCode: string, currentOutput: string, isErr?: boolean, isEmpty?: boolean) => {
    const cleanCode = currentCode.trim();

    // Condition 1: If user hasn't run the code yet or code is empty, fail checkpoint
    if (!hasEverRun && !currentOutput) {
      const results: Record<string, { passed: boolean; message: string }> = {};
      lesson.checkpoints.forEach((chk) => {
        results[chk.id] = {
          passed: false,
          message: "⚠️ 请先在编辑器写下代码，并点击右侧【运行代码】在真实环境中执行验证！"
        };
      });
      setCheckpointStatus(results);
      return;
    }

    if (!cleanCode || isEmpty) {
      const results: Record<string, { passed: boolean; message: string }> = {};
      lesson.checkpoints.forEach((chk) => {
        results[chk.id] = {
          passed: false,
          message: "❌ 编辑器没有有效代码。请按要求敲入代码后再运行！"
        };
      });
      setCheckpointStatus(results);
      return;
    }

    // Condition 2: If code crashed with Python SyntaxError / NameError / etc., reject pass
    const hasFatalError = isErr || currentOutput.includes("SyntaxError") || currentOutput.includes("NameError") || currentOutput.includes("IndentationError") || currentOutput.includes("TypeError") || currentOutput.includes("Error:");

    if (hasFatalError) {
      const results: Record<string, { passed: boolean; message: string }> = {};
      lesson.checkpoints.forEach((chk) => {
        results[chk.id] = {
          passed: false,
          message: "❌ 代码运行报错！终端中输出了语法或执行期错误，请根据终端红字提示修改代码后再试。"
        };
      });
      setCheckpointStatus(results);
      return;
    }

    const results: Record<string, { passed: boolean; message: string }> = {};
    let allPassed = true;

    lesson.checkpoints.forEach((chk) => {
      const res = chk.testFunction(currentCode, currentOutput);
      results[chk.id] = res;
      if (!res.passed) {
        allPassed = false;
      }
    });

    setCheckpointStatus(results);

    if (allPassed && lesson.checkpoints.length > 0) {
      onLessonComplete(lesson.id);
    }
  };

  // Ask AI for line-by-line explanation
  const handleRequestAIExplain = async () => {
    setIsExplaining(true);
    setActiveRightTab("ai-explain");
    try {
      const res = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: lesson.language,
          question: `请用最通俗直观的话拆解这段关于【${lesson.title}】的代码。`,
        }),
      });
      const data = await res.json();
      if (data && data.explanation) {
        setAiExplanation(data.explanation);
      } else {
        const local = generateIntelligentExplanation(code, lesson.language, undefined, `请拆解【${lesson.title}】代码`);
        setAiExplanation(local.explanation);
      }
    } catch (e: any) {
      const local = generateIntelligentExplanation(code, lesson.language, undefined, `请拆解【${lesson.title}】代码`);
      setAiExplanation(local.explanation);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    if (confirm("确定要重置代码回初始状态吗？")) {
      setCode(lesson.starterCode);
      setCheckpointStatus({});
      setOutput("");
      const steps = generateCodeExecutionTrace(lesson.starterCode, lesson.language);
      setTraceSteps(steps);
      setCurrentStepIndex(0);
    }
  };

  const allPassed =
    lesson.checkpoints.length > 0 &&
    lesson.checkpoints.every((chk) => checkpointStatus[chk.id]?.passed);

  const filename = 
    lesson.language === "bash" || lesson.language === "shell" 
      ? "terminal.sh" 
      : lesson.language === "typescript"
      ? "main.ts"
      : `main.${lesson.language === "python" ? "py" : lesson.language === "java" ? "java" : "sql"}`;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr_400px] xl:grid-cols-[300px_1fr_430px] 2xl:grid-cols-[320px_1fr_480px] min-h-[calc(100vh-60px)] lg:h-[calc(100vh-60px)] w-full overflow-y-auto lg:overflow-hidden bg-[#f8f7f4] text-[#1a1a1a]">
      {/* 1. LEFT COLUMN: Aside / Curriculum Navigation & Heart of Coding */}
      <aside className="w-full border-b lg:border-b-0 lg:border-r border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] flex flex-col max-h-[340px] lg:max-h-none lg:h-full overflow-y-auto shrink-0">
        {/* Navigation Breadcrumb & Switcher */}
        <div className="p-4 border-b border-[rgba(26,26,26,0.08)] flex items-center justify-between bg-white/50 backdrop-blur-xs sticky top-0 z-10">
          <div className="space-y-0.5 min-w-0 pr-2">
            <span className="meta-tag block truncate">
              {track.title}
            </span>
            <span className="font-semibold text-xs text-[#1a1a1a] block truncate">
              {lesson.title}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onPrevLesson}
              disabled={!hasPrevLesson}
              className="p-1.5 rounded hover:bg-neutral-200/60 disabled:opacity-30 disabled:pointer-events-none text-[#1a1a1a] transition-colors"
              title="上一关"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={onNextLesson}
              disabled={!hasNextLesson}
              className="p-1.5 rounded hover:bg-neutral-200/60 disabled:opacity-30 disabled:pointer-events-none text-[#1a1a1a] transition-colors"
              title="下一关"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4 flex-1">
          {/* Variation 3: Heart of Coding Concept Pill */}
          <div className="concept-pill shadow-xs" style={{ borderLeft: "3px solid #f59e0b" }}>
            <div className="meta-tag mb-1 font-semibold" style={{ color: "#d97706" }}>
              Heart of Coding
            </div>
            <p className="text-xs leading-relaxed text-[#1a1a1a]">
              "从上到下，一行一行，绝不跳步。" 电脑就是这样老实地执行你的每一个字。
            </p>
          </div>

          {/* Quick Lesson Index */}
          <div className="space-y-1.5">
            <div className="meta-tag px-1 mb-2">Track Modules</div>
            <nav className="space-y-1">
              {track.lessons.map((l, idx) => {
                const isCurrent = l.id === lesson.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      if (onNextLesson && onPrevLesson) {
                        const targetIdx = track.lessons.findIndex((x) => x.id === l.id);
                        if (targetIdx !== -1) {
                          // Allow quick jumping
                          const diff = targetIdx - currentLessonIndex;
                          if (diff > 0) {
                            for (let i = 0; i < diff; i++) onNextLesson();
                          } else if (diff < 0) {
                            for (let i = 0; i < Math.abs(diff); i++) onPrevLesson();
                          }
                        }
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center justify-between gap-2 ${
                      isCurrent
                        ? "bg-blue-50 text-[#2563eb] font-semibold border border-blue-200"
                        : "text-[rgba(26,26,26,0.6)] hover:bg-neutral-200/50 hover:text-[#1a1a1a]"
                    }`}
                  >
                    <span className="truncate">
                      {String(idx + 1).padStart(2, "0")}. {l.title}
                    </span>
                    {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Zero-Base Mental Model Box */}
          <div className="concept-pill shadow-xs">
            <div className="meta-tag mb-1 font-semibold text-neutral-500">
              Mental Model · {lesson.mentalModel.title}
            </div>
            <p className="text-xs text-[rgba(26,26,26,0.7)] leading-relaxed">
              {lesson.mentalModel.metaphor}
            </p>
            <div className="mt-2 text-[11px] font-mono text-blue-700 bg-blue-50/80 p-2 rounded border border-blue-100">
              💡 {lesson.mentalModel.keyIntuition}
            </div>
          </div>
        </div>

        {/* Enterprise project link if present */}
        {track.enterpriseProject && onOpenEnterpriseProject && (
          <div className="p-4 border-t border-[rgba(26,26,26,0.08)] bg-white/40">
            <button
              onClick={onOpenEnterpriseProject}
              className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-neutral-200/60 text-xs text-blue-700 font-medium transition-colors"
            >
              <Award className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="truncate">终极验收：{track.enterpriseProject.projectName}</span>
            </button>
          </div>
        )}
      </aside>

      {/* 2. CENTER COLUMN: Main Workspace (Editor + Terminal) */}
      <main className="flex-1 flex flex-col min-h-[580px] lg:min-h-0 lg:h-full overflow-hidden bg-white">
        {/* Editor Area */}
        <div className="editor-area flex-1 flex flex-col relative p-4 sm:p-6 overflow-hidden">
          {/* Top Bar with filename-tag and actions */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="filename-tag">{filename}</div>
              <span className="meta-tag uppercase font-mono">{lesson.language}</span>

              {lastRunStatus === "error" && (
                <span className="text-[0.65rem] font-mono text-[#be123c] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-medium">
                  Syntax / Runtime Error
                </span>
              )}
              {lastRunStatus === "success" && (
                <span className="text-[0.65rem] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                  Executed OK (0)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="text-xs text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a] px-2 py-1 rounded hover:bg-neutral-100 flex items-center gap-1 transition-colors"
                title="查看官方参考答案"
              >
                <Eye className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="hidden sm:inline">{showSolution ? "隐藏答案" : "参考答案"}</span>
              </button>

              <button
                onClick={handleCopyCode}
                className="text-xs text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a] px-2 py-1 rounded hover:bg-neutral-100 flex items-center gap-1 transition-colors"
                title="复制代码"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <Copy className="h-3.5 w-3.5 text-neutral-500 shrink-0" />}
                <span className="hidden sm:inline">{copied ? "已复制" : "复制"}</span>
              </button>

              <button
                onClick={handleResetCode}
                className="text-xs text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a] px-2 py-1 rounded hover:bg-neutral-100 flex items-center gap-1 transition-colors"
                title="重置初始代码"
              >
                <RotateCcw className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                <span className="hidden sm:inline">重置</span>
              </button>
            </div>
          </div>

          {/* Standard Solution Overlay */}
          {showSolution && (
            <div className="absolute inset-x-4 top-14 z-20 bg-white text-[#1a1a1a] p-4 rounded-lg shadow-lg border border-[rgba(26,26,26,0.12)] max-h-[50%] overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#1a1a1a] flex items-center gap-1.5 font-mono">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  官方参考答案
                </span>
                <button
                  onClick={() => setShowSolution(false)}
                  className="text-xs text-[rgba(26,26,26,0.5)] hover:text-[#1a1a1a] px-2 py-0.5 rounded hover:bg-neutral-100"
                >
                  关闭
                </button>
              </div>
              <pre className="text-xs text-[#1a1a1a] font-mono whitespace-pre-wrap bg-[#f8f7f4] border border-[rgba(26,26,26,0.08)] p-3 rounded">
                {lesson.solutionCode}
              </pre>
            </div>
          )}

          {/* Textarea Editor */}
          <div className="flex-1 flex relative overflow-hidden">
            {/* Line numbers column */}
            <div className="w-8 py-1 text-right pr-2 text-neutral-400 select-none font-['Geist_Mono',monospace] text-xs leading-[1.7] hidden sm:block border-r border-[rgba(26,26,26,0.06)] mr-3">
              {code.split("\n").map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            <textarea
              id="code-editor-textarea"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  handleRunCode();
                }
              }}
              spellCheck={false}
              className="flex-1 border-none outline-none font-['Geist_Mono',monospace] text-[0.95rem] leading-[1.7] text-[#334155] bg-transparent resize-none selection:bg-blue-100 selection:text-blue-900"
              placeholder="# 请在此输入你的代码..."
            />
          </div>

          {/* Floating Action Buttons as shown in Variation 3 */}
          <div className="pt-2 flex items-center justify-end gap-2 shrink-0">
            <button
              id="debug-code-button"
              onClick={() => {
                const steps = generateCodeExecutionTrace(code, lesson.language);
                setTraceSteps(steps);
                setCurrentStepIndex(0);
                setActiveRightTab("debugger");
              }}
              className="btn btn-ghost rounded px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Bug className="h-3.5 w-3.5 text-neutral-700" />
              <span>Debug</span>
            </button>

            <button
              id="run-code-button"
              onClick={handleRunCode}
              disabled={isRunning}
              className="btn btn-run rounded px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className={`h-3.5 w-3.5 fill-current ${isRunning ? "animate-spin" : ""}`} />
              <span>{isRunning ? "Running..." : "Run Code"}</span>
            </button>
          </div>
        </div>

        {/* Bottom Terminal Area as styled in Variation 3 */}
        <div className="terminal h-[280px] shrink-0 flex flex-col">
          {/* Terminal Tabs */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveRightTab("terminal")}
                className={`meta-tag text-xs transition-colors ${
                  activeRightTab === "terminal" ? "text-[#2563eb] font-semibold border-b border-[#2563eb]" : "text-[rgba(26,26,26,0.5)] hover:text-[#1a1a1a]"
                }`}
              >
                Output Log
              </button>

              <button
                onClick={() => setActiveRightTab("debugger")}
                className={`meta-tag text-xs transition-colors flex items-center gap-1 ${
                  activeRightTab === "debugger" ? "text-[#2563eb] font-semibold border-b border-[#2563eb]" : "text-[rgba(26,26,26,0.5)] hover:text-[#1a1a1a]"
                }`}
              >
                <Bug className="h-3 w-3" />
                <span>Visual Debugger ({traceSteps.length})</span>
              </button>

              <button
                onClick={() => setActiveRightTab("trace")}
                className={`meta-tag text-xs transition-colors ${
                  activeRightTab === "trace" ? "text-[#2563eb] font-semibold border-b border-[#2563eb]" : "text-[rgba(26,26,26,0.5)] hover:text-[#1a1a1a]"
                }`}
              >
                Trace Flow
              </button>

              <button
                onClick={() => {
                  setActiveRightTab("ai-explain");
                  if (!aiExplanation && !isExplaining) handleRequestAIExplain();
                }}
                className={`meta-tag text-xs transition-colors ${
                  activeRightTab === "ai-explain" ? "text-[#2563eb] font-semibold border-b border-[#2563eb]" : "text-[rgba(26,26,26,0.5)] hover:text-[#1a1a1a]"
                }`}
              >
                AI Tutor Analysis
              </button>
            </div>

            <div className="meta-tag hidden sm:block">
              {executionTime !== null ? `${executionTime}ms` : "Ready"}
            </div>
          </div>

          {/* Terminal Content Body */}
          <div className="flex-1 overflow-y-auto font-['Geist_Mono',monospace] text-xs">
            {activeRightTab === "terminal" && (
              <div className="h-full flex flex-col justify-between">
                <div>
                  {lastRunStatus === "error" ? (
                    <div className="text-[#be123c] leading-relaxed whitespace-pre-wrap">
                      {output || (
                        <div>
                          File "{filename}", line 1<br />
                          &nbsp;&nbsp;{code.split("\n")[0]}<br />
                          &nbsp;&nbsp;^<br />
                          SyntaxError: invalid syntax
                        </div>
                      )}
                    </div>
                  ) : lastRunStatus === "empty" ? (
                    <div className="text-amber-700">
                      Empty Code: 请先在编辑器中输入代码后再点击运行。
                    </div>
                  ) : output ? (
                    <div className="text-neutral-800 leading-relaxed whitespace-pre-wrap">
                      {output}
                    </div>
                  ) : (
                    <div className="text-neutral-400 italic">
                      ➜ Ready for execution. Click 'Run Code' or press Ctrl/Cmd + Enter to test output.
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[rgba(26,26,26,0.08)] flex items-center justify-between text-[0.65rem] text-neutral-500 font-mono">
                  <span>
                    {lastRunStatus === "error" ? (
                      <span className="text-[#be123c]">➜ Exit Code 1 (Error)</span>
                    ) : lastRunStatus === "success" ? (
                      <span className="text-emerald-700">➜ Exit Code 0 (Success)</span>
                    ) : (
                      <span>➜ Sandbox environment ready</span>
                    )}
                  </span>
                  <button
                    onClick={() => {
                      setOutput("");
                      setLastRunStatus("idle");
                    }}
                    className="hover:text-neutral-900 underline"
                  >
                    Clear Output
                  </button>
                </div>
              </div>
            )}

            {activeRightTab === "debugger" && (
              <div className="h-full">
                <VisualCodeDebugger
                  steps={traceSteps}
                  currentStepIndex={currentStepIndex}
                  onStepChange={setCurrentStepIndex}
                  onReset={() => setCurrentStepIndex(0)}
                  fullCode={code}
                />
              </div>
            )}

            {activeRightTab === "trace" && (
              <div className="space-y-3 font-sans">
                <div className="meta-tag text-blue-700">Execution Flow & Registers</div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-2.5 rounded border border-[rgba(26,26,26,0.08)]">
                    <span className="meta-tag block">1. Fetch</span>
                    <p className="text-xs text-neutral-800 mt-1 font-mono">PC ➜ RAM Read</p>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-[rgba(26,26,26,0.08)]">
                    <span className="meta-tag block">2. Decode</span>
                    <p className="text-xs text-blue-700 mt-1 font-mono">ALU Opcode</p>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-[rgba(26,26,26,0.08)]">
                    <span className="meta-tag block">3. Execute</span>
                    <p className="text-xs text-emerald-700 mt-1 font-mono">Stdout / Memory</p>
                  </div>
                </div>
              </div>
            )}

            {activeRightTab === "ai-explain" && (
              <div className="h-full p-2 font-sans text-xs">
                {isExplaining ? (
                  <div className="flex items-center gap-2 text-blue-600 p-2">
                    <Bot className="h-4 w-4 animate-spin" />
                    <span>AI 伴读导师正在逐行解析你的代码...</span>
                  </div>
                ) : aiExplanation ? (
                  <div className="bg-white p-3 rounded border border-[rgba(26,26,26,0.08)] leading-relaxed whitespace-pre-wrap text-neutral-800">
                    {aiExplanation}
                  </div>
                ) : (
                  <div className="text-neutral-500">
                    点击下方【AI 逐行拆解代码】获取自然语言剖析。
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. RIGHT COLUMN: Instructions, Program Counter Flow & Tasks */}
      <section className="instructions w-full shrink-0 border-t lg:border-t-0 lg:border-l border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] flex flex-col min-h-[440px] lg:min-h-0 lg:h-full overflow-y-auto p-6 space-y-6">
        <div>
          <span className="meta-tag block">
            Lesson {lesson.id} / {track.title}
          </span>
          <h2 className="text-[1.25rem] font-semibold leading-tight text-[#1a1a1a] mt-1">
            {lesson.title}
          </h2>
        </div>

        {/* Program Counter Flow (Step Trace) from Variation 3 */}
        <div className="step-trace shadow-xs">
          <div className="meta-tag mb-2 font-semibold text-blue-700">
            Program Counter Flow
          </div>
          <div className="space-y-1">
            {traceSteps.slice(0, 5).map((s, idx) => {
              const isActive = currentStepIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`step-line cursor-pointer transition-all ${
                    isActive ? "active" : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <span className="text-neutral-400 font-mono text-[11px]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-xs truncate">
                    {s.rawCode || `line ${s.lineNumber}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Core Principles & Text Description */}
        <div className="text-[0.85rem] leading-[1.6] text-[rgba(26,26,26,0.75)] space-y-2">
          <p className="font-semibold text-[#1a1a1a]">取指令 ➔ 解密 ➔ 执行</p>
          <p>
            计算机在毫秒间不断重复这个循环。不管是十万行的工业系统，还是你写的两行代码，底层的执行逻辑完全一致。
          </p>
        </div>

        {/* Zero-base interactive tools for introductory lessons */}
        {lesson.id === "zero-001" && (
          <div className="space-y-3">
            <InteractiveComputerAndCompilerLab />
            <InteractiveComputerAnatomy currentLessonId={lesson.id} />
          </div>
        )}

        {lesson.id === "zero-002" && (
          <div className="space-y-3">
            <InteractiveComputerAndCompilerLab />
            <InteractiveCodeExecutionLab />
          </div>
        )}

        {(lesson.id === "zero-003" || lesson.id === "zero-004") && (
          <div>
            <InteractiveVariablePlayground />
          </div>
        )}

        {/* Lesson Markdown Details */}
        <div className="text-xs text-[rgba(26,26,26,0.8)] leading-relaxed whitespace-pre-wrap font-sans bg-white p-3.5 rounded border border-[rgba(26,26,26,0.08)]">
          {lesson.explanationMarkdown}
        </div>

        {/* Target Task Concept Pill as in Variation 3 */}
        <div
          className={`concept-pill shadow-xs ${
            lastRunStatus === "error"
              ? "bg-[#fdf2f2] border-[#fecaca]"
              : allPassed
              ? "bg-[#f0fdf4] border-[#bbf7d0]"
              : "bg-white"
          }`}
        >
          <div
            className={`meta-tag mb-1 font-semibold ${
              lastRunStatus === "error"
                ? "text-[#b91c1c]"
                : allPassed
                ? "text-emerald-700"
                : "text-neutral-600"
            }`}
          >
            Target Task
          </div>

          <p className="text-xs font-semibold text-[#1a1a1a] mt-1">
            {lesson.checkpoints[0]?.title || "输出两条连续指令"}
          </p>

          {lastRunStatus === "error" && (
            <p className="text-[0.75rem] text-[#b91c1c] mt-1">
              代码包含语法错误或异常，请检查拼写、全半角符号与缩进。
            </p>
          )}

          {/* Checkpoints list */}
          <div className="space-y-2 mt-3 pt-3 border-t border-[rgba(26,26,26,0.08)]">
            {lesson.checkpoints.map((chk, index) => {
              const status = checkpointStatus[chk.id];
              return (
                <div
                  key={chk.id}
                  className={`p-2.5 rounded text-xs transition-all border ${
                    status?.passed
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : status && !status.passed
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : "bg-neutral-50/80 border-[rgba(26,26,26,0.08)] text-neutral-800"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 shrink-0">
                      {status?.passed ? (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                      ) : status && !status.passed ? (
                        <AlertCircle className="h-3.5 w-3.5 text-[#be123c]" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-neutral-400 flex items-center justify-center text-[9px] font-mono text-neutral-600">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{chk.title}</div>
                      <div className="text-[11px] text-[rgba(26,26,26,0.6)] mt-0.5">
                        {chk.description}
                      </div>
                      {status && (
                        <div
                          className={`text-[10px] font-mono mt-1 ${
                            status.passed ? "text-emerald-700" : "text-[#be123c]"
                          }`}
                        >
                          {status.message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 space-y-2 sticky bottom-0 bg-[#f8f7f4] pb-2">
          {allPassed && hasNextLesson ? (
            <button
              onClick={onNextLesson}
              className="btn btn-run w-full py-2.5 rounded font-semibold text-xs text-white shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>通关！进入下一关</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (!hasEverRun) {
                  handleRunCode();
                } else {
                  evaluateCheckpoints(code, output, lastRunStatus === "error", lastRunStatus === "empty");
                }
              }}
              className="btn btn-run w-full py-2.5 rounded font-semibold text-xs text-white shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Check className="h-4 w-4" />
              <span>验证检查点</span>
            </button>
          )}

          <button
            onClick={handleRequestAIExplain}
            disabled={isExplaining}
            className="w-full py-1.5 text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center justify-center gap-1.5 hover:bg-blue-50/50 rounded transition-colors"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>{isExplaining ? "AI 正在拆解..." : "让 AI 白话逐行拆解代码"}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
