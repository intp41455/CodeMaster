import React, { useState } from "react";
import { 
  Cpu, 
  HardDrive, 
  Layers, 
  Terminal, 
  ArrowRight, 
  Sparkles, 
  Play, 
  RotateCcw,
  Zap,
  Box,
  Eye,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

interface InteractiveAnatomyProps {
  currentLessonId?: string;
}

export const InteractiveComputerAnatomy: React.FC<InteractiveAnatomyProps> = ({ currentLessonId }) => {
  const [selectedPart, setSelectedPart] = useState<"cpu" | "ram" | "disk" | "io">("cpu");
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simLogs, setSimLogs] = useState<string[]>([
    "系统就绪：点击【单步执行真实流水线】观察硬件之间如何流转代码"
  ]);

  const PARTS = {
    cpu: {
      title: "CPU (中央处理器) · 电脑的心脏与超级神算手",
      metaphor: "厨师长（手速极快、不知疲倦、一秒切 10 亿片土豆，但记不住太多事，必须有人把菜端到他砧板上）",
      role: "负责真正执行指令：算加减乘除、做 if 逻辑判断。它只读写贴身最近的草稿纸（寄存器与高速缓存）。",
      speed: "极速 (纳秒级 ~0.3ns)",
      analogyInLife: "你脑子里正在飞速心算 12 + 18 的那一瞬间"
    },
    ram: {
      title: "RAM (内存) · 随用随取的临时大工作台",
      metaphor: "厨房的中央料理台 / 透明亚克力收纳盒大货架",
      role: "代码里声明的【变量】（如 my_name='小明'、money=100）全部整整齐齐摆放在这里！断电后里面的东西会全部清空消失。",
      speed: "很快 (~50-100ns)",
      analogyInLife: "你在桌面上摆开的笔记本和剪刀，随时伸手就能拿到，但下班收拾桌子时要清空"
    },
    disk: {
      title: "Hard Drive (固态硬盘 / 磁盘) · 永久藏宝库与大仓库",
      metaphor: "厨房地下储藏冷库 / 铁皮保险箱",
      role: "存放你写好的 .py 代码文件、照片、视频。就算拔掉电源关机，里面的数据也稳如泰山，永远不会丢失。",
      speed: "较慢 (毫秒/微秒级，相比内存慢上千倍)",
      analogyInLife: "书架上放着的硬皮菜谱，需要时才拿出来翻开摊在桌面上看"
    },
    io: {
      title: "I/O (输入与输出设备) · 电脑的眼睛、耳朵与嘴巴",
      metaphor: "传菜窗口 / 对讲麦克风与菜品展示台",
      role: "键盘、鼠标、麦克风是【输入（Input）】，屏幕黑框控制台（Terminal/print）是【输出（Output）】。把人类的想法送进去，把电脑的结果吐出来。",
      speed: "受人类反应限制 (人类打字速度对电脑来说慢如蜗牛)",
      analogyInLife: "顾客报菜名（键盘输入），服务员上菜喊号（print 控制台显示）"
    }
  };

  const handleStepSimulation = () => {
    setIsSimulating(true);
    const nextStep = (demoStep + 1) % 5;
    setDemoStep(nextStep);

    if (nextStep === 1) {
      setSelectedPart("disk");
      setSimLogs(prev => [
        ...prev,
        "① [硬盘/Disk] 找到保存的代码文件：main.py，读取指令行：`money = 50 + 20`"
      ]);
    } else if (nextStep === 2) {
      setSelectedPart("ram");
      setSimLogs(prev => [
        ...prev,
        "② [内存/RAM] 操作系统在内存货架中开辟一个贴着 `money` 标签的透明收纳盒，准备接收数据"
      ]);
    } else if (nextStep === 3) {
      setSelectedPart("cpu");
      setSimLogs(prev => [
        ...prev,
        "③ [CPU/算力核心] CPU 的算术逻辑单元 (ALU) 接收指令，电光石火间算出：50 + 20 = 70！并将其写入内存盒子"
      ]);
    } else if (nextStep === 4) {
      setSelectedPart("io");
      setSimLogs(prev => [
        ...prev,
        "④ [I/O输出] 执行 `print(money)`，将数值 70 转化为像素字符，在控制台屏幕闪亮呈现给人类！✨"
      ]);
      setIsSimulating(false);
    } else {
      setSelectedPart("cpu");
      setSimLogs(["已重置流水线，再次点击开启下一轮硬件流转模拟"]);
      setIsSimulating(false);
    }
  };

  const currentInfo = PARTS[selectedPart];

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
              <span>电脑身体解剖台与代码执行流转</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono border border-blue-200">
                硬件直觉
              </span>
            </h3>
            <p className="text-[11px] text-[rgba(26,26,26,0.6)]">
              点选部件或点击单步执行，亲眼看懂代码如何被硬件一件件流转处理
            </p>
          </div>
        </div>

        <button
          onClick={handleStepSimulation}
          className="btn btn-run rounded flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
        >
          <Play className="h-3.5 w-3.5" />
          <span>{demoStep === 4 ? "重置演示" : `流转步骤 ${demoStep}/4`}</span>
        </button>
      </div>

      {/* Hardware Layout Visualizer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* DISK */}
        <div
          onClick={() => setSelectedPart("disk")}
          className={`cursor-pointer rounded border p-3 transition-all flex flex-col justify-between ${
            selectedPart === "disk"
              ? "border-blue-600 bg-blue-50/50 shadow-xs"
              : "border-[rgba(26,26,26,0.08)] bg-white hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <HardDrive className={`h-5 w-5 ${selectedPart === "disk" ? "text-blue-700" : "text-neutral-400"}`} />
            {demoStep === 1 && (
              <span className="animate-pulse flex h-2 w-2 rounded-full bg-blue-600" />
            )}
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-[#1a1a1a]">硬盘 (Disk)</div>
            <div className="text-[10px] text-[rgba(26,26,26,0.5)] mt-0.5 font-mono">代码永久储藏库</div>
          </div>
        </div>

        {/* RAM */}
        <div
          onClick={() => setSelectedPart("ram")}
          className={`cursor-pointer rounded border p-3 transition-all flex flex-col justify-between ${
            selectedPart === "ram"
              ? "border-emerald-600 bg-emerald-50/50 shadow-xs"
              : "border-[rgba(26,26,26,0.08)] bg-white hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <Layers className={`h-5 w-5 ${selectedPart === "ram" ? "text-emerald-700" : "text-neutral-400"}`} />
            {demoStep === 2 && (
              <span className="animate-pulse flex h-2 w-2 rounded-full bg-emerald-600" />
            )}
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-[#1a1a1a]">内存 (RAM)</div>
            <div className="text-[10px] text-[rgba(26,26,26,0.5)] mt-0.5 font-mono">变量收纳盒大货架</div>
          </div>
        </div>

        {/* CPU */}
        <div
          onClick={() => setSelectedPart("cpu")}
          className={`cursor-pointer rounded border p-3 transition-all flex flex-col justify-between ${
            selectedPart === "cpu"
              ? "border-amber-600 bg-amber-50/50 shadow-xs"
              : "border-[rgba(26,26,26,0.08)] bg-white hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <Cpu className={`h-5 w-5 ${selectedPart === "cpu" ? "text-amber-700" : "text-neutral-400"}`} />
            {demoStep === 3 && (
              <span className="animate-pulse flex h-2 w-2 rounded-full bg-amber-600" />
            )}
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-[#1a1a1a]">CPU 运算大脑</div>
            <div className="text-[10px] text-[rgba(26,26,26,0.5)] mt-0.5 font-mono">神算手·指令执行器</div>
          </div>
        </div>

        {/* I/O */}
        <div
          onClick={() => setSelectedPart("io")}
          className={`cursor-pointer rounded border p-3 transition-all flex flex-col justify-between ${
            selectedPart === "io"
              ? "border-cyan-600 bg-cyan-50/50 shadow-xs"
              : "border-[rgba(26,26,26,0.08)] bg-white hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <Terminal className={`h-5 w-5 ${selectedPart === "io" ? "text-cyan-700" : "text-neutral-400"}`} />
            {demoStep === 4 && (
              <span className="animate-pulse flex h-2 w-2 rounded-full bg-cyan-600" />
            )}
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-[#1a1a1a]">输入/输出 (I/O)</div>
            <div className="text-[10px] text-[rgba(26,26,26,0.5)] mt-0.5 font-mono">屏幕输出·打印麦克风</div>
          </div>
        </div>
      </div>

      {/* Selected Hardware Details Card */}
      <div className="rounded bg-[#f8f7f4] p-3.5 border border-[rgba(26,26,26,0.08)] space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-[#1a1a1a] flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>{currentInfo.title}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-neutral-600 border border-[rgba(26,26,26,0.08)]">
            速度: {currentInfo.speed}
          </span>
        </div>

        <div className="text-xs text-[rgba(26,26,26,0.8)] space-y-1">
          <p>
            <strong className="text-amber-800">生活形象比喻：</strong>
            {currentInfo.metaphor}
          </p>
          <p>
            <strong className="text-blue-800">在写代码时的角色：</strong>
            {currentInfo.role}
          </p>
          <p className="text-[rgba(26,26,26,0.6)] text-[11px]">
            <strong>生活常识映射：</strong>
            {currentInfo.analogyInLife}
          </p>
        </div>
      </div>

      {/* Simulation Steps Output */}
      <div className="rounded bg-[#f8f7f4] p-3 border border-[rgba(26,26,26,0.08)] font-mono text-[11px] space-y-1 text-neutral-800 max-h-28 overflow-y-auto">
        <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1">
          <Terminal className="h-3 w-3 text-emerald-600" />
          <span>硬件总线数据流转实时日志</span>
        </div>
        {simLogs.map((log, idx) => (
          <div key={idx} className="animate-in fade-in leading-5">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};
