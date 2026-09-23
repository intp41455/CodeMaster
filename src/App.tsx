import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { TrackSelector } from "./components/TrackSelector";
import { CodecademyWorkspace } from "./components/CodecademyWorkspace";
import { GitHubDeconstructionLab } from "./components/GitHubDeconstructionLab";
import { VibeCodingControlRoom } from "./components/VibeCodingControlRoom";
import { CodeAuditAndTestCenter } from "./components/CodeAuditAndTestCenter";
import { GameZone } from "./components/GameZone";
import { GraduationCapstoneModal } from "./components/GraduationCapstoneModal";
import { DailyChallengeModal } from "./components/DailyChallengeModal";
import { TrackEnterpriseProjectModal } from "./components/TrackEnterpriseProjectModal";
import { AITutorDrawer } from "./components/AITutorDrawer";
import { TRACKS_DATA } from "./data/coursesData";
import { getTodayChallenge } from "./data/dailyChallengesData";
import { NavTab, LearningTrackId, UserProgress, TrackInfo } from "./types";
import { Award } from "lucide-react";

const INITIAL_PROGRESS: UserProgress = {
  completedLessonIds: [],
  completedGitHubLabIds: [],
  completedVibeCases: [],
  capstonePassed: false,
  xp: 120,
  currentStreakDays: 3,
  unlockedBadges: ["小白启航"],
};

