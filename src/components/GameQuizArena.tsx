import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  RotateCcw,
  Heart,
  Timer,
  Zap,
  Trophy,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Crown,
  Flame,
  Target,
} from "lucide-react";
import { QUIZ_QUESTIONS, QuizQuestion } from "../data/gameArenaData";

/** 每局抽取的题目数量 */
const ROUND_SIZE = 8;
/** 每题限时（秒） */
const TIME_PER_QUESTION = 20;
/** 初始生命值 */
const MAX_LIVES = 3;
/** 答对基础得分 */
const BASE_SCORE = 100;
/** 每题剩余时间带来的额外得分系数 */
const TIME_BONUS_FACTOR = 5;
/** 连击倍率表：索引为连击数，取不超过当前连击的最大倍率 */
const COMBO_MULTIPLIERS: { threshold: number; multiplier: number; label: string }[] = [
  { threshold: 5, multiplier: 3, label: "无处可挡" },
  { threshold: 4, multiplier: 2.5, label: "火力全开" },
  { threshold: 3, multiplier: 2, label: "势如破竹" },
  { threshold: 2, multiplier: 1.5, label: "连击" },
  { threshold: 1, multiplier: 1.2, label: "手感不错" },
];

const HIGH_SCORE_KEY = "codemaster_arena_highscore";
const BEST_COMBO_KEY = "codemaster_arena_bestcombo";

type Phase = "idle" | "playing" | "finished";

interface AnswerRecord {
  question: QuizQuestion;
  chosenOptionId: string | null;
  correct: boolean;
}

/** Fisher-Yates 洗牌，返回新数组，不修改原数组 */
function shuffle<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getComboMultiplier(combo: number): { multiplier: number; label: string } {
  const hit = COMBO_MULTIPLIERS.find((item) => combo >= item.threshold);
  return hit ? { multiplier: hit.multiplier, label: hit.label } : { multiplier: 1, label: "" };
}

function getRank(accuracy: number, livesLeft: number, total: number): { rank: string; comment: string } {
  if (accuracy === 1 && livesLeft === MAX_LIVES) {
    return { rank: "S", comment: "完美通关！你的基础扎实得可怕。" };
  }
  if (accuracy >= 0.85 && livesLeft >= 2) {
    return { rank: "A", comment: "表现优异，只差一点点就是满分。" };
  }
  if (accuracy >= 0.6) {
    return { rank: "B", comment: "基础不错，个别知识点还需要回炉。" };
  }
  if (total > 0) {
    return { rank: "C", comment: "别灰心，错题回顾里有你要的答案。" };
  }
  return { rank: "-", comment: "" };
}

interface GameQuizArenaProps {
  /** 结算时把获得的经验值回传给外层进度体系 */
  onEarnXp?: (xp: number) => void;
}

