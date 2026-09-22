import React from "react";
import { 
  BookOpen, 
  GitBranch, 
  ShieldAlert, 
  ShieldCheck,
  Award, 
  Sparkles, 
  Bot, 
  Flame
} from "lucide-react";
import { NavTab, UserProgress } from "../types";

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  progress: UserProgress;
  onOpenAITutor: () => void;
  onOpenCapstone: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  progress,
  onOpenAITutor,
  onOpenCapstone,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(26,26,26,0.08)] bg-[#f8f7f4]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => setActiveTab("curriculum")}
            className="flex cursor-pointer items-center gap-2 group"
          >
            <span className="font-['Cormorant_Garamond',serif] text-[1.8rem] font-semibold tracking-tight text-[#1a1a1a] select-none">
              CodeMaster
            </span>
            <span className="hidden sm:inline-block font-['Geist_Mono',monospace] text-[0.65rem] uppercase tracking-wider text-[rgba(26,26,26,0.45)] border-l border-[rgba(26,26,26,0.12)] pl-2">
              System View
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 ml-2">
            <button
              id="nav-tab-curriculum"
              onClick={() => setActiveTab("curriculum")}
              className={`text-[0.75rem] uppercase tracking-[0.05em] transition-colors py-1 flex items-center gap-1.5 ${
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
              className={`text-[0.75rem] uppercase tracking-[0.05em] transition-colors py-1 flex items-center gap-1.5 ${
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
              className={`text-[0.75rem] uppercase tracking-[0.05em] transition-colors py-1 flex items-center gap-1.5 ${
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
              className={`text-[0.75rem] uppercase tracking-[0.05em] transition-colors py-1 flex items-center gap-1.5 ${
                activeTab === "code-audit"
                  ? "text-[#2563eb] font-semibold border-b-2 border-[#2563eb]"
                  : "text-[rgba(26,26,26,0.5)] hover:text-[#1a1a1a]"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Audit System</span>
            </button>

            <button
              id="nav-tab-capstone"
              onClick={onOpenCapstone}
              className="text-[0.75rem] uppercase tracking-[0.05em] text-purple-700 hover:text-purple-900 font-medium py-1 flex items-center gap-1.5 transition-colors"
            >
              <Award className="h-3.5 w-3.5 text-purple-600" />
              <span>Final Project</span>
            </button>
          </nav>
        </div>

        {/* Right Session, XP, & AI Tutor */}
        <div className="flex items-center gap-3 sm:gap-6">
          <span className="hidden sm:inline font-['Geist_Mono',monospace] text-[0.65rem] uppercase tracking-wider text-[rgba(26,26,26,0.5)]">
            Session: {progress.currentStreakDays} Days Streak
          </span>

          <span className="hidden sm:inline font-['Geist_Mono',monospace] text-[0.65rem] uppercase tracking-wider text-[rgba(26,26,26,0.5)]">
            Progress: {progress.xp} XP
          </span>

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
          onClick={onOpenCapstone}
          className="shrink-0 px-2 py-1 text-purple-700 font-semibold"
        >
          Final Project
        </button>
      </div>
    </header>
  );
};