const normalizeProgress = (raw: any): UserProgress => {
  if (!raw || typeof raw !== "object") return INITIAL_PROGRESS;
  return {
    ...INITIAL_PROGRESS,
    ...raw,
    completedLessonIds: Array.isArray(raw.completedLessonIds) ? raw.completedLessonIds : [],
    completedGitHubLabIds: Array.isArray(raw.completedGitHubLabIds) ? raw.completedGitHubLabIds : [],
    completedVibeCases: Array.isArray(raw.completedVibeCases) ? raw.completedVibeCases : [],
    completedDailyChallengeIds: Array.isArray(raw.completedDailyChallengeIds) ? raw.completedDailyChallengeIds : [],
    unlockedBadges: Array.isArray(raw.unlockedBadges) ? raw.unlockedBadges : INITIAL_PROGRESS.unlockedBadges,
    xp: typeof raw.xp === "number" ? raw.xp : INITIAL_PROGRESS.xp,
    currentStreakDays: typeof raw.currentStreakDays === "number" ? raw.currentStreakDays : INITIAL_PROGRESS.currentStreakDays,
    capstonePassed: Boolean(raw.capstonePassed),
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("curriculum");
  const [activeTrackId, setActiveTrackId] = useState<LearningTrackId>("track-zero");
  const [activeLessonId, setActiveLessonId] = useState<string>("zero-001");
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState<boolean>(false);
  const [showAITutor, setShowAITutor] = useState<boolean>(false);
  const [showCapstoneModal, setShowCapstoneModal] = useState<boolean>(false);
  const [showDailyChallengeModal, setShowDailyChallengeModal] = useState<boolean>(false);
  const [selectedEnterpriseTrack, setSelectedEnterpriseTrack] = useState<TrackInfo | null>(null);

  const todayChallenge = getTodayChallenge();

  // Persistent progress via localStorage
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem("codemaster_progress");
      if (saved) {
        return normalizeProgress(JSON.parse(saved));
      }
    } catch (e) {
      // fallback
    }
    return INITIAL_PROGRESS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("codemaster_progress", JSON.stringify(progress));
    } catch (e) {
      // ignore
    }
  }, [progress]);

  const currentTrack = TRACKS_DATA.find((t) => t.id === activeTrackId) || TRACKS_DATA[0];
  const currentLesson =
    currentTrack.lessons.find((l) => l.id === activeLessonId) || currentTrack.lessons[0];

  const currentLessonIndex = currentTrack.lessons.findIndex((l) => l.id === currentLesson.id);
  const hasPrevLesson = currentLessonIndex > 0;
  const hasNextLesson = currentLessonIndex < currentTrack.lessons.length - 1;

  // Next / Prev Handlers
  const handlePrevLesson = () => {
    if (hasPrevLesson) {
      setActiveLessonId(currentTrack.lessons[currentLessonIndex - 1].id);
    }
  };

  const handleNextLesson = () => {
    if (hasNextLesson) {
      setActiveLessonId(currentTrack.lessons[currentLessonIndex + 1].id);
    }
  };

  // Complete a lesson
  const handleLessonComplete = (lessonId: string) => {
    if (!progress.completedLessonIds.includes(lessonId)) {
      setProgress((prev) => ({
        ...prev,
        completedLessonIds: [...prev.completedLessonIds, lessonId],
        xp: prev.xp + 50,
      }));
    }
  };

  // Complete a GitHub Lab
  const handleCompleteGitHubLab = (projectId: string) => {
    if (!progress.completedGitHubLabIds.includes(projectId)) {
      setProgress((prev) => ({
        ...prev,
        completedGitHubLabIds: [...prev.completedGitHubLabIds, projectId],
        xp: prev.xp + 150,
        unlockedBadges: Array.from(new Set([...prev.unlockedBadges, "开源渗透官"])),
      }));
    }
  };

  // Complete a Vibe Coding Case
  const handleCompleteVibeCase = (caseId: string) => {
    if (!progress.completedVibeCases.includes(caseId)) {
      setProgress((prev) => ({
        ...prev,
        completedVibeCases: [...prev.completedVibeCases, caseId],
        xp: prev.xp + 100,
        unlockedBadges: Array.from(new Set([...prev.unlockedBadges, "AI驯服大师"])),
      }));
    }
  };

  // Pass Capstone Graduation
  const handleGraduationPass = () => {
    setProgress((prev) => ({
      ...prev,
      capstonePassed: true,
      xp: prev.xp + 300,
      unlockedBadges: Array.from(new Set([...prev.unlockedBadges, "全栈与AI时代架构师"])),
    }));
  };

  // Complete Daily Challenge
  const handleCompleteDailyChallenge = (challengeId: string, xpReward: number) => {
    setProgress((prev) => {
      const alreadyCompleted = prev.completedDailyChallengeIds?.includes(challengeId);
      if (alreadyCompleted) return prev;
      return {
        ...prev,
        completedDailyChallengeIds: [...(prev.completedDailyChallengeIds || []), challengeId],
        xp: prev.xp + xpReward,
        currentStreakDays: (prev.currentStreakDays || 0) + 1,
        lastDailyChallengeDate: new Date().toISOString().split("T")[0],
        unlockedBadges: Array.from(new Set([...prev.unlockedBadges, "每日自律极客"])),
      };
    });
  };

  // Pass Enterprise Track Capstone Project
  const handleEnterpriseProjectPassed = (trackId: string) => {
    setProgress((prev) => {
      const alreadyPassed = prev.completedTrackProjectIds?.includes(trackId);
      if (alreadyPassed) return prev;
      const t = TRACKS_DATA.find((x) => x.id === trackId);
      const badgeTitle = t ? `${t.title.slice(0, 10)} 落地架构师` : "企业系统落地官";
      return {
        ...prev,
        completedTrackProjectIds: [...(prev.completedTrackProjectIds || []), trackId],
        xp: prev.xp + 500,
        unlockedBadges: Array.from(new Set([...prev.unlockedBadges, badgeTitle])),
      };
    });
  };

  // 游戏化训练区获得经验值
  const handleEarnXpFromGame = (xp: number) => {
    if (!Number.isFinite(xp) || xp <= 0) return;
    setProgress((prev) => ({ ...prev, xp: prev.xp + Math.round(xp) }));
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a1a] flex flex-col font-['Geist',sans-serif]">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== "curriculum") {
            setIsWorkspaceOpen(false);
          }
        }}
        progress={progress}
        onOpenAITutor={() => setShowAITutor(true)}
        onOpenCapstone={() => setShowCapstoneModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full">
        {/* Tab 1: Curriculum Tracks */}
        {activeTab === "curriculum" && (
          <div>
            {!isWorkspaceOpen ? (
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <TrackSelector
                  tracks={TRACKS_DATA}
                  currentTrackId={activeTrackId}
                  onSelectTrack={(tId) => {
                    setActiveTrackId(tId);
                    const t = TRACKS_DATA.find((x) => x.id === tId);
                    if (t && t.lessons.length > 0) {
                      setActiveLessonId(t.lessons[0].id);
                    }
                    setIsWorkspaceOpen(true);
                  }}
                  onSelectLesson={(tId, lId) => {
                    setActiveTrackId(tId);
                    setActiveLessonId(lId);
                    setIsWorkspaceOpen(true);
                  }}
                  progress={progress}
                  onJumpToGitHubLab={() => setActiveTab("github-lab")}
                  onJumpToVibeCoding={() => setActiveTab("vibe-coding")}
                  todayChallenge={todayChallenge}
                  onOpenDailyChallenge={() => setShowDailyChallengeModal(true)}
                  onOpenEnterpriseProject={(t) => setSelectedEnterpriseTrack(t)}
                />
              </div>
            ) : (
              <div>
                {/* Secondary navigation bar to return to tracks */}
                <div className="bg-[#f8f7f4] border-b border-[rgba(26,26,26,0.08)] px-4 py-2 flex items-center justify-between text-xs font-['Geist_Mono',monospace]">
                  <button
                    onClick={() => setIsWorkspaceOpen(false)}
                    className="flex items-center gap-1.5 text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a] font-medium transition-colors"
                  >
                    <span>← 返回全栈技术体系路线图</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[rgba(26,26,26,0.45)] text-[0.7rem] uppercase hidden sm:inline">
                      当前赛道：{currentTrack.title}
                    </span>
                    {currentTrack.enterpriseProject && (
                      <button
                        onClick={() => setSelectedEnterpriseTrack(currentTrack)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-700 transition-colors"
                      >
                        <Award className="h-3.5 w-3.5 text-blue-600" />
                        <span className="hidden sm:inline">终极目标验收：</span>
                        <span>{currentTrack.enterpriseProject.projectName}</span>
                      </button>
                    )}
                  </div>
                </div>

                <CodecademyWorkspace
                  lesson={currentLesson}
                  track={currentTrack}
                  hasPrevLesson={hasPrevLesson}
                  hasNextLesson={hasNextLesson}
                  onPrevLesson={handlePrevLesson}
                  onNextLesson={handleNextLesson}
                  onLessonComplete={handleLessonComplete}
                  isCompleted={Boolean(progress?.completedLessonIds?.includes(currentLesson.id))}
                  onAskAIAboutCode={(code, lang, q) => {
                    setShowAITutor(true);
                  }}
                  onOpenEnterpriseProject={() => setSelectedEnterpriseTrack(currentTrack)}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: GitHub 陌生项目拆解舱 */}
        {activeTab === "github-lab" && (
          <GitHubDeconstructionLab
            onCompleteProject={handleCompleteGitHubLab}
            completedProjectIds={progress.completedGitHubLabIds || []}
          />
        )}

        {/* Tab 3: Vibe Coding 掌控力实训 */}
        {activeTab === "vibe-coding" && (
          <VibeCodingControlRoom
            onCompleteCase={handleCompleteVibeCase}
            completedCaseIds={progress.completedVibeCases || []}
          />
        )}

        {/* Tab 4: 代码审核体系与自动化测试中心 */}
        {activeTab === "code-audit" && (
          <CodeAuditAndTestCenter
            onBackToCurriculum={() => setActiveTab("curriculum")}
          />
        )}

        {/* Tab 5: 游戏化训练区 */}
        {activeTab === "game-arena" && (
          <GameZone onEarnXp={handleEarnXpFromGame} />
        )}
      </main>

      {/* Daily Challenge Modal */}
      <DailyChallengeModal
        challenge={todayChallenge}
        isOpen={showDailyChallengeModal}
        onClose={() => setShowDailyChallengeModal(false)}
        onCompleteChallenge={handleCompleteDailyChallenge}
        isCompleted={Boolean(progress.completedDailyChallengeIds?.includes(todayChallenge.id))}
        progress={progress}
      />

      {/* Graduation Capstone Modal */}
      <GraduationCapstoneModal
        isOpen={showCapstoneModal}
        onClose={() => setShowCapstoneModal(false)}
        onGraduationPass={handleGraduationPass}
        isGraduated={progress.capstonePassed}
      />

      {/* Track Enterprise Project Modal */}
      {selectedEnterpriseTrack && (
        <TrackEnterpriseProjectModal
          track={selectedEnterpriseTrack}
          isOpen={Boolean(selectedEnterpriseTrack)}
          onClose={() => setSelectedEnterpriseTrack(null)}
          onAcceptancePassed={handleEnterpriseProjectPassed}
          isAlreadyPassed={Boolean(
            progress.completedTrackProjectIds?.includes(selectedEnterpriseTrack.id)
          )}
        />
      )}

      {/* Slide-over AI Tutor Drawer */}
      <AITutorDrawer
        isOpen={showAITutor}
        onClose={() => setShowAITutor(false)}
        currentTrackTitle={currentTrack.title}
        currentLessonTitle={currentLesson.title}
      />
    </div>
  );
}