export const GameQuizArena: React.FC<GameQuizArenaProps> = ({ onEarnXp }) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [queue, setQueue] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [chosenOptionId, setChosenOptionId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [scorePulse, setScorePulse] = useState(false);

  /** 记录滚动容器，结算后自动回到顶部 */
  const topRef = useRef<HTMLDivElement | null>(null);
  /** 防止同一题被重复结算 */
  const settledRef = useRef(false);
  /** 防止同一局被重复结算（经验值只发放一次） */
  const settledRoundRef = useRef(false);
  /** 组件生命周期内的所有定时器，卸载时统一清理，避免卸载后仍触发状态更新 */
  const timersRef = useRef<number[]>([]);
  /** 始终指向最新的 settleQuestion，供倒计时回调使用，避免反复重建定时器 */
  const settleRef = useRef<(optionId: string | null) => void>(() => {});

  /** 可被统一清理的延时任务 */
  const scheduleTimer = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, delay);
    timersRef.current.push(id);
  }, []);

  // 读取历史最佳成绩
  useEffect(() => {
    try {
      const hs = Number(localStorage.getItem(HIGH_SCORE_KEY) || "0");
      const bc = Number(localStorage.getItem(BEST_COMBO_KEY) || "0");
      if (Number.isFinite(hs)) setHighScore(hs);
      if (Number.isFinite(bc)) setBestCombo(bc);
    } catch (_) {
      // localStorage 不可用时静默忽略
    }
  }, []);

  const currentQuestion = phase === "playing" ? queue[index] : undefined;
  const totalAnswered = records.length;
  const correctCount = records.filter((r) => r.correct).length;
  const accuracy = totalAnswered > 0 ? correctCount / totalAnswered : 0;
  const comboInfo = getComboMultiplier(combo);

  const startGame = useCallback(() => {
    setQueue(shuffle(QUIZ_QUESTIONS).slice(0, Math.min(ROUND_SIZE, QUIZ_QUESTIONS.length)));
    setIndex(0);
    setLives(MAX_LIVES);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(TIME_PER_QUESTION);
    setChosenOptionId(null);
    setLocked(false);
    setRecords([]);
    setXpAwarded(0);
    settledRef.current = false;
    settledRoundRef.current = false;
    setPhase("playing");
  }, []);

  const finishGame = useCallback(
    (finalScore: number, finalRecords: AnswerRecord[], finalMaxCombo: number) => {
      // 一局只结算一次，避免任何异常路径导致经验值重复发放
      if (settledRoundRef.current) return;
      settledRoundRef.current = true;

      const earnedXp = Math.max(20, Math.round(finalScore / 10));
      setXpAwarded(earnedXp);
      onEarnXp?.(earnedXp);

      try {
        const prevHs = Number(localStorage.getItem(HIGH_SCORE_KEY) || "0");
        if (finalScore > prevHs) {
          localStorage.setItem(HIGH_SCORE_KEY, String(finalScore));
          setHighScore(finalScore);
        }
        const prevBc = Number(localStorage.getItem(BEST_COMBO_KEY) || "0");
        if (finalMaxCombo > prevBc) {
          localStorage.setItem(BEST_COMBO_KEY, String(finalMaxCombo));
          setBestCombo(finalMaxCombo);
        }
      } catch (_) {
        // 忽略存储异常
      }

      setPhase("finished");
    },
    [onEarnXp]
  );

  /**
   * 结算当前题目。
   * @param optionId 选中的选项 id，超时结算时传 null
   */
  const settleQuestion = useCallback(
    (optionId: string | null) => {
      if (settledRef.current || !currentQuestion) return;
      settledRef.current = true;

      const correctOption = currentQuestion.options.find((o) => o.isCorrect);
      const isCorrect = Boolean(optionId && correctOption && optionId === correctOption.id);

      const record: AnswerRecord = {
        question: currentQuestion,
        chosenOptionId: optionId,
        correct: isCorrect,
      };

      setChosenOptionId(optionId);
      setLocked(true);

      let nextScore = score;
      let nextCombo = combo;
      let nextLives = lives;

      if (isCorrect) {
        const { multiplier } = getComboMultiplier(combo + 1);
        const gained = Math.round((BASE_SCORE + timeLeft * TIME_BONUS_FACTOR) * multiplier);
        nextScore = score + gained;
        nextCombo = combo + 1;
        setScore(nextScore);
        setCombo(nextCombo);
        setMaxCombo((prev) => Math.max(prev, nextCombo));
        setScorePulse(true);
        scheduleTimer(() => setScorePulse(false), 400);
      } else {
        nextCombo = 0;
        nextLives = lives - 1;
        setCombo(0);
        setLives(nextLives);
      }

      const nextRecords = [...records, record];
      setRecords(nextRecords);

      // 答对后短暂展示解析，再自动进入下一题
      const delay = isCorrect ? 1800 : 3200;
      scheduleTimer(() => {
        const isLastQuestion = index >= queue.length - 1;
        const outOfLives = nextLives <= 0;

        if (outOfLives || isLastQuestion) {
          finishGame(nextScore, nextRecords, Math.max(maxCombo, nextCombo));
          return;
        }
        setIndex((prev) => prev + 1);
        setTimeLeft(TIME_PER_QUESTION);
        setChosenOptionId(null);
        setLocked(false);
        settledRef.current = false;
      }, delay);
    },
    [
      combo,
      currentQuestion,
      finishGame,
      index,
      lives,
      maxCombo,
      queue.length,
      records,
      scheduleTimer,
      score,
      timeLeft,
    ]
  );

  // 让 settleRef 始终指向最新的结算函数
  useEffect(() => {
    settleRef.current = settleQuestion;
  }, [settleQuestion]);

  // 倒计时驱动：仅在题目切换或锁定状态变化时重建定时器，
  // 避免因依赖每秒变化而导致计时漂移
  useEffect(() => {
    if (phase !== "playing" || locked) return undefined;
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          // 推迟到本次状态更新之外再结算，避免在更新函数内部触发副作用
          window.setTimeout(() => settleRef.current(null), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, locked, index]);

  // 组件卸载时清理所有未完成的定时器
  useEffect(() => {
    const timers = timersRef;
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, []);

  // 结算后回到顶部
  useEffect(() => {
    if (phase === "finished") {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [phase]);

  const timePercent = Math.max(0, Math.min(100, (timeLeft / TIME_PER_QUESTION) * 100));
  const rankInfo = useMemo(
    () => getRank(accuracy, lives, totalAnswered),
    [accuracy, lives, totalAnswered]
  );

  const wrongRecords = records.filter((r) => !r.correct);

  // ============================================================
  // 渲染：待机页
  // ============================================================
  if (phase === "idle") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-[rgba(26,26,26,0.08)] bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#1a1a1a]">编程闯关竞技场</h1>
              <p className="text-xs text-[rgba(26,26,26,0.6)] mt-0.5">
                每局随机抽取 {ROUND_SIZE} 道题，考的是理解，不是背诵
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] p-4">
              <div className="flex items-center gap-2 text-rose-600">
                <Heart className="h-4 w-4" />
                <span className="text-xs font-semibold">{MAX_LIVES} 条生命</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-[rgba(26,26,26,0.65)]">
                答错或超时扣一条，扣完即结束。
              </p>
            </div>
            <div className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] p-4">
              <div className="flex items-center gap-2 text-amber-600">
                <Timer className="h-4 w-4" />
                <span className="text-xs font-semibold">{TIME_PER_QUESTION} 秒限时</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-[rgba(26,26,26,0.65)]">
                剩得越多，加分越多。
              </p>
            </div>
            <div className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Flame className="h-4 w-4" />
                <span className="text-xs font-semibold">最高 3 倍连击</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-[rgba(26,26,26,0.65)]">
                连续答对 5 题触发最高倍率。
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-6 rounded-xl border border-[rgba(26,26,26,0.08)] px-5 py-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-[rgba(26,26,26,0.6)]">历史最高分</span>
              <span className="font-['Geist_Mono',monospace] text-sm font-bold text-[#1a1a1a]">
                {highScore}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-rose-500" />
              <span className="text-xs text-[rgba(26,26,26,0.6)]">最高连击</span>
              <span className="font-['Geist_Mono',monospace] text-sm font-bold text-[#1a1a1a]">
                {bestCombo}
              </span>
            </div>
          </div>

          <button
            id="arena-start-btn"
            onClick={startGame}
            className="btn btn-run mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.99]"
          >
            <Play className="h-4 w-4" />
            <span>开始闯关</span>
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // 渲染：结算页
  // ============================================================
  if (phase === "finished") {
    const rank = rankInfo.rank;
    const rankColor =
      rank === "S"
        ? "text-amber-500"
        : rank === "A"
        ? "text-blue-600"
        : rank === "B"
        ? "text-emerald-600"
        : "text-neutral-500";

    return (
      <div ref={topRef} className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-[rgba(26,26,26,0.08)] bg-white p-8 shadow-sm">
          <div className="text-center">
            {rank === "S" && <Crown className="mx-auto h-10 w-10 text-amber-500" />}
            <div className={`font-['Cormorant_Garamond',serif] text-6xl font-bold ${rankColor}`}>
              {rank}
            </div>
            <p className="mt-2 text-sm text-[rgba(26,26,26,0.7)]">{rankInfo.comment}</p>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-[rgba(26,26,26,0.5)]">
                总得分
              </div>
              <div className="mt-1 font-['Geist_Mono',monospace] text-xl font-bold text-[#1a1a1a]">
                {score}
              </div>
            </div>
            <div className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-[rgba(26,26,26,0.5)]">
                正确率
              </div>
              <div className="mt-1 font-['Geist_Mono',monospace] text-xl font-bold text-[#1a1a1a]">
                {Math.round(accuracy * 100)}%
              </div>
            </div>
            <div className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-[rgba(26,26,26,0.5)]">
                最高连击
              </div>
              <div className="mt-1 font-['Geist_Mono',monospace] text-xl font-bold text-[#1a1a1a]">
                {maxCombo}
              </div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
              <div className="text-[10px] uppercase tracking-wider text-blue-700">获得经验</div>
              <div className="mt-1 font-['Geist_Mono',monospace] text-xl font-bold text-blue-700">
                +{xpAwarded}
              </div>
            </div>
          </div>

          {score >= highScore && score > 0 && (
            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-700">
              <Trophy className="h-4 w-4" />
              <span>刷新个人最高分纪录</span>
            </div>
          )}

          {wrongRecords.length > 0 && (
            <div className="mt-8">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1a1a1a]">
                <XCircle className="h-4 w-4 text-rose-500" />
                <span>错题回顾（{wrongRecords.length} 题）</span>
              </h3>
              <div className="mt-3 space-y-3">
                {wrongRecords.map((rec) => {
                  const correctOption = rec.question.options.find((o) => o.isCorrect);
                  const chosen = rec.question.options.find((o) => o.id === rec.chosenOptionId);
                  return (
                    <div
                      key={rec.question.id}
                      className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold text-[#1a1a1a]">{rec.question.question}</p>
                        <span className="shrink-0 rounded bg-white px-2 py-0.5 text-[10px] text-[rgba(26,26,26,0.6)] border border-[rgba(26,26,26,0.08)]">
                          {rec.question.track}
                        </span>
                      </div>
                      {rec.question.codeSnippet && (
                        <pre className="mt-2 overflow-x-auto rounded-lg bg-white p-3 font-['Geist_Mono',monospace] text-[11px] leading-relaxed text-[rgba(26,26,26,0.85)] border border-[rgba(26,26,26,0.08)]">
                          {rec.question.codeSnippet}
                        </pre>
                      )}
                      <div className="mt-2.5 space-y-1.5 text-[11px]">
                        <p className="text-rose-600">
                          你选择了：{chosen ? chosen.text : "（超时未作答）"}
                        </p>
                        <p className="text-emerald-700">正确答案：{correctOption?.text}</p>
                        <p className="leading-relaxed text-[rgba(26,26,26,0.7)]">
                          {correctOption?.explanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={startGame}
              className="btn btn-run flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-95 active:scale-[0.99]"
            >
              <RotateCcw className="h-4 w-4" />
              <span>再来一局</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // 渲染：答题页
  // ============================================================
  const progressPercent = ((index + 1) / queue.length) * 100;
  const correctOptionId = currentQuestion?.options.find((o) => o.isCorrect)?.id;
  const isTimeCritical = timeLeft <= 5;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* 顶部状态栏 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[rgba(26,26,26,0.08)] bg-white px-4 py-3 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <Heart
                key={i}
                className={`h-4 w-4 ${
                  i < lives ? "text-rose-500 fill-rose-500" : "text-neutral-300"
                }`}
              />
            ))}
          </div>
          <span className="font-['Geist_Mono',monospace] text-[11px] text-[rgba(26,26,26,0.55)]">
            第 {index + 1} / {queue.length} 题
          </span>
        </div>

        <div className="flex items-center gap-4">
          {combo >= 2 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200">
              <Flame className="h-3 w-3" />
              {combo} 连击 · {comboInfo.label} ×{comboInfo.multiplier}
            </span>
          )}
          <span
            className={`font-['Geist_Mono',monospace] text-sm font-bold transition-transform ${
              scorePulse ? "scale-110 text-blue-700" : "text-[#1a1a1a]"
            }`}
          >
            {score}
          </span>
        </div>
      </div>

      {/* 时间条 */}
      <div className="mb-5">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-[rgba(26,26,26,0.55)]">
            <Timer className={`h-3 w-3 ${isTimeCritical ? "text-rose-500" : ""}`} />
            <span className={isTimeCritical ? "text-rose-600 font-semibold" : ""}>
              剩余 {timeLeft} 秒
            </span>
          </span>
          <span className="text-[rgba(26,26,26,0.4)]">进度 {Math.round(progressPercent)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(26,26,26,0.08)]">
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${
              isTimeCritical ? "bg-rose-500" : "bg-blue-600"
            }`}
            style={{ width: `${timePercent}%` }}
          />
        </div>
      </div>

      {/* 题目卡片 */}
      <div className="rounded-2xl border border-[rgba(26,26,26,0.08)] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-200">
            {currentQuestion?.track}
          </span>
          <span className="rounded bg-[#f8f7f4] px-2 py-0.5 text-[10px] text-[rgba(26,26,26,0.6)] border border-[rgba(26,26,26,0.08)]">
            {currentQuestion?.difficulty}
          </span>
        </div>

        <h2 className="text-sm font-semibold leading-relaxed text-[#1a1a1a]">
          {currentQuestion?.question}
        </h2>

        {currentQuestion?.codeSnippet && (
          <pre className="mt-3 overflow-x-auto rounded-xl bg-[#f8f7f4] p-4 font-['Geist_Mono',monospace] text-xs leading-relaxed text-[rgba(26,26,26,0.85)] border border-[rgba(26,26,26,0.08)]">
            {currentQuestion.codeSnippet}
          </pre>
        )}

        <div className="mt-5 space-y-2.5">
          {currentQuestion?.options.map((option) => {
            const isChosen = chosenOptionId === option.id;
            const isCorrectOption = option.id === correctOptionId;

            let tone =
              "border-[rgba(26,26,26,0.08)] bg-white hover:border-blue-300 hover:bg-blue-50/40";
            if (locked) {
              if (isCorrectOption) {
                tone = "border-emerald-300 bg-emerald-50";
              } else if (isChosen) {
                tone = "border-rose-300 bg-rose-50";
              } else {
                tone = "border-[rgba(26,26,26,0.08)] bg-white opacity-60";
              }
            }

            return (
              <button
                key={option.id}
                disabled={locked}
                onClick={() => settleQuestion(option.id)}
                className={`w-full rounded-xl border p-3.5 text-left transition-all disabled:cursor-default ${tone}`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[rgba(26,26,26,0.12)] bg-[#f8f7f4] font-['Geist_Mono',monospace] text-[10px] font-bold text-[rgba(26,26,26,0.6)]">
                    {option.id.toUpperCase()}
                  </span>
                  <span className="flex-1 text-xs leading-relaxed text-[#1a1a1a]">
                    {option.text}
                  </span>
                  {locked && isCorrectOption && (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  )}
                  {locked && isChosen && !isCorrectOption && (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  )}
                </div>

                {locked && (isChosen || isCorrectOption) && (
                  <p
                    className={`mt-2.5 pl-7 text-[11px] leading-relaxed ${
                      isCorrectOption ? "text-emerald-800" : "text-rose-700"
                    }`}
                  >
                    {option.explanation}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {locked && (
          <div className="mt-5 flex items-center justify-between border-t border-[rgba(26,26,26,0.08)] pt-4">
            <span className="text-[11px] text-[rgba(26,26,26,0.5)]">
              {chosenOptionId === null
                ? "超时未作答，已扣除一条生命"
                : chosenOptionId === correctOptionId
                ? "回答正确，正在进入下一题…"
                : "回答错误，仔细看看解析"}
            </span>
            <ChevronRight className="h-4 w-4 text-[rgba(26,26,26,0.35)]" />
          </div>
        )}

        {locked && correctOptionId && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
            <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
            <p className="text-[11px] leading-relaxed text-blue-900">
              {currentQuestion?.funFact}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
