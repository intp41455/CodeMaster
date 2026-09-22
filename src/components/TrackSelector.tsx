import React, { useState } from "react";
import { 
  Lightbulb,
  FileCode, 
  Coffee, 
  Network, 
  Database, 
  Zap, 
  Layers, 
  Cpu, 
  Bot, 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  ArrowRight,
  Flame,
  Terminal,
  Code2,
  Award
} from "lucide-react";
import { TrackInfo, LearningTrackId, UserProgress, DailyChallenge } from "../types";
import { DailyChallengeCard } from "./DailyChallengeCard";

interface TrackSelectorProps {
  tracks: TrackInfo[];
  currentTrackId: LearningTrackId;
  onSelectTrack: (trackId: LearningTrackId) => void;
  onSelectLesson: (trackId: LearningTrackId, lessonId: string) => void;
  progress: UserProgress;
  onJumpToGitHubLab: () => void;
  onJumpToVibeCoding: () => void;
  todayChallenge: DailyChallenge;
  onOpenDailyChallenge: () => void;
  onOpenEnterpriseProject?: (track: TrackInfo) => void;
}

const ICON_MAP: Record<string, any> = {
  Lightbulb,
  FileCode,
  Coffee,
  Network,
  Database,
  Zap,
  Layers,
  Cpu,
  Bot,
  Users,
  Terminal,
  Code2
};

