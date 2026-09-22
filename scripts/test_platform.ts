/**
 * CodeMaster Platform Automated Bug Hunter & Test Suite (CLI Entrypoint)
 * 终端测试命令行入口：执行全站 12 体系课程题解、沙箱引擎与安全质检的自动化测试与 Bug 捕获
 */

import { runFullPlatformTests } from "../src/utils/testRunner";

export { runFullPlatformTests };

console.log("\n=======================================================");
console.log("🚀 CodeMaster 全栈自动化测试与 Bug 捕获套件启动中...");
console.log("=======================================================\n");

const results = runFullPlatformTests();

results.suites.forEach((suite, i) => {
  console.log(`\n📋 [测试套件 ${i + 1}] ${suite.suiteName}`);
  console.log(`   耗时: ${suite.durationMs}ms | 通过: ${suite.passedTests} / ${suite.totalTests}`);
  
  if (suite.bugsCaught.length > 0) {
    console.log(`   🚨 捕获到 ${suite.bugsCaught.length} 个潜在缺陷或断言不通过:`);
    suite.bugsCaught.forEach(bug => {
      console.log(`     - [目标]: ${bug.target}`);
      console.log(`       [问题]: ${bug.description}`);
      console.log(`       [详情]: ${bug.details}`);
    });
  } else {
    console.log("   ✅ 所有断言与测试用例 100% 跑通！");
  }
});

console.log("\n-------------------------------------------------------");
console.log(`🏁 自动化测试执行完毕！总计耗时: ${results.totalDurationMs}ms`);
console.log(`📊 测试汇总: 总通过: ${results.totalPassed} 项 | 失败/Bug: ${results.totalFailed} 项`);
console.log("-------------------------------------------------------\n");

if (!results.success) {
  console.error("❌ 自动化测试未通过，存在需修复的 Bug！");
  process.exit(1);
} else {
  console.log("🎉 完美！全站所有课程题解、沙箱引擎、安全质检与元数据 100% 稳健通过！\n");
  process.exit(0);
}
