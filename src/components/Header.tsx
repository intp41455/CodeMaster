import React, { useState, useEffect } from "react";
import {
  BookOpen,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  Award,
  Sparkles,
  Bot,
  Flame,
  Gamepad2,
  KeyRound,
  UserRound,
  ExternalLink,
  Sun,
  Moon
} from "lucide-react";
import { NavTab, UserProgress } from "../types";

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  progress: UserProgress;
  onOpenAITutor: () => void;
  onOpenCapstone: () => void;
  onOpenAISettings?: () => void;
  authUser?: { id: string; email?: string } | null;
  onOpenAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  progress,
  onOpenAITutor,
  onOpenCapstone,
  onOpenAISettings,
  authUser,
  onOpenAuth,
}) => {
  // ---- Day / Night mode toggle (self-contained: manages <html data-theme> + localStorage) ----
  const [themeMode, setThemeMode] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("gode-theme");
      if (saved === "light" || saved === "dark") return saved;
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
      return "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("gode-theme", next);
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  };

  const themeButton = (extraClass = "") => (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={themeMode === "light" ? "切换到夜间模式" : "切换到日间模式"}
      title={themeMode === "light" ? "切换到夜间模式" : "切换到日间模式"}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(26,26,26,0.15)] bg-white text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a] hover:bg-neutral-100 transition-all active:scale-95 ${extraClass}`}
    >
      {themeMode === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
    </button>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(26,26,26,0.08)] bg-[#f8f7f4]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div className="flex min-w-0 items-center gap-4">
          <div 
            onClick={() => setActiveTab("curriculum")}
            className="flex shrink-0 cursor-pointer items-center gap-2 group"
          >
            <span className="font-['Cormorant_Garamond',serif] text-[1.5rem] font-semibold tracking-tight text-[#1a1a1a] select-none">
              CodeMaster
            </span>
            <span className="hidden xl:inline-block font-['Geist_Mono',monospace] text-[0.65rem] uppercase tracking-wider text-[rgba(26,26,26,0.45)] border-l border-[rgba(26,26,26,0.12)] pl-2">
              System View
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden min-w-0 md:flex items-center gap-3 lg:gap-4 ml-1">
            <button
              id="nav-tab-curriculum"
              onClick={() => setActiveTab("curriculum")}
              className={`text-[0.75rem] uppercase tracking-[0.05em] transition-colors py-1 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "curriculum"
                  ? "text-[#2563eb] font-semibold border-b-2 border-[#2563eb]"
                  : "text-[rgba(26,26,26,0.5)] hover:text-[#1a1a1a]"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Curriculum</span>
            </button>

            <button
              id="nav-tab-github-lab"
              onClick={() => setActiveTab("github-lab")}
              className={`text-[0.75rem] uppercase tracking-[0.05em] transition-colors py-1 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "github-lab"
                  ? "text-[#2563eb] font-semibold border-b-2 border-[#2563eb]"
                  : "text-[rgba(26,26,26,0.5)] hover:text-[#1a1a1a]"
              }`}
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>GitHub Labs</span>
            </button>

            <button
              id="nav-tab-vibe-coding"
              onClick={() => setActiveTab("vibe-coding")}
              className={`text-[0.75rem] uppercase tracking-[0.05em] transition-colors py-1 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "vibe-coding"
                  ? "text-[#2563eb] font-semibold border-b-2 border-[#2563eb]"
                  : "text-[rgba(26,26,26,0.5)] hover:text-[#1a1a1a]"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Vibe Control</span>
            </button>

            <button
              id="nav-tab-code-audit"
              onClick={() => setActiveTab("code-audit")}
              className={`text-[0.75rem] uppercase tracking-[0.05em] transition-colors py-1 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "code-audit"
                  ? "text-[#2563eb] font-semibold border-b-2 border-[#2563eb]"
                  : "text-[rgba(26,26,26,0.5)] hover:text-[#1a1a1a]"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Audit System</span>
            </button>

            <button
              id="nav-tab-game-arena"
              onClick={() => setActiveTab("game-arena")}
              className={`text-[0.75rem] uppercase tracking-[0.05em] transition-colors py-1 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "game-arena"
                  ? "text-[#2563eb] font-semibold border-b-2 border-[#2563eb]"
                  : "text-[rgba(26,26,26,0.5)] hover:text-[#1a1a1a]"
              }`}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>Game Zone</span>
            </button>

            <button
              id="nav-tab-capstone"
              onClick={onOpenCapstone}
              className="text-[0.75rem] uppercase tracking-[0.05em] text-purple-700 hover:text-purple-900 font-medium py-1 flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <Award className="h-3.5 w-3.5 text-purple-600" />
              <span>Final Project</span>
            </button>

            <a
              href="https://codepath-academy.pages.dev/"
              target="_blank"
              rel="noreferrer"
              title="从零开始学编程：循码 Codepath 免费入门练习场（浏览器真跑代码）"
              className="text-[0.75rem] uppercase tracking-[0.05em] text-[rgba(26,26,26,0.45)] hover:text-[#2563eb] py-1 flex items-center gap-1.5 whitespace-nowrap transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>入门 · 循码</span>
            </a>
          </nav>
        </div>

        {/* Right Session, XP, & AI Tutor */}
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-4 pl-3">
          <span
            title={`连续学习 ${progress.currentStreakDays} 天`}
            className="hidden whitespace-nowrap font-['Geist_Mono',monospace] text-[0.65rem] uppercase tracking-wider text-[rgba(26,26,26,0.5)] lg:inline"
          >
            {progress.currentStreakDays}D STREAK
          </span>

          <span
            title={`累计经验值 ${progress.xp}`}
            className="hidden whitespace-nowrap font-['Geist_Mono',monospace] text-[0.65rem] uppercase tracking-wider text-[rgba(26,26,26,0.5)] sm:inline"
          >
            {progress.xp} XP
          </span>

          <button
            id="open-auth-btn"
            onClick={onOpenAuth}
            title={authUser ? `账号：${authUser.email || ""}（点击管理）` : "登录 / 注册，开启云端进度同步"}
            className="inline-flex h-8 max-w-[130px] items-center gap-1.5 rounded-full border border-[rgba(26,26,26,0.15)] bg-white px-3 text-[0.65rem] font-['Geist_Mono',monospace] uppercase tracking-wider text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a] hover:bg-neutral-100 transition-all active:scale-95"
          >
            <UserRound className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{authUser ? (authUser.email || "账号") : "登录"}</span>
          </button>

          <button
            id="open-ai-settings-btn"
            onClick={onOpenAISettings}
            title="AI 连接设置（自带 Key）"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(26,26,26,0.15)] bg-white text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a] hover:bg-neutral-100 transition-all active:scale-95"
          >
            <KeyRound className="h-3.5 w-3.5" />
          </button>

          {themeButton()}

          <button
            id="open-ai-tutor-btn"
            onClick={onOpenAITutor}
            className="btn btn-run rounded-[20px] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>AI Tutor</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Sub-row */}
      <div className="flex md:hidden items-center justify-between border-t border-[rgba(26,26,26,0.06)] px-4 py-2 bg-[#f8f7f4] overflow-x-auto text-[0.7rem] uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("curriculum")}
          className={`shrink-0 px-2 py-1 ${activeTab === "curriculum" ? "text-[#2563eb] font-semibold" : "text-[rgba(26,26,26,0.5)]"}`}
        >
          Curriculum
        </button>
        <button
          onClick={() => setActiveTab("github-lab")}
          className={`shrink-0 px-2 py-1 ${activeTab === "github-lab" ? "text-[#2563eb] font-semibold" : "text-[rgba(26,26,26,0.5)]"}`}
        >
          GitHub Labs
        </button>
        <button
          onClick={() => setActiveTab("vibe-coding")}
          className={`shrink-0 px-2 py-1 ${activeTab === "vibe-coding" ? "text-[#2563eb] font-semibold" : "text-[rgba(26,26,26,0.5)]"}`}
        >
          Vibe Control
        </button>
        <button
          onClick={() => setActiveTab("code-audit")}
          className={`shrink-0 px-2 py-1 ${activeTab === "code-audit" ? "text-[#2563eb] font-semibold" : "text-[rgba(26,26,26,0.5)]"}`}
        >
          Audit System
        </button>
        <button
          onClick={() => setActiveTab("game-arena")}
          className={`shrink-0 px-2 py-1 ${activeTab === "game-arena" ? "text-[#2563eb] font-semibold" : "text-[rgba(26,26,26,0.5)]"}`}
        >
          Game Zone
        </button>
        <button
          onClick={onOpenCapstone}
          className="shrink-0 px-2 py-1 text-purple-700 font-semibold"
        >
          Final Project
        </button>
        <a
          href="https://codepath-academy.pages.dev/"
          target="_blank"
          rel="noreferrer"
          title="从零开始学编程：循码 Codepath 免费入门练习场"
          className="shrink-0 px-2 py-1 text-[rgba(26,26,26,0.5)] hover:text-[#2563eb] flex items-center gap-1 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          入门 · 循码
        </a>
        {themeButton("h-7 w-7")}
      </div>
    </header>
  );
};
