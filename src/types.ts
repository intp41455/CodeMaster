export type LearningTrackId = 
  | "track-zero"
  | "track-python"
  | "track-java"
  | "track-linux"
  | "track-typescript"
  | "track-ds"
  | "track-sql"
  | "track-fastapi"
  | "track-spring-boot"
  | "track-spring-ai"
  | "track-agent"
  | "track-multi-agent"
  | "track-agent-systems";

export type NavTab = 
  | "curriculum" 
  | "github-lab" 
  | "vibe-coding" 
  | "code-audit"
  | "game-arena"
  | "capstone";

export interface Checkpoint {
  id: string;
  title: string;
  description: string;
  hint?: string;
  testFunction: (code: string, output: string) => { passed: boolean; message: string };
}

export interface Lesson {
  id: string;
  title: string;
  trackId: LearningTrackId;
  estimatedMinutes: number;
  level: "零基础" | "进阶" | "实战";
  mentalModel: {
    title: string;
    metaphor: string; // 生活比喻
    keyIntuition: string; // 核心直觉
  };
  explanationMarkdown: string;
  language: "python" | "java" | "sql" | "json" | "bash" | "shell" | "typescript";
  starterCode: string;
  solutionCode: string;
  checkpoints: Checkpoint[];
  githubAnalogy?: string; // 在真实GitHub开源项目中的对应物
}

export interface TrackEnterpriseProject {
  projectName: string;
  projectTagline: string;
  targetScenario: string;
  zeroBasePromise: string;
  architectureLayers: {
    name: string;
    role: string;
    details: string;
  }[];
  acceptanceCriteria: {
    id: string;
    title: string;
    description: string;
    standard: string;
  }[];
  deliverableFiles: {
    fileName: string;
    language: string;
    description: string;
    productionCode: string;
  }[];
  verificationSteps: {
    stepName: string;
    commandOrAction: string;
    expectedOutcome: string;
  }[];
}

export interface TrackInfo {
  id: LearningTrackId;
  title: string;
  tagline: string;
  description: string;
  icon: string; // lucide icon name
  badgeColor: string;
  tags: string[];
  lessons: Lesson[];
  capstoneChallenge: string;
  enterpriseProject: TrackEnterpriseProject;
}

// GitHub 陌生项目拆解模型
export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  content?: string;
  language?: string;
  roleDescription?: string;
  children?: FileNode[];
}

export interface TraceStep {
  step: number;
  location: string;
  action: string;
  detail: string;
  incomingData: string;
  outgoingData: string;
}

export interface GitHubProjectLab {
  id: string;
  title: string;
  repoName: string;
  stars: string;
  techStack: string[];
  summary: string;
  readme: string;
  architectureBlueprint: {
    layers: {
      name: string;
      role: string;
      components: string[];
      color: string;
    }[];
    dataFlow: string;
  };
  fileTree: FileNode;
  requestTrace: {
    title: string;
    description: string;
    steps: TraceStep[];
  };
  keySourceWalkthrough: {
    filePath: string;
    title: string;
    code: string;
    breakdowns: {
      lineRange: string;
      codeSnippet: string;
      plainChineseExplanation: string;
      architectureSignificance: string;
    }[];
  };
  hotfixChallenge: {
    id: string;
    title: string;
    scenario: string;
    targetFile: string;
    buggyCode: string;
    expectedFixDescription: string;
    testValidation: (code: string) => { passed: boolean; feedback: string };
    hint: string;
  };
}

// Vibe Coding 审查实训模型
export interface VibeCodingCase {
  id: string;
  title: string;
  aiPromptUsed: string;
  generatedCode: string;
  language: string;
  vibeIllusion: string; // 表面上为什么看起来是对的
  hiddenDisasters: {
    type: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM";
    lineLocation: string;
    mechanism: string; // 底层机制为什么会炸
    consequence: string; // 生产事故后果
  }[];
  verificationStrategy: {
    step1_mentalCheck: string;
    step2_bugHunt: string;
    step3_counterExampleTest: string;
    step4_cleanRefactor: string;
  };
  starterFixCode: string;
  correctRefactoredCode: string;
  testCheck: (userCode: string) => { passed: boolean; message: string; diffDetails?: string };
}

// 每日代码挑战模型
export interface DailyChallenge {
  id: string;
  dateStr: string;
  title: string;
  category: "micro_algorithm" | "ai_code_reading";
  categoryLabel: string;
  difficulty: "简单" | "中等" | "挑战";
  xpReward: number;
  question: string;
  contextCode?: string;
  language: "python" | "java" | "sql" | "bash" | "shell" | "typescript";
  type: "code_fix" | "multiple_choice";
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  starterCode?: string;
  solutionCode?: string;
  validator?: (code: string) => { passed: boolean; feedback: string };
  hint: string;
  takeaway: string;
}

// 用户学习进度
export interface UserProgress {
  completedLessonIds: string[];
  completedGitHubLabIds: string[];
  completedVibeCases: string[];
  completedDailyChallengeIds?: string[];
  completedTrackProjectIds?: string[];
  lastDailyChallengeDate?: string;
  capstonePassed: boolean;
  xp: number;
  currentStreakDays: number;
  unlockedBadges: string[];
}