export const TrackSelector: React.FC<TrackSelectorProps> = ({
  tracks,
  currentTrackId,
  onSelectTrack,
  onSelectLesson,
  progress,
  onJumpToGitHubLab,
  onJumpToVibeCoding,
  todayChallenge,
  onOpenDailyChallenge,
  onOpenEnterpriseProject,
}) => {
  const [filter, setFilter] = useState<"all" | "zero" | "foundation" | "framework" | "agent">("all");

  const filteredTracks = tracks.filter((track) => {
    if (filter === "zero") return track.id === "track-zero";
    if (filter === "foundation") return ["track-python", "track-java", "track-linux", "track-typescript", "track-ds", "track-sql"].includes(track.id);
    if (filter === "framework") return ["track-fastapi", "track-spring-boot"].includes(track.id);
    if (filter === "agent") return ["track-spring-ai", "track-agent", "track-multi-agent", "track-agent-systems"].includes(track.id);
    return true;
  });

  return (
    <div className="space-y-8 font-['Geist',sans-serif]">
      {/* Hero Banner with System View Architecture & Progress Dashboard */}
      <div className="relative overflow-hidden rounded-xl border border-[rgba(26,26,26,0.08)] bg-white p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Mission & Core Highlights */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded px-2.5 py-1 text-xs font-mono font-medium text-blue-700 bg-blue-50 border border-blue-200">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>零基础小白专享 · 现代全栈与AI时代架构师成长阶梯</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#1a1a1a] leading-[1.2]">
              学穿底层代码与技术架构，
              <span className="text-[#2563eb] block sm:inline">
                彻底驾驭开源与 AI 时代
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[rgba(26,26,26,0.7)] leading-relaxed">
              在这里，我们用<strong>生活化比喻消除一切枯燥术语</strong>，通过
              <strong> 交互式系统实战</strong>，带你一步步精通 Python、Java、数据结构、SQL、FastAPI、Spring Boot、Spring AI 到多智能体。无论代码是自己写的还是 AI（Vibe Coding）生成的，你都能<strong>看得懂、跑得起、理得清、改得动</strong>！
            </p>

            {/* Quick Action Highlights */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onJumpToGitHubLab}
                className="btn btn-run rounded px-4 py-2 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs"
              >
                <span>🚀 体验 GitHub 陌生项目 5 步穿透法</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={onJumpToVibeCoding}
                className="btn btn-ghost rounded px-4 py-2 text-xs sm:text-sm font-semibold flex items-center gap-2"
              >
                <span>🛡️ 练就 Vibe Coding 避坑掌控力</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Column: System Blueprint & Live Learner Stats */}
          <div className="lg:col-span-5 bg-[#f8f7f4] rounded-xl border border-[rgba(26,26,26,0.08)] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] pb-2.5">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-semibold text-[#1a1a1a] font-mono uppercase tracking-wider">
                  System Architecture Flow
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                Live State
              </span>
            </div>

            {/* 4-Step Technical Spectrum Pipeline */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded border border-[rgba(26,26,26,0.06)] shadow-2xs">
                <span className="text-[10px] font-mono text-[rgba(26,26,26,0.45)] uppercase block">
                  01. 硬件与基石
                </span>
                <span className="font-medium text-[#1a1a1a] text-[11px] mt-0.5 block">
                  CPU / 内存 / Linux
                </span>
              </div>
              <div className="bg-white p-2.5 rounded border border-[rgba(26,26,26,0.06)] shadow-2xs">
                <span className="text-[10px] font-mono text-[rgba(26,26,26,0.45)] uppercase block">
                  02. 语言与数据
                </span>
                <span className="font-medium text-[#1a1a1a] text-[11px] mt-0.5 block">
                  Python / Java / SQL
                </span>
              </div>
              <div className="bg-white p-2.5 rounded border border-[rgba(26,26,26,0.06)] shadow-2xs">
                <span className="text-[10px] font-mono text-[rgba(26,26,26,0.45)] uppercase block">
                  03. 微服务工程
                </span>
                <span className="font-medium text-[#1a1a1a] text-[11px] mt-0.5 block">
                  FastAPI / Spring Boot
                </span>
              </div>
              <div className="bg-white p-2.5 rounded border border-[rgba(26,26,26,0.06)] shadow-2xs">
                <span className="text-[10px] font-mono text-[rgba(26,26,26,0.45)] uppercase block">
                  04. 认知智能体
                </span>
                <span className="font-medium text-blue-700 text-[11px] mt-0.5 block font-semibold">
                  Spring AI / Multi-Agent
                </span>
              </div>
            </div>

            {/* Live Progress Stats Strip */}
            <div className="pt-2 border-t border-[rgba(26,26,26,0.08)] flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-mono text-[rgba(26,26,26,0.5)] block">已通关实战</span>
                <span className="font-mono font-bold text-sm text-[#1a1a1a]">
                  {progress.completedLessonIds.length} <span className="text-[10px] font-normal text-neutral-400">/ 51 关</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[rgba(26,26,26,0.5)] block">总经验值</span>
                <span className="font-mono font-bold text-sm text-blue-700">
                  {progress.xp} <span className="text-[10px] font-normal text-neutral-400">XP</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[rgba(26,26,26,0.5)] block">连续打卡</span>
                <span className="font-mono font-bold text-sm text-amber-600">
                  {progress.currentStreakDays || 0} <span className="text-[10px] font-normal text-neutral-400">天</span>
                </span>
              </div>
            </div>

            {/* Quick launch for zero-base track */}
            <button
              onClick={() => onSelectLesson("track-zero", "zero-001")}
              className="w-full py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-xs font-semibold text-blue-800 flex items-center justify-between transition-colors group/launch"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span>🍼 推荐起点：</span>
                <span className="truncate">第 1 课《电脑的身体解剖》</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 group-hover/launch:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Daily Code Challenge Highlight */}
      <DailyChallengeCard
        challenge={todayChallenge}
        progress={progress}
        onOpenChallenge={onOpenDailyChallenge}
      />

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[rgba(26,26,26,0.08)] pb-4 gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h2 className="text-base font-semibold text-[#1a1a1a]">{tracks.length} 大进阶技术体系路线</h2>
        </div>

        <div className="flex items-center gap-1 rounded bg-neutral-100 p-1 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setFilter("zero")}
            className={`rounded px-3 py-1.5 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filter === "zero" ? "bg-amber-500 text-white font-semibold shadow-xs" : "text-amber-800 hover:bg-amber-100/60"
            }`}
          >
            <span>🍼 零基础启蒙 (1)</span>
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`rounded px-3 py-1.5 transition-all whitespace-nowrap ${
              filter === "all" ? "bg-white text-[#1a1a1a] font-semibold shadow-xs" : "text-neutral-600 hover:text-[#1a1a1a]"
            }`}
          >
            全部 ({tracks.length})
          </button>
          <button
            onClick={() => setFilter("foundation")}
            className={`rounded px-3 py-1.5 transition-all whitespace-nowrap ${
              filter === "foundation" ? "bg-white text-[#1a1a1a] font-semibold shadow-xs" : "text-neutral-600 hover:text-[#1a1a1a]"
            }`}
          >
            工程基石 (6)
          </button>
          <button
            onClick={() => setFilter("framework")}
            className={`rounded px-3 py-1.5 transition-all whitespace-nowrap ${
              filter === "framework" ? "bg-white text-[#1a1a1a] font-semibold shadow-xs" : "text-neutral-600 hover:text-[#1a1a1a]"
            }`}
          >
            微服务框架 (2)
          </button>
          <button
            onClick={() => setFilter("agent")}
            className={`rounded px-3 py-1.5 transition-all whitespace-nowrap ${
              filter === "agent" ? "bg-white text-[#1a1a1a] font-semibold shadow-xs" : "text-neutral-600 hover:text-[#1a1a1a]"
            }`}
          >
            AI与智能体 (4)
          </button>
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTracks.map((track) => {
          const IconComponent = ICON_MAP[track.icon] || FileCode;
          const isSelected = track.id === currentTrackId;
          const isZeroTrack = track.id === "track-zero";

          // Calculate completed lessons in this track
          const completedLessonIds = progress?.completedLessonIds || [];
          const completedCount = track.lessons.filter((l) =>
            completedLessonIds.includes(l.id)
          ).length;
          const totalLessons = track.lessons.length;
          const progressPercent = Math.round((completedCount / (totalLessons || 1)) * 100);

          return (
            <div
              key={track.id}
              onClick={() => onSelectTrack(track.id)}
              className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all cursor-pointer bg-white shadow-xs hover:shadow-md ${
                isZeroTrack
                  ? isSelected
                    ? "border-amber-500 border-l-[4px] border-l-amber-500 ring-2 ring-amber-200"
                    : "border-[rgba(26,26,26,0.12)] border-l-[4px] border-l-amber-500 hover:border-amber-500"
                  : isSelected
                    ? "border-[#2563eb] ring-2 ring-blue-100"
                    : "border-[rgba(26,26,26,0.08)] hover:border-[rgba(26,26,26,0.2)]"
              }`}
            >
              <div className="space-y-3">
                {/* Track Icon & Badges */}
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded border transition-transform ${
                    isZeroTrack ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-blue-50 border-blue-200 text-blue-700"
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isZeroTrack && (
                      <span className="rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        🍼 零基础必选
                      </span>
                    )}
                    {progressPercent === 100 && (
                      <span className="flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        已通关
                      </span>
                    )}
                    <span className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-mono text-neutral-600 border border-neutral-200">
                      {totalLessons} 关实战
                    </span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="font-semibold text-base text-[#1a1a1a] group-hover:text-blue-700 transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-xs font-medium mt-0.5 text-blue-700">
                    {track.tagline}
                  </p>
                </div>

                <p className="text-xs text-[rgba(26,26,26,0.65)] line-clamp-2 leading-relaxed">
                  {track.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {track.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-mono text-neutral-600 border border-neutral-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 🎯 Enterprise Project Capstone Banner */}
                {track.enterpriseProject && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEnterpriseProject?.(track);
                    }}
                    className="mt-2 rounded bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 p-2.5 flex items-center justify-between text-xs transition-all group/ep cursor-pointer"
                  >
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <div className="p-1 rounded bg-blue-100 text-blue-700 shrink-0">
                        <Award className="h-3.5 w-3.5" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-[10px] text-blue-700 font-semibold uppercase tracking-wider flex items-center gap-1">
                          <span>终极目标验收</span>
                          {progress.completedTrackProjectIds?.includes(track.id) && (
                            <span className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                              已达标
                            </span>
                          )}
                        </div>
                        <div className="text-[#1a1a1a] font-medium text-[11px] truncate">
                          {track.enterpriseProject.projectName}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-700 flex items-center gap-0.5 group-hover/ep:translate-x-0.5 transition-transform shrink-0 whitespace-nowrap">
                      验收落地
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Bar & Actions */}
              <div className="pt-4 border-t border-[rgba(26,26,26,0.08)] mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-[rgba(26,26,26,0.6)]">
                  <span>学习进度</span>
                  <span className="font-mono text-[#1a1a1a] font-semibold">{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full rounded bg-neutral-200 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Lesson Quick Entry */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-[rgba(26,26,26,0.5)] truncate max-w-[170px]">
                    第一关：{track.lessons[0]?.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLesson(track.id, track.lessons[0].id);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>进入实践</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
