import React, { useState } from "react";
import { Target, Puzzle, Gamepad2 } from "lucide-react";
import { GameQuizArena } from "./GameQuizArena";
import { CodeBlockPuzzle } from "./CodeBlockPuzzle";

type GameTab = "quiz" | "puzzle";

interface GameZoneProps {
  /** 游戏获得经验值时回传，用于累加到全局进度 */
  onEarnXp?: (xp: number) => void;
}

/**
 * 游戏化学习区。
 *
 * 两个子游戏使用 display 切换而不是条件渲染，
 * 这样在两者之间来回切换时，游戏进度不会丢失。
 */
export const GameZone: React.FC<GameZoneProps> = ({ onEarnXp }) => {
  const [activeGame, setActiveGame] = useState<GameTab>("quiz");

  const tabs: { id: GameTab; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: "quiz",
      label: "闯关竞技场",
      desc: "限时答题 · 连击加成 · 评级结算",
      icon: <Target className="h-3.5 w-3.5" />,
    },
    {
      id: "puzzle",
      label: "代码积木",
      desc: "还原代码执行顺序 · 理解程序流程",
      icon: <Puzzle className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <div className="min-h-full bg-[#f8f7f4]">
      {/* 区块标题与子游戏切换 */}
      <div className="border-b border-[rgba(26,26,26,0.08)] bg-[#f8f7f4]">
        <div className="mx-auto max-w-3xl px-4 pt-7 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <Gamepad2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-[#1a1a1a]">游戏化训练区</h1>
              <p className="text-[11px] text-[rgba(26,26,26,0.55)]">
                用胜负欲驱动学习，赢的同时把知识刻进肌肉记忆
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {tabs.map((tab) => {
              const isActive = activeGame === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveGame(tab.id)}
                  className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-left transition-all ${
                    isActive
                      ? "border-blue-500 bg-white shadow-sm ring-1 ring-blue-200"
                      : "border-[rgba(26,26,26,0.08)] bg-white/60 hover:border-blue-300 hover:bg-white"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                      isActive
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-[rgba(26,26,26,0.1)] bg-[#f8f7f4] text-[rgba(26,26,26,0.5)]"
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span className="flex-1">
                    <span
                      className={`block text-xs font-semibold ${
                        isActive ? "text-blue-700" : "text-[#1a1a1a]"
                      }`}
                    >
                      {tab.label}
                    </span>
                    <span className="mt-0.5 block text-[10.5px] leading-relaxed text-[rgba(26,26,26,0.55)]">
                      {tab.desc}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 游戏主体：用 display 切换以保留各自进度 */}
      <div style={{ display: activeGame === "quiz" ? "block" : "none" }}>
        <GameQuizArena onEarnXp={onEarnXp} />
      </div>
      <div style={{ display: activeGame === "puzzle" ? "block" : "none" }}>
        <CodeBlockPuzzle onEarnXp={onEarnXp} />
      </div>
    </div>
  );
};
