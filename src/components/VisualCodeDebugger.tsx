import React, { useState, useEffect, useMemo } from "react";
import {
  Bug,
  Play,
  Pause,
  RotateCcw,
  Cpu,
  Layers,
  Terminal,
  Sparkles,
  Zap,
  Info,
  Tag,
  Compass,
  Flame,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Sliders,
  HelpCircle,
  X
} from "lucide-react";
import { TraceStep, calculateExecutionHeatmap, HeatmapStats } from "../utils/codeTraceEngine";

interface VisualCodeDebuggerProps {
  steps: TraceStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onReset: () => void;
  fullCode: string;
}

export const VisualCodeDebugger: React.FC<VisualCodeDebuggerProps> = ({
  steps,
  currentStepIndex,
  onStepChange,
  onReset,
  fullCode,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(1200);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true); // Heatmap mode toggle
  const [showBeginnerHelp, setShowBeginnerHelp] = useState<boolean>(false);
  const [activeSubView, setActiveSubView] = useState<"all" | "code" | "memory" | "console">("all");

  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex] || steps[0];

  // Calculate heatmap statistics across all trace steps
  const heatmap: HeatmapStats = useMemo(() => {
    return calculateExecutionHeatmap(steps);
  }, [steps]);

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        if (currentStepIndex < totalSteps - 1) {
          onStepChange(currentStepIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, speedMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentStepIndex, totalSteps, speedMs, onStepChange]);

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const handleTogglePlay = () => {
    if (currentStepIndex >= totalSteps - 1) {
      onStepChange(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Collect stdout accumulated up to the current step
  const accumulatedStdout = steps
    .slice(0, currentStepIndex + 1)
    .filter((s) => s.stdoutPiece !== undefined)
    .map((s) => s.stdoutPiece);

  const activeVariables = currentStep ? Object.values(currentStep.variables) : [];

  // Helper for heatmap visual calculation
  const getHeatmapColor = (count: number, max: number) => {
    if (!count) return { bg: "bg-transparent", text: "text-neutral-400", bar: "bg-neutral-300", level: "0x" };
    const ratio = count / max;

    if (ratio >= 0.85) {
      // Hot spot (Deep Flame Red/Orange)
      return {
        bg: "bg-rose-50 border-l-4 border-l-rose-600",
        badgeBg: "bg-rose-100 text-rose-800 border border-rose-200",
        bar: "bg-rose-600",
        level: "🔥 热点核心",
      };
    }
    if (ratio >= 0.5) {
      // Warm spot (Amber / Orange)
      return {
        bg: "bg-amber-50 border-l-4 border-l-amber-600",
        badgeBg: "bg-amber-100 text-amber-800 border border-amber-200",
        bar: "bg-amber-600",
        level: "⚡ 高频分支",
      };
    }
    // Normal single execution
    return {
      bg: "bg-emerald-50/70 border-l-2 border-l-emerald-600",
      badgeBg: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      bar: "bg-emerald-600",
      level: "常规执行",
    };
  };

  return (
    <div className="h-full flex flex-col font-sans select-none overflow-hidden bg-[#f8f7f4] text-[#1a1a1a] text-xs relative">
      {/* Beginner Guide Overlay Modal */}
      {showBeginnerHelp && (
        <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm p-4 overflow-y-auto flex flex-col justify-between">
          <div className="max-w-2xl mx-auto space-y-3 w-full">
            <div className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-blue-50 text-blue-600 border border-blue-200">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h4 className="font-semibold text-sm text-[#1a1a1a]">速懂指南：可视化物理调试器</h4>
              </div>
              <button
                onClick={() => setShowBeginnerHelp(false)}
                className="p-1 rounded text-neutral-400 hover:text-[#1a1a1a] hover:bg-neutral-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-blue-800">
                  <Compass className="h-4 w-4 text-blue-600" />
                  <span>1. 指令指针 (蓝色高亮)</span>
                </div>
                <p className="text-[rgba(26,26,26,0.7)] leading-relaxed text-[11px]">
                  计算机是一行一行顺序读代码的。高亮表示计算机“当前正在执行哪一行”。单步演播让你看清程序执行顺序。
                </p>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-rose-800">
                  <Flame className="h-4 w-4 text-rose-600" />
                  <span>2. 分支执行热力图</span>
                </div>
                <p className="text-[rgba(26,26,26,0.7)] leading-relaxed text-[11px]">
                  循环反复跑的代码会标为红色🔥热点；跳过的分支保持原样。一目了然看清代码真实调用频次与循环分支！
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  <span>3. RAM 变量收纳盒</span>
                </div>
                <p className="text-[rgba(26,26,26,0.7)] leading-relaxed text-[11px]">
                  每个变量名是一个贴标签的盒子。赋值语句把右边计算的结果放进盒子里，绿框表示刚刚写入了新值。
                </p>
              </div>

              <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-purple-800">
                  <Terminal className="h-4 w-4 text-purple-600" />
                  <span>4. 控制台即时输出 (stdout)</span>
                </div>
                <p className="text-[rgba(26,26,26,0.7)] leading-relaxed text-[11px]">
                  对应你的 `print(...)` 屏幕输出。执行到打印语句时，终端即时刷新，亲历数据走向。
                </p>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => setShowBeginnerHelp(false)}
                className="btn btn-run rounded px-4 py-1.5 text-xs font-semibold"
              >
                我明白了，开始单步探索！
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Control Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 sm:py-2 border-b border-[rgba(26,26,26,0.08)] bg-white shrink-0 gap-2 overflow-x-auto scrollbar-none">
        {/* Left Section: Badges & Heatmap Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-medium shrink-0">
            <Bug className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <span className="font-semibold whitespace-nowrap">可视化调试</span>
          </div>

          <span className="text-[11px] text-[rgba(26,26,26,0.5)] font-mono shrink-0 whitespace-nowrap">
            步: <strong className="text-[#1a1a1a]">{currentStepIndex + 1}</strong>/{totalSteps}
          </span>

          {/* Heatmap Mode Toggle Button */}
          <button
            id="toggle-branch-heatmap-btn"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-all border shrink-0 whitespace-nowrap ${
              showHeatmap
                ? "bg-rose-50 border-rose-300 text-rose-700 shadow-xs"
                : "bg-neutral-50 border-[rgba(26,26,26,0.12)] text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a]"
            }`}
            title="开启/关闭代码执行分支热力图"
          >
            <Flame className={`h-3 w-3 shrink-0 ${showHeatmap ? "text-rose-600 fill-rose-500/40" : "text-neutral-400"}`} />
            <span>热力图</span>
            {showHeatmap && (
              <span className="text-[9px] px-1 rounded bg-rose-200 text-rose-900 font-mono">
                ON
              </span>
            )}
          </button>

          {/* Beginner Helper Button */}
          <button
            onClick={() => setShowBeginnerHelp(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-all shrink-0 whitespace-nowrap"
            title="查看小白速懂指南：如何看懂单步调试"
          >
            <HelpCircle className="h-3 w-3 text-amber-600 shrink-0" />
            <span className="hidden sm:inline">新手速懂</span>
          </button>
        </div>

        {/* Center / Right Section: Sub-view Switcher & Playback Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Sub-view Switcher for narrow screens */}
          <div className="hidden lg:flex items-center bg-neutral-100 p-0.5 rounded border border-[rgba(26,26,26,0.08)] shrink-0 text-[10px]">
            <button
              onClick={() => setActiveSubView("all")}
              className={`px-1.5 py-0.5 rounded transition-all shrink-0 ${
                activeSubView === "all" ? "bg-white text-[#1a1a1a] font-medium shadow-xs" : "text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a]"
              }`}
            >
              三栏全景
            </button>
            <button
              onClick={() => setActiveSubView("code")}
              className={`px-1.5 py-0.5 rounded transition-all shrink-0 ${
                activeSubView === "code" ? "bg-white text-[#1a1a1a] font-medium shadow-xs" : "text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a]"
              }`}
            >
              代码与热力
            </button>
            <button
              onClick={() => setActiveSubView("memory")}
              className={`px-1.5 py-0.5 rounded transition-all shrink-0 ${
                activeSubView === "memory" ? "bg-white text-[#1a1a1a] font-medium shadow-xs" : "text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a]"
              }`}
            >
              RAM变量盒
            </button>
            <button
              onClick={() => setActiveSubView("console")}
              className={`px-1.5 py-0.5 rounded transition-all shrink-0 ${
                activeSubView === "console" ? "bg-white text-[#1a1a1a] font-medium shadow-xs" : "text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a]"
              }`}
            >
              终端输出
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onReset()}
              className="p-1.5 rounded hover:bg-neutral-100 text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a] transition-colors shrink-0"
              title="重置到第一步"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="px-2 py-1 rounded bg-white border border-[rgba(26,26,26,0.12)] hover:bg-neutral-50 disabled:opacity-30 text-[#1a1a1a] transition-colors font-mono shrink-0 whitespace-nowrap shadow-xs"
              title="上一步"
            >
              ◀ <span className="hidden sm:inline">上一步</span>
            </button>

            <button
              onClick={handleTogglePlay}
              className={`px-2.5 sm:px-3 py-1 rounded font-semibold text-white flex items-center gap-1 transition-all shrink-0 whitespace-nowrap ${
                isPlaying
                  ? "bg-amber-600 hover:bg-amber-500 shadow-xs"
                  : "btn btn-run"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3 shrink-0" />
                  <span>暂停</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 fill-current shrink-0" />
                  <span>{currentStepIndex >= totalSteps - 1 ? "重播" : "演播"}</span>
                </>
              )}
            </button>

            <button
              onClick={handleNextStep}
              disabled={currentStepIndex >= totalSteps - 1}
              className="px-2 py-1 rounded bg-white border border-[rgba(26,26,26,0.12)] hover:bg-neutral-50 disabled:opacity-30 text-[#1a1a1a] transition-colors font-mono shrink-0 whitespace-nowrap shadow-xs"
              title="下一步"
            >
              <span className="hidden sm:inline">下一步</span> ▶
            </button>

            {/* Speed selector */}
            <select
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="bg-white border border-[rgba(26,26,26,0.12)] text-[10px] text-[#1a1a1a] rounded px-1.5 py-1 focus:outline-none shrink-0"
              title="演播步频"
            >
              <option value={1800}>0.5x</option>
              <option value={1200}>1.0x</option>
              <option value={600}>2.0x</option>
            </select>
          </div>
        </div>
      </div>

      {/* Heatmap Overview Banner (Visible when Heatmap is toggled ON) */}
      {showHeatmap && (
        <div className="px-3 py-1.5 bg-[#f8f7f4] border-b border-[rgba(26,26,26,0.08)] flex flex-wrap items-center justify-between text-[11px] text-[#1a1a1a] gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-semibold text-rose-700">
              <Flame className="h-3.5 w-3.5 text-rose-600" />
              <span>逻辑热力图：</span>
            </span>
            <span className="text-[rgba(26,26,26,0.6)]">
              共触发 <strong className="text-[#1a1a1a]">{heatmap.totalExecutions}</strong> 次指令计算，
              最高单行循环频次: <strong className="text-rose-700 font-mono">{heatmap.maxExecutions} 次</strong>
            </span>
            {heatmap.hotspotLines.length > 0 && heatmap.maxExecutions > 1 && (
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 text-[10px]">
                <span>🔥 核心热点位于第 {heatmap.hotspotLines.join(", ")} 行</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span className="text-[rgba(26,26,26,0.7)]">高频热点分支</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span className="text-[rgba(26,26,26,0.7)]">中频迭代</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="text-[rgba(26,26,26,0.7)]">单次主干</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Debugger Layout: 3 Columns */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-2 p-2 sm:p-2.5 overflow-hidden">
        {/* Left Col: Code Execution Flow with Pointer + Heatmap Highlight */}
        {(activeSubView === "all" || activeSubView === "code") && (
          <div className={`${activeSubView === "code" ? "col-span-1 xl:col-span-12" : "col-span-1 xl:col-span-5"} flex flex-col rounded border border-[rgba(26,26,26,0.08)] bg-white overflow-hidden min-h-[160px] shadow-xs`}>
            <div className="px-2.5 py-1.5 border-b border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] flex items-center justify-between shrink-0">
              <span className="text-[10px] font-semibold text-[rgba(26,26,26,0.6)] uppercase tracking-wider flex items-center gap-1">
                <Compass className="h-3 w-3 text-blue-600 shrink-0" />
                <span>指令指针 (Program Counter) & 热力图分布</span>
              </span>
              <span className="text-[10px] font-mono text-blue-600 shrink-0">
                第 {currentStep?.lineNumber || 1} 行
              </span>
            </div>

            <div className="flex-1 p-2 font-mono text-xs overflow-y-auto space-y-1">
              {fullCode.split("\n").map((line, idx) => {
                const lineNo = idx + 1;
                const isCurrentLine = currentStep?.lineNumber === lineNo;
                const isExecuted = currentStep && lineNo < currentStep.lineNumber;

                // Heatmap statistics for this line
                const execCount = heatmap.lineExecutionCounts[lineNo] || 0;
                const heatmapInfo = showHeatmap ? getHeatmapColor(execCount, heatmap.maxExecutions) : null;
                const isHotspot = showHeatmap && execCount >= 2 && execCount === heatmap.maxExecutions;

                return (
                  <div
                    key={idx}
                    className={`group flex items-center gap-1.5 px-2 py-1 rounded transition-all relative ${
                      isCurrentLine
                        ? "bg-blue-50 border border-blue-300 text-blue-900 font-semibold shadow-xs"
                        : heatmapInfo && showHeatmap && execCount > 0
                        ? `${heatmapInfo.bg} text-[#1a1a1a]`
                        : isExecuted
                        ? "text-[rgba(26,26,26,0.4)] bg-neutral-50/50"
                        : "text-[rgba(26,26,26,0.7)]"
                    }`}
                  >
                    {/* Line Number */}
                    <span className="w-5 text-right text-[10px] text-neutral-400 font-mono select-none shrink-0">
                      {lineNo}
                    </span>

                    {/* Heatmap Bar / Count indicator if Heatmap toggled */}
                    {showHeatmap && execCount > 0 && (
                      <div
                        className="flex items-center gap-1 shrink-0"
                        title={`该代码行在本次程序流中共被执行了 ${execCount} 次`}
                      >
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold flex items-center gap-0.5 ${
                            heatmapInfo?.badgeBg || "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {isHotspot && <Flame className="h-2.5 w-2.5 fill-rose-600 text-rose-600 shrink-0" />}
                          <span>{execCount}x</span>
                        </span>

                        {/* Micro bar representing proportion of total iterations */}
                        <div className="w-5 h-1.5 bg-neutral-200 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full ${heatmapInfo?.bar || "bg-neutral-400"}`}
                            style={{
                              width: `${Math.max(15, (execCount / heatmap.maxExecutions) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Code line content */}
                    <span className="flex-1 font-mono text-xs whitespace-pre">
                      {line || " "}
                    </span>

                    {/* Status badge: current line vs hotspot */}
                    {isCurrentLine ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-sans font-bold flex items-center gap-1 animate-pulse shrink-0">
                        <Zap className="h-2.5 w-2.5 shrink-0" />
                        当前执行
                      </span>
                    ) : isHotspot ? (
                      <span className="text-[8px] px-1 rounded bg-rose-100 text-rose-800 border border-rose-300 font-sans font-medium flex items-center gap-0.5 shrink-0">
                        <Flame className="h-2 w-2 text-rose-600 shrink-0" />
                        核心热点
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Current Line Explanation pill */}
            <div className="p-2 border-t border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] text-[11px] text-[#1a1a1a] shrink-0">
              <div className="text-[10px] font-semibold text-blue-700 mb-0.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Info className="h-3 w-3 shrink-0" />
                  <span>这行代码在计算机中触发了：</span>
                </span>
                {currentStep?.branchTag && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-white border border-[rgba(26,26,26,0.08)] text-blue-700">
                    分支标签: {currentStep.branchTag}
                  </span>
                )}
              </div>
              <p className="text-[rgba(26,26,26,0.8)] leading-relaxed font-sans">
                {currentStep?.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Middle Col: Live Variable Memory (RAM Shelves) */}
        {(activeSubView === "all" || activeSubView === "memory") && (
          <div className={`${activeSubView === "memory" ? "col-span-1 xl:col-span-12" : "col-span-1 xl:col-span-4"} flex flex-col rounded border border-[rgba(26,26,26,0.08)] bg-white overflow-hidden min-h-[140px] shadow-xs`}>
            <div className="px-2.5 py-1.5 border-b border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] flex items-center justify-between shrink-0">
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <Layers className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>内存收纳盒 (RAM 实时变量池)</span>
              </span>
              <span className="text-[10px] font-mono text-[rgba(26,26,26,0.5)] shrink-0">
                {activeVariables.length} 个活跃槽位
              </span>
            </div>

            <div className="flex-1 p-2 overflow-y-auto space-y-2">
              {activeVariables.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-400 text-center p-4">
                  <Layers className="h-6 w-6 mb-1 text-neutral-300 shrink-0" />
                  <span>当前步骤尚未分配变量</span>
                  <span className="text-[10px] text-neutral-400 mt-0.5">当执行到赋值语句(=)时会在此开辟空间</span>
                </div>
              ) : (
                activeVariables.map((v) => (
                  <div
                    key={v.name}
                    className={`rounded p-2 border transition-all ${
                      v.changed
                        ? "border-emerald-300 bg-emerald-50/60 shadow-xs"
                        : "border-[rgba(26,26,26,0.08)] bg-[#f8f7f4]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 font-mono font-bold text-xs text-[#1a1a1a]">
                        <Tag className="h-3 w-3 text-blue-600 shrink-0" />
                        <span>{v.name}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white border border-[rgba(26,26,26,0.08)] text-[rgba(26,26,26,0.6)] font-mono">
                        {v.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white px-2 py-1.5 rounded border border-[rgba(26,26,26,0.08)] font-mono text-xs">
                      <span className="text-neutral-500">存储值:</span>
                      <span className={`font-bold ${v.type === "string" ? "text-amber-700" : "text-emerald-700"}`}>
                        {v.type === "string" ? `"${v.value}"` : v.value}
                      </span>
                    </div>

                    {v.changed && (
                      <div className="mt-1 text-[9px] text-emerald-700 flex items-center gap-1 justify-end font-sans font-medium">
                        <Sparkles className="h-2.5 w-2.5 shrink-0" />
                        <span>本次执行中被写入新值</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Logic breakdown info footer in RAM column */}
            <div className="p-2 border-t border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] text-[10px] text-[rgba(26,26,26,0.6)] flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-blue-600 shrink-0" />
                <span>已评估分支/循环:</span>
              </span>
              <span className="font-mono text-[#1a1a1a]">
                {heatmap.branchStats.branchesEvaluated + heatmap.branchStats.loopsExecuted} 次
              </span>
            </div>
          </div>
        )}

        {/* Right Col: CPU Status & Accumulated I/O Console */}
        {(activeSubView === "all" || activeSubView === "console") && (
          <div className={`${activeSubView === "console" ? "col-span-1 xl:col-span-12" : "col-span-1 xl:col-span-3"} flex flex-col rounded border border-[rgba(26,26,26,0.08)] bg-white overflow-hidden min-h-[140px] shadow-xs`}>
            <div className="px-2.5 py-1.5 border-b border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] flex items-center justify-between shrink-0">
              <span className="text-[10px] font-semibold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                <Terminal className="h-3 w-3 text-purple-600 shrink-0" />
                <span>控制台即时输出 (stdout)</span>
              </span>
              <span className="text-[10px] font-mono text-[rgba(26,26,26,0.5)] shrink-0">
                {accumulatedStdout.length} 行
              </span>
            </div>

            <div className="flex-1 p-2 font-mono text-xs overflow-y-auto bg-[#f8f7f4] space-y-1">
              {accumulatedStdout.length === 0 ? (
                <span className="text-neutral-400 italic">尚未产生控制台屏幕输出...</span>
              ) : (
                accumulatedStdout.map((out, i) => (
                  <div key={i} className="text-emerald-800 font-semibold leading-relaxed break-all">
                    &gt; {out}
                  </div>
                ))
              )}
            </div>

            {/* Quick CPU Action Footnote */}
            <div className="p-2 border-t border-[rgba(26,26,26,0.08)] bg-white text-[10px] text-[rgba(26,26,26,0.6)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1">
                <Cpu className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>算术逻辑单元 (ALU) 就绪</span>
              </div>
              <span className="text-neutral-400 font-mono">寄存器干净</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
