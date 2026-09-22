import React, { useState } from "react";
import { 
  Box, 
  ArrowRight, 
  Tag, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Eye, 
  Cpu, 
  Layers,
  HelpCircle
} from "lucide-react";

export const InteractiveVariablePlayground: React.FC = () => {
  const [varName, setVarName] = useState<string>("user_score");
  const [varValue, setVarValue] = useState<string>("100");
  const [isString, setIsString] = useState<boolean>(false);
  const [assignedVariables, setAssignedVariables] = useState<Array<{ name: string; value: string; isStr: boolean }>>([
    { name: "player_name", value: "小明", isStr: true },
    { name: "coins", value: "50", isStr: false }
  ]);
  const [lastAction, setLastAction] = useState<string>("点击【装入盒子】观察赋值操作与内存盒子的变化");

  const handleAssign = () => {
    if (!varName.trim()) return;
    const cleanName = varName.trim().replace(/\s+/g, "_");
    const cleanVal = varValue.trim() || "0";

    setAssignedVariables(prev => {
      const existsIndex = prev.findIndex(item => item.name === cleanName);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = { name: cleanName, value: cleanVal, isStr: isString };
        return updated;
      }
      return [...prev, { name: cleanName, value: cleanVal, isStr: isString }];
    });

    const displayVal = isString ? `"${cleanVal}"` : cleanVal;
    setLastAction(`执行指令：${cleanName} = ${displayVal} ➔ 已在内存中贴上标签【${cleanName}】，盒内装入数据【${displayVal}】`);
  };

  const handleIncrement = (name: string) => {
    setAssignedVariables(prev => {
      return prev.map(item => {
        if (item.name === name) {
          const num = parseInt(item.value, 10);
          if (!isNaN(num)) {
            const nextVal = (num + 10).toString();
            setLastAction(`执行自增：${name} = ${name} + 10 ➔ 原值 ${num} 加 10，新值 ${nextVal} 重新塞回盒子！`);
            return { ...item, value: nextVal, isStr: false };
          }
        }
        return item;
      });
    });
  };

  const handleReset = () => {
    setAssignedVariables([
      { name: "player_name", value: "小明", isStr: true },
      { name: "coins", value: "50", isStr: false }
    ]);
    setLastAction("已恢复初始示例收纳盒");
  };

  return (
    <div className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-white p-4 space-y-4 text-[#1a1a1a] font-['Geist',sans-serif] shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
            <Box className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-[#1a1a1a] flex items-center gap-1.5">
              <span>变量透明收纳盒互动实验室</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono border border-emerald-200">
                实物映射
              </span>
            </h3>
            <p className="text-[11px] text-[rgba(26,26,26,0.6)]">
              给收纳盒贴上名字便签，装入文字或数字，亲身体会等号“赋值”的物理感
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-neutral-500 hover:text-[#1a1a1a] flex items-center gap-1 px-2 py-1 rounded hover:bg-neutral-100 transition-colors"
          title="重置"
        >
          <RotateCcw className="h-3 w-3" />
          <span>重置</span>
        </button>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end bg-[#f8f7f4] p-3 rounded-lg border border-[rgba(26,26,26,0.08)]">
        <div className="sm:col-span-4 space-y-1">
          <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1 font-mono">
            <Tag className="h-3 w-3 text-blue-600" />
            <span>便签名称 (变量名)</span>
          </label>
          <input
            type="text"
            value={varName}
            onChange={(e) => setVarName(e.target.value)}
            className="w-full bg-white border border-[rgba(26,26,26,0.12)] rounded px-2.5 py-1.5 text-xs text-[#1a1a1a] font-mono focus:outline-none focus:border-blue-600 shadow-xs"
            placeholder="如 my_pet, score"
          />
        </div>

        <div className="sm:col-span-1 flex items-center justify-center pb-2 text-neutral-400 font-bold text-sm">
          =
        </div>

        <div className="sm:col-span-4 space-y-1">
          <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center justify-between font-mono">
            <span>装入的数据 (值)</span>
            <button
              onClick={() => setIsString(!isString)}
              className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                isString ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-neutral-200 text-neutral-700"
              }`}
            >
              {isString ? "文字(加引号)" : "数字"}
            </button>
          </label>
          <input
            type="text"
            value={varValue}
            onChange={(e) => setVarValue(e.target.value)}
            className="w-full bg-white border border-[rgba(26,26,26,0.12)] rounded px-2.5 py-1.5 text-xs text-[#1a1a1a] font-mono focus:outline-none focus:border-blue-600 shadow-xs"
            placeholder="如 100, 旺财"
          />
        </div>

        <div className="sm:col-span-3">
          <button
            onClick={handleAssign}
            className="btn btn-run w-full rounded flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>装入盒子(=)</span>
          </button>
        </div>
      </div>

      {/* Memory Shelf: Display of variable boxes */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-neutral-600 flex items-center justify-between font-mono">
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            <span>电脑内存大货架上的当前收纳盒（变量池）：</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">
            {assignedVariables.length} 个活跃盒子
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {assignedVariables.map((v) => {
            const isNumber = !isNaN(Number(v.value)) && !v.isStr;
            return (
              <div
                key={v.name}
                className="relative overflow-hidden rounded-lg border border-[rgba(26,26,26,0.08)] bg-white p-3 shadow-xs group hover:border-blue-300 transition-all"
              >
                {/* Tag at the top of the box */}
                <div className="flex items-center justify-between border-b border-[rgba(26,26,26,0.06)] pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#1a1a1a]">
                    <Tag className="h-3 w-3 text-blue-600" />
                    <span>{v.name}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono border border-blue-200">
                    {v.isStr ? "文字(str)" : "数字(int)"}
                  </span>
                </div>

                {/* Box content */}
                <div className="flex items-center justify-center py-2 bg-[#f8f7f4] rounded border border-[rgba(26,26,26,0.08)] text-sm font-mono font-bold text-[#1a1a1a]">
                  {v.isStr ? (
                    <span className="text-amber-700">"{v.value}"</span>
                  ) : (
                    <span className="text-emerald-700">{v.value}</span>
                  )}
                </div>

                {/* Quick Action if number */}
                {isNumber && (
                  <div className="mt-2 pt-1.5 flex items-center justify-between border-t border-[rgba(26,26,26,0.06)]">
                    <span className="text-[10px] text-neutral-400">模拟递增:</span>
                    <button
                      onClick={() => handleIncrement(v.name)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 transition-colors"
                      title="模拟自增 +10"
                    >
                      <span>{v.name} += 10</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action execution feedback */}
      <div className="rounded bg-[#f8f7f4] p-2.5 border border-[rgba(26,26,26,0.08)] text-xs font-mono text-neutral-800 flex items-center gap-2">
        <Cpu className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <span className="text-[rgba(26,26,26,0.8)] leading-relaxed text-[11px]">
          {lastAction}
        </span>
      </div>
    </div>
  );
};
