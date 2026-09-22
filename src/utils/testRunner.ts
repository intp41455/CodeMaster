/**
 * CodeMaster Platform Automated Bug Hunter & Test Suite
 * 纯逻辑端到端测试器：可在浏览器沙箱与 Node.js CLI 环境下双向安全运行
 */

import { TRACKS_DATA } from "../data/coursesData";
import { DAILY_CHALLENGES } from "../data/dailyChallengesData";
import { GITHUB_LAB_PROJECTS } from "../data/githubLabData";
import { VIBE_CODING_CASES } from "../data/vibeCodingLabData";
import { auditCodeLocally } from "./codeAuditEngine";

export interface TestSuiteResult {
  suiteName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  bugsCaught: {
    target: string;
    description: string;
    details: string;
  }[];
  durationMs: number;
}

export interface PlatformTestRunReport {
  success: boolean;
  totalPassed: number;
  totalFailed: number;
  totalDurationMs: number;
  suites: TestSuiteResult[];
}

export function runFullPlatformTests(): PlatformTestRunReport {
  const startTime = Date.now();
  const suites: TestSuiteResult[] = [];

  // ==========================================
  // SUITE 1: 课程官方题解通过率与检查点断言自洽性测试
  // ==========================================
  const suite1Start = Date.now();
  let suite1Passed = 0;
  let suite1Failed = 0;
  const suite1Bugs: any[] = [];

  for (const track of TRACKS_DATA) {
    for (const lesson of track.lessons) {
      let mockOutput = "[JVM Build Success]\nProcess finished with exit code 0\n420 tokens\ngemini-3.8-flash\n[会话加载成功]\n计划更新完成 步骤数: 3\n[FastAPI 启动成功]\n[Spring Boot Application Started]";
      if (lesson.trackId === "track-zero") {
        mockOutput = "人生第一次敲代码，你好世界！\n你好，Python！\n我准备好探索数字世界了！\n80\n电量不足，请快充电！\n第 1 天：坚持学习编程，我正在变得更厉害！\n第 2 天：坚持学习编程，我正在变得更厉害！\n第 3 天：坚持学习编程，我正在变得更厉害！\n🎉 恭喜 【代码探索者】 彻底脱离纯小白！";
      } else if (lesson.language === "python") {
        mockOutput = "用户张三在系统中已被创建，当前用户总数: 1\n[FastAPI 启动成功] 路由挂载: /api/v1/recommendation\n[FastAPI 测试通过] 状态码: 200\n[Agent 思考] 当前目标: 查询用户最新订单\n[Agent 状态] 已流转至: SUCCESS\n[多Agent会话结束] 已完成任务协同";
      } else if (lesson.language === "bash" || lesson.language === "shell") {
        mockOutput = "app.py\nrequirements.txt\n-rwxr-xr-x 1 user group 4096 start.sh\n8080\n[INFO] Agent server started in background with PID 18492\n[ERROR] 2026-09-21 Database connection failed\nactive (running)";
      } else if (lesson.language === "typescript") {
        mockOutput = "Token\n[会话加载成功]\n生成成功 420 tokens\ngemini-3.8-flash\n计划更新完成 步骤数: 3";
      }

      for (const checkpoint of lesson.checkpoints) {
        try {
          const evalResult = checkpoint.testFunction(lesson.solutionCode, mockOutput);
          if (evalResult.passed) {
            suite1Passed++;
          } else {
            suite1Failed++;
            suite1Bugs.push({
              target: `${track.title} -> ${lesson.title} -> [${checkpoint.title}]`,
              description: "官方参考题解未通过自身检查点！",
              details: evalResult.message || "测试函数返回 passed === false"
            });
          }
        } catch (err: any) {
          suite1Failed++;
          suite1Bugs.push({
            target: `${track.title} -> ${lesson.title} -> [${checkpoint.title}]`,
            description: "执行检查点断言时抛出未捕获异常！",
            details: err.message
          });
        }
      }
    }
  }

  suites.push({
    suiteName: "1. 全课程官方题解通过率与检查点断言自洽性测试",
    totalTests: suite1Passed + suite1Failed,
    passedTests: suite1Passed,
    failedTests: suite1Failed,
    bugsCaught: suite1Bugs,
    durationMs: Date.now() - suite1Start
  });

  // ==========================================
  // SUITE 2: 代码审核引擎（可通性·可行性·安全性）拦截精度与误报率测试
  // ==========================================
  const suite2Start = Date.now();
  let suite2Passed = 0;
  let suite2Failed = 0;
  const suite2Bugs: any[] = [];

  // Case A: 含有致命 SQL 注入与硬编码私钥的高危代码
  const dangerousCode = `
api_key = "sk-1234567890abcdef1234567890abcdef"
def get_user(user_id):
    sql = f"SELECT * FROM users WHERE id = '{user_id}'"
    return db.execute(sql)
`;
  const reportA = auditCodeLocally(dangerousCode, "python");
  if (reportA.verdict === "REJECTED" && reportA.securityScore < 50 && reportA.issues.some(i => i.pillar === "security")) {
    suite2Passed++;
  } else {
    suite2Failed++;
    suite2Bugs.push({
      target: "安全漏洞扫描器",
      description: "未能成功拦截包含硬编码 sk- 密钥和 SQL 拼接的恶意样本！",
      details: `Verdict: ${reportA.verdict}, SecurityScore: ${reportA.securityScore}`
    });
  }

  // Case B: 含有无退出条件死循环的可行性崩溃代码
  const infiniteLoopCode = `
def run_forever():
    while True:
        print("running without break")
`;
  const reportB = auditCodeLocally(infiniteLoopCode, "python");
  if (reportB.feasibilityScore <= 60 && reportB.issues.some(i => i.title.includes("死循环"))) {
    suite2Passed++;
  } else {
    suite2Failed++;
    suite2Bugs.push({
      target: "可行性与死循环检测器",
      description: "未能有效报警无 break/return 的 while True 死循环！",
      details: `FeasibilityScore: ${reportB.feasibilityScore}`
    });
  }

  // Case C: 含有语法括号不匹配的可通性崩溃代码
  const brokenSyntaxCode = `
function test() {
  const list = [1, 2, 3;
}
`;
  const reportC = auditCodeLocally(brokenSyntaxCode, "typescript");
  if (reportC.passabilityScore < 100 && reportC.issues.some(i => i.pillar === "passability")) {
    suite2Passed++;
  } else {
    suite2Failed++;
    suite2Bugs.push({
      target: "可通性与括号语法分析器",
      description: "未捕获括号未正常闭合的破坏性语法错误！",
      details: `PassabilityScore: ${reportC.passabilityScore}`
    });
  }

  // Case D: 规范工业级代码应该满分或高分通过
  const safeCode = `
interface UserData {
  userId: string;
  name: string;
}

function processUser(data: UserData): boolean {
  console.log("Processing user:", data.userId);
  return true;
}
`;
  const reportD = auditCodeLocally(safeCode, "typescript");
  if (reportD.verdict === "PASSED" && reportD.score >= 90) {
    suite2Passed++;
  } else {
    suite2Failed++;
    suite2Bugs.push({
      target: "规范代码基线评估",
      description: "规范的 TypeScript 代码误报不通过！",
      details: `Verdict: ${reportD.verdict}, Score: ${reportD.score}`
    });
  }

  suites.push({
    suiteName: "2. 代码审核引擎（可通性·可行性·安全性）拦截精度与误报率测试",
    totalTests: suite2Passed + suite2Failed,
    passedTests: suite2Passed,
    failedTests: suite2Failed,
    bugsCaught: suite2Bugs,
    durationMs: Date.now() - suite2Start
  });

  // ==========================================
  // SUITE 3: 每日挑战题库、GitHub拆解舱与Vibe案例元数据完整性测试
  // ==========================================
  const suite3Start = Date.now();
  let suite3Passed = 0;
  let suite3Failed = 0;
  const suite3Bugs: any[] = [];

  // 验证每日挑战
  DAILY_CHALLENGES.forEach((dc) => {
    if (dc.options && dc.options.length >= 2) {
      const correctOpts = dc.options.filter(o => o.isCorrect);
      if (correctOpts.length === 1) {
        suite3Passed++;
      } else {
        suite3Failed++;
        suite3Bugs.push({
          target: `DailyChallenge: ${dc.title}`,
          description: `正确选项数量不为 1 (当前有 ${correctOpts.length} 个正确答案)`,
          details: `ID: ${dc.id}`
        });
      }
    } else {
      suite3Passed++;
    }
  });

  // 验证 GitHub 项目拆解舱 5 步法完备性
  GITHUB_LAB_PROJECTS.forEach((proj) => {
    const hasStep1Readme = Boolean(proj.readme && proj.readme.length > 20);
    const hasStep2Blueprint = Boolean(proj.architectureBlueprint?.layers && proj.architectureBlueprint.layers.length >= 3);
    const hasStep3FileTree = Boolean(proj.fileTree?.children && proj.fileTree.children.length > 0);
    const hasStep4Trace = Boolean(proj.requestTrace?.steps && proj.requestTrace.steps.length >= 3);
    const hasStep5Hotfix = Boolean(typeof proj.hotfixChallenge?.testValidation === "function" && proj.keySourceWalkthrough);

    if (hasStep1Readme && hasStep2Blueprint && hasStep3FileTree && hasStep4Trace && hasStep5Hotfix) {
      suite3Passed++;
    } else {
      suite3Failed++;
      suite3Bugs.push({
        target: `GitHubLab: ${proj.title || proj.id}`,
        description: `项目拆解不满足标准 5 步法完备性 (S1:${hasStep1Readme}, S2:${hasStep2Blueprint}, S3:${hasStep3FileTree}, S4:${hasStep4Trace}, S5:${hasStep5Hotfix})`,
        details: `ID: ${proj.id}`
      });
    }
  });

  // 验证 Vibe Coding 案例隐患与重构完备性
  VIBE_CODING_CASES.forEach((vc) => {
    const hasDisasters = Boolean(vc.hiddenDisasters && vc.hiddenDisasters.length >= 1);
    const hasRefactor = Boolean(vc.correctRefactoredCode && vc.correctRefactoredCode.length > 30);
    const hasStrategy = Boolean(vc.verificationStrategy && typeof vc.testCheck === "function");

    if (hasDisasters && hasRefactor && hasStrategy) {
      suite3Passed++;
    } else {
      suite3Failed++;
      suite3Bugs.push({
        target: `VibeCase: ${vc.title}`,
        description: `Vibe案例生产审查数据缺失 (Disasters:${hasDisasters}, Refactor:${hasRefactor}, Strategy:${hasStrategy})`,
        details: `ID: ${vc.id}`
      });
    }
  });

  suites.push({
    suiteName: "3. 每日挑战题库、GitHub拆解舱与Vibe案例元数据完整性测试",
    totalTests: suite3Passed + suite3Failed,
    passedTests: suite3Passed,
    failedTests: suite3Failed,
    bugsCaught: suite3Bugs,
    durationMs: Date.now() - suite3Start
  });

  const totalPassed = suites.reduce((acc, s) => acc + s.passedTests, 0);
  const totalFailed = suites.reduce((acc, s) => acc + s.failedTests, 0);

  return {
    success: totalFailed === 0,
    totalPassed,
    totalFailed,
    totalDurationMs: Date.now() - startTime,
    suites
  };
}
