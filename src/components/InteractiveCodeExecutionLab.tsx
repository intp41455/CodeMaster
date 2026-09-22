import React, { useState } from "react";
import { 
  Play, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle, 
  Layers, 
  Cpu, 
  Terminal, 
  Sparkles,
  HelpCircle
} from "lucide-react";

interface ExecutionStep {
  stepNum: number;
  codeLine: string;
  explanation: string;
  memoryState: Record<string, string>;
  printedOutput?: string;
  highlightPart: "fetch" | "decode" | "execute" | "writeback";
}

export const InteractiveCodeExecutionLab: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [accumulatedOutput, setAccumulatedOutput] = useState<string[]>([]);

  const STEPS: ExecutionStep[] = [
    {
      stepNum: 1,
      codeLine: "score = 50",
      explanation: "第一行：CPU 抓取指令，指示内存分配一个叫 score 的盒子，并把数字 50 放入其中。",
      memoryState: { score: "50" },
      highlightPart: "execute"
    },
    {
      stepNum: 2,
      codeLine: "bonus = 20",
      explanation: "第二行：CPU 发现新的变量声明，在内存开辟 bonus 盒子，放入数字 20。",
      memoryState: { score: "50", bonus: "20" },
      highlightPart: "execute"
    },
    {
      stepNum: 3,
      codeLine: "total = score + bonus",
      explanation: "第三行：CPU 从内存取出 score (50) 和 bonus (20)，ALU 计算 50 + 20 = 70，把 70 放进新盒子 total！",
      memoryState: { score: "50", bonus: "20", total: "70" },
      highlightPart: "writeback"
    },
    {
      stepNum: 4,
      codeLine: 'print("最终通关总分：", total)',
      explanation: "第四行：调用 I/O 输出系统，从 total 盒子提取 70，转化为屏幕字符打印给用户！",
      memoryState: { score: "50", bonus: "20", total: "70" },
      printedOutput: "最终通关总分： 70",
      highlightPart: "fetch"
    }
  ];

  const currentStep = STEPS[currentStepIndex];

  const handleNextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const nextStepData = STEPS[nextIndex];
      if (nextStepData.printedOutput) {
        setAccumulatedOutput(prev => [...prev, nextStepData.printedOutput!]);
      }
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setAccumulatedOutput([]);
  };

  return (
    <div className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-white p-4 space-y-4 text-[#1a1a1a] font-['Geist',sans-serif] shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-50 border border-blue-200 text-blue-700">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#1a1a1a] flex items-center gap-1.5">
              <span>代码逐行执行慢动作镜头 (Code Execution Flow)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono border border-blue-200">
                单步追踪
              </span>
            </h3>
            <p className="text-[11px] text-[rgba(26,26,26,0.6)]">
              放慢 100 万倍！亲眼观察计算机指针如何从上到下一行行读取并改变世界
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="text-xs text-neutral-600 hover:text-[#1a1a1a] px-2 py-1 rounded hover:bg-neutral-100 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>重置</span>
          </button>

          <button
            onClick={handleNextStep}
            disabled={currentStepIndex >= STEPS.length - 1}
            className="btn btn-run rounded flex items-center gap-1 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
          >
            <span>{currentStepIndex >= STEPS.length - 1 ? "已执行完毕" : "单步推进 ➔"}</span>
          </button>
        </div>
      </div>

      {/* Code Listing with Active Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded bg-[#f8f7f4] p-3 border border-[rgba(26,26,26,0.08)] font-mono text-xs space-y-1.5">
          <div className="text-[10px] text-[rgba(26,26,26,0.5)] font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>指令指针 (Program Counter)</span>
            <span className="text-blue-600">当前行: {currentStep.stepNum}/4</span>
          </div>

          {STEPS.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isPast = idx < currentStepIndex;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 p-2 rounded transition-all ${
                  isCurrent
                    ? "bg-blue-50 border border-blue-200 text-blue-900 shadow-xs"
                    : isPast
                    ? "text-[rgba(26,26,26,0.4)] bg-neutral-100/50"
                    : "text-[rgba(26,26,26,0.6)]"
                }`}
              >
                <span className="w-5 text-right text-[10px] text-neutral-400 select-none">
                  0{step.stepNum}
                </span>
                <span className="flex-1 font-semibold">{step.codeLine}</span>
                {isCurrent && (
                  <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold animate-pulse">
                    正在执行
                  </span>
                )}
                {isPast && (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                )}
              </div>
            );
          })}
        </div>

        {/* Real-time State & Plain explanation */}
        <div className="space-y-2.5 flex flex-col justify-between">
          <div className="rounded bg-[#f8f7f4] p-3 border border-[rgba(26,26,26,0.08)] space-y-2">
            <span className="text-[10px] text-[rgba(26,26,26,0.5)] font-bold uppercase tracking-wider block font-mono">
              💡 当前行发生了什么？
            </span>
            <p className="text-xs text-[rgba(26,26,26,0.8)] leading-relaxed">
              {currentStep.explanation}
            </p>
          </div>

          <div className="rounded bg-[#f8f7f4] p-3 border border-[rgba(26,26,26,0.08)] space-y-1.5">
            <span className="text-[10px] text-[rgba(26,26,26,0.5)] font-bold uppercase tracking-wider block font-mono">
              📦 内存收纳盒当前快照 (RAM State)
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(currentStep.memoryState).map(([k, v]) => (
                <div key={k} className="px-2.5 py-1 rounded bg-white border border-[rgba(26,26,26,0.08)] text-xs font-mono shadow-xs">
                  <span className="text-blue-700 font-semibold">{k}</span>
                  <span className="text-neutral-400 mx-1">=</span>
                  <span className="text-emerald-700 font-bold">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Screen Output Terminal */}
      <div className="rounded bg-[#f8f7f4] p-2.5 border border-[rgba(26,26,26,0.08)] font-mono text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-[11px] text-[rgba(26,26,26,0.5)]">控制台即时输出：</span>
          <span className="text-emerald-800 font-bold">
            {accumulatedOutput.length > 0 ? accumulatedOutput.join(" | ") : "等待第 4 行 print 执行..."}
          </span>
        </div>
        {accumulatedOutput.length > 0 && (
          <span className="text-[10px] text-emerald-700 font-sans flex items-center gap-1 font-medium">
            <Sparkles className="h-3 w-3" />
            人类可见输出已产生
          </span>
        )}
      </div>
    </div>
  );
};
