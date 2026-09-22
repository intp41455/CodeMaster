import React, { useState } from "react";
import { 
  GitBranch, 
  Layers, 
  FolderTree, 
  Play, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ArrowRight, 
  Terminal, 
  Sparkles, 
  Send, 
  ShieldCheck,
  Star
} from "lucide-react";
import { GITHUB_LAB_PROJECTS } from "../data/githubLabData";
import { GitHubProjectLab, FileNode } from "../types";

interface GitHubDeconstructionLabProps {
  onCompleteProject: (projectId: string) => void;
  completedProjectIds: string[];
}

export const GitHubDeconstructionLab: React.FC<GitHubDeconstructionLabProps> = ({
  onCompleteProject,
  completedProjectIds,
}) => {
  const [activeProjectIndex, setActiveProjectIndex] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  
  const project: GitHubProjectLab = GITHUB_LAB_PROJECTS[activeProjectIndex];

  // Hotfix state
  const [patchCode, setPatchCode] = useState<string>(project.hotfixChallenge.buggyCode);
  const [testResult, setTestResult] = useState<{ passed: boolean; feedback: string } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Switch project handler
  const handleSwitchProject = (idx: number) => {
    setActiveProjectIndex(idx);
    setActiveStep(1);
    setSelectedFile(null);
    setPatchCode(GITHUB_LAB_PROJECTS[idx].hotfixChallenge.buggyCode);
    setTestResult(null);
    setShowHint(false);
  };

  // Run Hotfix Validator
  const handleValidatePatch = () => {
    const res = project.hotfixChallenge.testValidation(patchCode);
    setTestResult(res);
    if (res.passed) {
      onCompleteProject(project.id);
    }
  };

  // Flatten files for simple tree display
  const renderFileTreeItem = (node: FileNode, depth = 0) => {
    const isDir = node.type === "directory";
    return (
      <div key={node.path} className="text-xs">
        <div
          onClick={() => {
            if (!isDir) setSelectedFile(node);
          }}
          className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors ${
            selectedFile?.path === node.path
              ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600"
              : isDir
              ? "text-[rgba(26,26,26,0.6)] font-semibold hover:bg-[#f8f7f4]"
              : "text-[#1a1a1a] hover:bg-[#f8f7f4]"
          }`}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          {isDir ? (
            <FolderTree className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          ) : (
            <FileCode className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          )}
          <span className="font-mono">{node.name}</span>
        </div>
        {node.children && (
          <div>
            {node.children.map((child) => renderFileTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-['Geist',sans-serif] text-[#1a1a1a]">
      {/* Top Banner: The 5-Step Methodology */}
      <div className="rounded-2xl border border-[rgba(26,26,26,0.08)] bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>专项能力一：GitHub 陌生开源项目穿透方法论</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1a1a1a] font-['Cormorant_Garamond',serif]">
              面对一个陌生的 GitHub 仓库，如何从 0 看透并提交 PR？
            </h1>
            <p className="text-xs sm:text-sm text-[rgba(26,26,26,0.6)] max-w-3xl">
              掌握大厂架构师的<strong>“5 步穿透法”</strong>：看根基 ➔ 拓扑测绘 ➔ 链路时序 ➔ 关键源码 ➔ 提交小补丁。从此 GitHub 任何复杂项目在你眼中都像透明玻璃一样清晰！
            </p>
          </div>

          {/* Project Switcher */}
          <div className="flex items-center gap-2 bg-[#f8f7f4] p-1.5 rounded-xl border border-[rgba(26,26,26,0.08)]">
            {GITHUB_LAB_PROJECTS.map((proj, idx) => (
              <button
                key={proj.id}
                onClick={() => handleSwitchProject(idx)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeProjectIndex === idx
                    ? "btn btn-run"
                    : "text-[rgba(26,26,26,0.6)] hover:text-[#1a1a1a]"
                }`}
              >
                案例 {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* 5-Step Progress Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-6 mt-4 border-t border-[rgba(26,26,26,0.08)]">
          {[
            { step: 1, label: "第1步：看根基 & 跑起来", desc: "README 与依赖清单" },
            { step: 2, label: "第2步：画出架构拓扑", desc: "识别分层与控制器" },
            { step: 3, label: "第3步：单请求链路追踪", desc: "还原完整调用时序" },
            { step: 4, label: "第4步：剖析关键源码", desc: "透析核心算法机制" },
            { step: 5, label: "第5步：动手修改验证", desc: "Hotfix 小改动实战" },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setActiveStep(item.step as any)}
              className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all ${
                activeStep === item.step
                  ? "border-blue-600 bg-blue-50/70 text-[#1a1a1a] shadow-xs"
                  : "border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] text-[rgba(26,26,26,0.6)] hover:border-neutral-300 hover:text-[#1a1a1a]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-[#1a1a1a]">{item.label}</span>
                {Boolean(completedProjectIds?.includes(project.id)) && item.step === 5 && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                )}
              </div>
              <span className="text-[11px] text-[rgba(26,26,26,0.5)] mt-0.5">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Project Lab Body */}
      <div className="rounded-2xl border border-[rgba(26,26,26,0.08)] bg-white p-5 sm:p-6 space-y-6 shadow-xs">
        {/* Repo Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(26,26,26,0.08)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-blue-600" />
              <span className="font-mono text-base sm:text-lg font-bold text-[#1a1a1a]">
                {project.repoName}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs text-amber-800">
                <Star className="h-3 w-3 fill-current text-amber-500" />
                {project.stars}
              </span>
            </div>
            <p className="text-xs text-[rgba(26,26,26,0.6)]">{project.summary}</p>
          </div>

          {/* Tech Stack Pills */}
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded bg-[#f8f7f4] px-2.5 py-1 text-[11px] font-mono font-medium text-[rgba(26,26,26,0.7)] border border-[rgba(26,26,26,0.08)]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* STEP 1: READ ROOTS & DEPENDENCY */}
        {activeStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Project Explorer */}
            <div className="lg:col-span-4 rounded-xl border border-[rgba(26,26,26,0.08)] bg-white p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] pb-2">
                <span className="text-xs font-semibold text-[#1a1a1a] flex items-center gap-1.5">
                  <FolderTree className="h-4 w-4 text-blue-600" />
                  工程目录骨架
                </span>
                <span className="text-[10px] text-[rgba(26,26,26,0.4)]">点击查看文件作用</span>
              </div>
              <div className="space-y-1">
                {renderFileTreeItem(project.fileTree)}
              </div>

              {selectedFile && (
                <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs space-y-1.5">
                  <div className="font-mono font-bold text-blue-900">
                    {selectedFile.path}
                  </div>
                  <p className="text-[rgba(26,26,26,0.7)] leading-relaxed text-[11px]">
                    {selectedFile.roleDescription || "核心业务源码文件"}
                  </p>
                </div>
              )}
            </div>

            {/* Right: README & Run Guide */}
            <div className="lg:col-span-8 rounded-xl border border-[rgba(26,26,26,0.08)] bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] pb-3">
                <h3 className="font-semibold text-sm text-[#1a1a1a] flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-emerald-600" />
                  <span>README.md 核心文档解析</span>
                </h3>
                <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  第一步心法：5分钟速读启动命令与环境依赖
                </span>
              </div>

              <div className="rounded-lg bg-[#f8f7f4] p-4 border border-[rgba(26,26,26,0.08)] font-mono text-xs text-[#1a1a1a] whitespace-pre-wrap leading-6">
                {project.readme}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveStep(2)}
                  className="btn btn-run inline-flex items-center gap-1.5 rounded px-4 py-2 text-xs font-semibold transition-all"
                >
                  <span>掌握根基，进入第2步：画出架构拓扑</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ARCHITECTURE BLUEPRINT (拓扑测绘) */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
              <h3 className="text-sm font-semibold text-blue-900">
                💡 第2步心法：画出分层架构拓扑（不看千行代码，先看宏观层次）
              </h3>
              <p className="text-xs text-[rgba(26,26,26,0.7)] mt-1">
                任何工业级软件，无论是 FastAPI 还是 Spring Boot，内部都可以归纳为 4 个清晰的层级。看懂层级，你就永远不会迷失！
              </p>
            </div>

            {/* Visual Layers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {project.architectureBlueprint.layers.map((layer) => (
                <div
                  key={layer.name}
                  className="rounded-xl border border-[rgba(26,26,26,0.08)] p-4 space-y-3 bg-[#f8f7f4]"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    {layer.name}
                  </div>
                  <p className="text-xs text-[rgba(26,26,26,0.7)] leading-relaxed min-h-[40px]">
                    {layer.role}
                  </p>
                  <div className="border-t border-[rgba(26,26,26,0.08)] pt-2 space-y-1">
                    <span className="text-[10px] text-[rgba(26,26,26,0.5)] font-mono uppercase">关键组件:</span>
                    <div className="flex flex-wrap gap-1">
                      {layer.components.map((comp) => (
                        <span
                          key={comp}
                          className="rounded bg-white px-2 py-0.5 text-[10px] font-mono text-[#1a1a1a] border border-[rgba(26,26,26,0.08)]"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Data Flow Summary */}
            <div className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] p-4 space-y-2">
              <span className="text-xs font-semibold text-[rgba(26,26,26,0.6)] uppercase tracking-wide">
                全系统宏观数据流转路线 (Data Pipeline):
              </span>
              <div className="text-xs font-mono text-blue-900 bg-white p-3 rounded-lg border border-[rgba(26,26,26,0.08)]">
                {project.architectureBlueprint.dataFlow}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveStep(3)}
                className="btn btn-run inline-flex items-center gap-1.5 rounded px-4 py-2 text-xs font-semibold transition-all"
              >
                <span>拓扑清晰，进入第3步：单请求链路追踪</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SINGLE REQUEST FLOW TRACE (全链路追踪) */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
              <h3 className="text-sm font-semibold text-blue-900">
                🔍 第3步心法：单请求全链路时序追踪（让代码在脑中放电影）
              </h3>
              <p className="text-xs text-[rgba(26,26,26,0.7)] mt-1">
                {project.requestTrace.description}
              </p>
            </div>

            {/* Step-by-Step Flow Timeline */}
            <div className="space-y-3">
              {project.requestTrace.steps.map((st) => (
                <div
                  key={st.step}
                  className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-mono text-xs font-bold shrink-0">
                      {st.step}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700">
                          {st.location}
                        </span>
                        <span className="text-xs font-semibold text-[#1a1a1a]">
                          ➔ {st.action}
                        </span>
                      </div>
                      <p className="text-xs text-[rgba(26,26,26,0.6)]">{st.detail}</p>
                    </div>
                  </div>

                  {/* IO Inspector */}
                  <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 text-[11px] font-mono shrink-0">
                    <div className="rounded bg-white p-2 border border-[rgba(26,26,26,0.08)] max-w-xs truncate">
                      <span className="text-[rgba(26,26,26,0.4)]">IN:</span>{" "}
                      <span className="text-amber-800">{st.incomingData}</span>
                    </div>
                    <div className="rounded bg-white p-2 border border-[rgba(26,26,26,0.08)] max-w-xs truncate">
                      <span className="text-[rgba(26,26,26,0.4)]">OUT:</span>{" "}
                      <span className="text-emerald-800">{st.outgoingData}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveStep(4)}
                className="btn btn-run inline-flex items-center gap-1.5 rounded px-4 py-2 text-xs font-semibold transition-all"
              >
                <span>链路透彻，进入第4步：剖析核心源码</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: KEY SOURCE CODE WALKTHROUGH (源码透析) */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
              <h3 className="text-sm font-semibold text-blue-900">
                📖 第4步心法：关键源码精讲（逐行看透设计模式与工业级考量）
              </h3>
              <p className="text-xs text-[rgba(26,26,26,0.7)] mt-1">
                查看 {project.keySourceWalkthrough.filePath} 的核心逻辑，了解优秀开源作者是如何处理防御性编程与异常状态的。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left Code Box */}
              <div className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-[#f8f7f4] p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] pb-2">
                  <span className="font-mono text-xs font-semibold text-[#1a1a1a]">
                    {project.keySourceWalkthrough.filePath}
                  </span>
                  <span className="text-[10px] text-[rgba(26,26,26,0.4)] font-mono">Core Logic</span>
                </div>
                <pre className="font-mono text-xs text-[#1a1a1a] whitespace-pre-wrap leading-6 bg-white p-3 rounded-lg border border-[rgba(26,26,26,0.08)] overflow-x-auto">
                  {project.keySourceWalkthrough.code}
                </pre>
              </div>

              {/* Right Line Annotations */}
              <div className="space-y-3">
                {project.keySourceWalkthrough.breakdowns.map((bd, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-white p-4 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-mono font-bold text-blue-700">
                        {bd.lineRange}
                      </span>
                      <span className="font-mono text-xs text-[rgba(26,26,26,0.5)] truncate max-w-[200px]">
                        {bd.codeSnippet.slice(0, 30)}...
                      </span>
                    </div>

                    <p className="text-xs text-[rgba(26,26,26,0.7)] leading-relaxed">
                      {bd.plainChineseExplanation}
                    </p>

                    <div className="text-[11px] text-blue-900 bg-blue-50/60 p-2 rounded border border-blue-100">
                      <strong>🏛️ 架构意义：</strong>
                      {bd.architectureSignificance}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveStep(5)}
                className="btn btn-run inline-flex items-center gap-1.5 rounded px-4 py-2 text-xs font-semibold transition-all"
              >
                <span>准备就绪！进入第5步：动手修改并提交 Patch</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: HOTFIX CHALLENGE (动手小改动验证) */}
        {activeStep === 5 && (
          <div className="space-y-6">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>第5步终极实战：{project.hotfixChallenge.title}</span>
              </div>
              <p className="text-xs sm:text-sm text-[rgba(26,26,26,0.7)] leading-relaxed">
                <strong>【真实工业级场景】：</strong>
                {project.hotfixChallenge.scenario}
              </p>
              <div className="rounded-lg bg-white p-3 border border-emerald-200 text-xs text-emerald-900">
                <strong>🎯 任务要求：</strong>
                {project.hotfixChallenge.expectedFixDescription}
              </div>
            </div>

            {/* Hotfix Code Editor & Tester */}
            <div className="rounded-xl border border-[rgba(26,26,26,0.08)] bg-white p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] pb-2">
                <span className="font-mono text-xs text-[#1a1a1a] flex items-center gap-2 font-semibold">
                  <Terminal className="h-4 w-4 text-emerald-600" />
                  <span>正在修改：{project.hotfixChallenge.targetFile}</span>
                </span>

                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  💡 {showHint ? "收起提示" : "查看思路提示"}
                </button>
              </div>

              {showHint && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
                  <strong>思路提示：</strong> {project.hotfixChallenge.hint}
                </div>
              )}

              <textarea
                value={patchCode}
                onChange={(e) => setPatchCode(e.target.value)}
                rows={9}
                className="w-full rounded-lg bg-[#f8f7f4] border border-[rgba(26,26,26,0.08)] p-3 font-mono text-xs sm:text-sm text-[#1a1a1a] leading-6 focus:outline-none focus:border-blue-600"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[rgba(26,26,26,0.5)]">
                  修改完成后，点击右侧提交测试验证
                </span>

                <button
                  onClick={handleValidatePatch}
                  className="btn btn-run inline-flex items-center gap-2 rounded px-5 py-2 text-xs sm:text-sm font-semibold transition-all active:scale-95"
                >
                  <Send className="h-4 w-4" />
                  <span>运行自动化测试 & 提交 PR</span>
                </button>
              </div>

              {/* Validation Result Box */}
              {testResult && (
                <div
                  className={`mt-4 rounded-xl border p-4 text-xs space-y-2 animate-fadeIn ${
                    testResult.passed
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-rose-300 bg-rose-50 text-rose-900"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {testResult.passed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-rose-600" />
                    )}
                    <span>{testResult.passed ? "PR 合并成功！" : "自动化测试未通过"}</span>
                  </div>
                  <p className="leading-relaxed">{testResult.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
