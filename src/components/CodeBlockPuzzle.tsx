import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Puzzle,
  Shuffle,
  Lightbulb,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Trophy,
} from "lucide-react";
import { CODE_PUZZLES, CodePuzzle } from "../data/gameArenaData";

interface CodeLine {
  id: string;
  text: string;
}

/** Fisher-Yates 洗牌，返回新数组 */
function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * 按正确顺序生成代码行，并打乱。
 * 若打乱结果恰好与正确顺序一致，则重新打乱，避免出现「开局即通关」。
 */
function buildShuffledLines(correctOrder: string[]): CodeLine[] {
  const base: CodeLine[] = correctOrder.map((text, i) => ({ id: `line-${i}`, text }));
  let result = shuffle(base);
  let guard = 0;
  while (
    guard < 20 &&
    result.length > 1 &&
    result.every((line, i) => line.text === correctOrder[i])
  ) {
    result = shuffle(base);
    guard += 1;
  }
  return result;
}

interface CodeBlockPuzzleProps {
  /** 答对时把获得的经验值回传给外层进度体系 */
  onEarnXp?: (xp: number) => void;
}

export const CodeBlockPuzzle: React.FC<CodeBlockPuzzleProps> = ({ onEarnXp }) => {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [lines, setLines] = useState<CodeLine[]>([]);
  const [selectedPos, setSelectedPos] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [solved, setSolved] = useState(false);
  const [wrongPositions, setWrongPositions] = useState<number[]>([]);
  const [roundScore, setRoundScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);

  const puzzle: CodePuzzle = CODE_PUZZLES[puzzleIndex % CODE_PUZZLES.length];

  /** 装载题目（可选指定题目下标） */
  const loadPuzzle = useCallback((index: number) => {
    const target = CODE_PUZZLES[index % CODE_PUZZLES.length];
    setPuzzleIndex(index % CODE_PUZZLES.length);
    setLines(buildShuffledLines(target.correctOrder));
    setSelectedPos(null);
    setAttempts(0);
    setHintUsed(false);
    setSolved(false);
    setWrongPositions([]);
    setRoundScore(0);
  }, []);

  // 首次挂载装载第一题
  useEffect(() => {
    loadPuzzle(0);
  }, [loadPuzzle]);

  /** 交换两行位置 */
  const swapLines = (from: number, to: number) => {
    if (from === to) return;
    setLines((prev) => {
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
    setSelectedPos(null);
    setWrongPositions([]);
  };

  const handleLineClick = (position: number) => {
    if (solved) return;
    if (selectedPos === null) {
      setSelectedPos(position);
      return;
    }
    swapLines(selectedPos, position);
  };

  const handleCheck = () => {
    if (solved || lines.length === 0) return;
    const isCorrect = lines.every((line, i) => line.text === puzzle.correctOrder[i]);

    if (isCorrect) {
      // 基础 100 分，每次错误尝试扣 15，使用提示扣 25，保底 20
      const gained = Math.max(20, 100 - attempts * 15 - (hintUsed ? 25 : 0));
      setRoundScore(gained);
      setTotalScore((prev) => prev + gained);
      setSolvedCount((prev) => prev + 1);
      setSolved(true);
      setWrongPositions([]);
      onEarnXp?.(Math.round(gained / 2));
    } else {
      setAttempts((prev) => prev + 1);
      const wrong = lines
        .map((line, i) => (line.text === puzzle.correctOrder[i] ? -1 : i))
        .filter((i) => i >= 0);
      setWrongPositions(wrong);
    }
  };

  const handleReshuffle = () => {
    if (solved) return;
    setLines((prev) => shuffle(prev));
    setSelectedPos(null);
    setWrongPositions([]);
  };

  const handleNext = () => {
    loadPuzzle(puzzleIndex + 1);
  };

  const progressText = useMemo(() => {
    const total = CODE_PUZZLES.length;
    return `${(puzzleIndex % total) + 1} / ${total}`;
  }, [puzzleIndex]);

  const langLabel = useMemo(() => {
    const map: Record<string, string> = {
      python: "Python",
      javascript: "JavaScript",
      typescript: "TypeScript",
    };
    return map[puzzle.language] || puzzle.language;
  }, [puzzle.language]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* 成绩条 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgba(26,26,26,0.08)] bg-white px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Puzzle className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-semibold text-[#1a1a1a]">代码积木</span>
          <span className="font-['Geist_Mono',monospace] text-[11px] text-[rgba(26,26,26,0.5)]">
            第 {progressText} 题
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5 text-[11px] text-[rgba(26,26,26,0.6)]">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            已解 {solvedCount} 题
          </span>
          <span className="flex items-center gap-1.5 font-['Geist_Mono',monospace] text-sm font-bold text-[#1a1a1a]">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            {totalScore}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-[rgba(26,26,26,0.08)] bg-white p-6 shadow-sm">
        {/* 题目信息 */}
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-[#1a1a1a]">{puzzle.title}</h2>
          <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200">
            {langLabel}
          </span>
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-[rgba(26,26,26,0.7)]">
          <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
          <span>任务目标：{puzzle.goal}</span>
        </p>

        {/* 操作提示 */}
        <div className="mt-4 rounded-xl border border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] px-3.5 py-2.5 text-[11px] leading-relaxed text-[rgba(26,26,26,0.65)]">
          点击一行选中它，再点击另一行，两行就会交换位置。把代码调整成正确的执行顺序后，点击「检查答案」。
        </div>

        {/* 代码行列表 */}
        <div className="mt-4 space-y-1.5">
          {lines.map((line, position) => {
            const isSelected = selectedPos === position;
            const isWrong = wrongPositions.includes(position);

            let tone =
              "border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] hover:border-blue-300 hover:bg-blue-50/40";
            if (solved) {
              tone = "border-emerald-200 bg-emerald-50/60";
            } else if (isSelected) {
              tone = "border-blue-500 bg-blue-50 ring-1 ring-blue-300";
            } else if (isWrong) {
              tone = "border-rose-300 bg-rose-50";
            }

            return (
              <button
                key={line.id}
                disabled={solved}
                onClick={() => handleLineClick(position)}
                className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all disabled:cursor-default ${tone}`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white font-['Geist_Mono',monospace] text-[10px] text-[rgba(26,26,26,0.45)] border border-[rgba(26,26,26,0.1)]">
                  {position + 1}
                </span>
                <code className="flex-1 whitespace-pre font-['Geist_Mono',monospace] text-[11.5px] leading-relaxed text-[#1a1a1a]">
                  {line.text}
                </code>
                {isWrong && !solved && <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-500" />}
                {solved && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
              </button>
            );
          })}
        </div>

        {/* 错误提示 */}
        {wrongPositions.length > 0 && !solved && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
            <p className="text-[11px] leading-relaxed text-rose-700">
              有 {wrongPositions.length} 行位置不对（红色标记处）。想一想：程序是按从上到下的顺序执行的，
              被依赖的变量一定先出现。
            </p>
          </div>
        )}

        {/* 提示 */}
        {hintUsed && !solved && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <p className="text-[11px] leading-relaxed text-amber-800">{puzzle.hint}</p>
          </div>
        )}

        {/* 成功反馈 */}
        {solved && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-800">
                排序正确！本题得分 +{roundScore}
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-emerald-900">
              {puzzle.explanation}
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-5 flex flex-wrap gap-2.5 border-t border-[rgba(26,26,26,0.08)] pt-4">
          {!solved && (
            <>
              <button
                onClick={handleCheck}
                className="btn btn-run flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-95 active:scale-[0.98]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>检查答案</span>
              </button>

              <button
                onClick={handleReshuffle}
                className="flex items-center gap-1.5 rounded-lg border border-[rgba(26,26,26,0.12)] bg-white px-4 py-2 text-xs font-medium text-[rgba(26,26,26,0.7)] transition-colors hover:bg-[#f8f7f4]"
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span>重新打乱</span>
              </button>

              {!hintUsed && (
                <button
                  onClick={() => setHintUsed(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>给我提示（-25 分）</span>
                </button>
              )}
            </>
          )}

          {solved && (
            <button
              onClick={handleNext}
              className="btn btn-run flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-95 active:scale-[0.98]"
            >
              <span>下一题</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={() => loadPuzzle(puzzleIndex)}
            className="flex items-center gap-1.5 rounded-lg border border-[rgba(26,26,26,0.12)] bg-white px-4 py-2 text-xs font-medium text-[rgba(26,26,26,0.7)] transition-colors hover:bg-[#f8f7f4]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>重做本题</span>
          </button>
        </div>
      </div>
    </div>
  );
};
