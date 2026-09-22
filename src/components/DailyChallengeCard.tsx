import React from "react";
import { 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Code2, 
  Zap,
  CalendarCheck
} from "lucide-react";
import { DailyChallenge, UserProgress } from "../types";

interface DailyChallengeCardProps {
  challenge: DailyChallenge;
  progress: UserProgress;
  onOpenChallenge: () => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  challenge,
  progress,
  onOpenChallenge,
}) => {
  const isCompletedToday = Boolean(
    progress.completedDailyChallengeIds?.includes(challenge.id)
  );

  return (
    <div
      onClick={onOpenChallenge}
      className={`group relative overflow-hidden rounded-xl border p-5 transition-all duration-300 cursor-pointer bg-white shadow-xs hover:shadow-md border-l-4 border-l-[#f59e0b] ${
        isCompletedToday
          ? "border-[rgba(26,26,26,0.08)] bg-emerald-50/20"
          : "border-[rgba(26,26,26,0.08)]"
      }`}
    >
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Meta & Challenge Details */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-800 font-mono">
              <Flame className="h-3.5 w-3.5 fill-current text-amber-600" />
              <span>每日代码挑战</span>
            </span>

            <span className="flex items-center gap-1 rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-mono text-neutral-600 border border-neutral-200">
              <CalendarCheck className="h-3 w-3 text-neutral-500" />
              <span>{challenge.dateStr}</span>
            </span>

            <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-medium text-blue-700 font-mono">
              {challenge.categoryLabel}
            </span>

            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-mono text-neutral-600 border border-neutral-200">
              难度：{challenge.difficulty}
            </span>

            <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-700 flex items-center gap-1 font-mono">
              <Sparkles className="h-3 w-3" />
              <span>+{challenge.xpReward} XP</span>
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#1a1a1a] group-hover:text-blue-700 transition-colors flex items-center gap-2">
              <span>{challenge.title}</span>
            </h3>
            <p className="text-xs sm:text-sm text-[rgba(26,26,26,0.65)] line-clamp-2 mt-1">
              {challenge.question}
            </p>
          </div>
        </div>

        {/* Right Side: Streak & Call to action */}
        <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[rgba(26,26,26,0.08)]">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1 rounded bg-neutral-100 px-3 py-1 font-mono text-neutral-700 border border-neutral-200 shadow-xs">
              <Flame className="h-3.5 w-3.5 text-amber-600 fill-amber-600" />
              <span>连续打卡 <strong className="text-amber-700 font-bold">{progress.currentStreakDays || 0}</strong> 天</span>
            </div>
          </div>

          <div>
            {isCompletedToday ? (
              <span className="inline-flex items-center gap-1.5 rounded bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>今日已通关 · 重温挑战</span>
              </span>
            ) : (
              <button
                type="button"
                className="btn btn-run rounded px-4 py-2 text-xs sm:text-sm font-semibold flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                <span>立即挑战 (+{challenge.xpReward} XP)</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
