# 贡献指南

感谢你愿意为 CodeMaster 贡献内容。本项目欢迎三类贡献：**课程内容补充**、**代码缺陷修复**、**交互体验优化**。

## 开发环境准备

```bash
git clone <repo-url>
cd gode
npm install
npm run dev
```

开发服务器默认运行在 <http://localhost:3000>。

## 提交前必做检查

```bash
npm run lint   # TypeScript 类型检查，必须 0 错误
npm test       # 全站自动化测试，必须全部通过
```

任何提交都应保证上述两条命令全部通过。

## 内容贡献规范

### 新增课程

在 `src/data/coursesData.ts` 的 `TRACKS_DATA` 中追加课程对象，结构参见 `src/types.ts` 中的 `Lesson` 接口。

每节课必须包含：

- `mentalModel`：生活比喻 + 核心直觉。这是本平台的教学核心，不允许只堆砌术语；
- `starterCode` 与 `solutionCode`：起始代码与官方题解。官方题解必须能通过全部检查点；
- `checkpoints`：至少一个检查点，`testFunction(code, output)` 返回 `{ passed, message }`。

### 新增检查点

检查点判定必须是**确定性**的，禁止依赖网络请求或随机数。优先使用以下方式：

1. 判断输出文本是否包含关键结果；
2. 判断代码中是否出现必需的关键字；
3. 组合判断，并给出可操作的失败提示。

失败提示应告诉学习者**哪里错了、怎么改**，而不是只说"答案错误"。

### 新增每日挑战

在 `src/data/dailyChallengesData.ts` 中追加条目。支持两种题型：

- `multiple_choice`：必须为每个错误选项提供 `explanation`，说明该选项为何错误；
- `code_fix`：必须提供 `validator` 与 `hint`。

### 新增 GitHub 拆解项目

在 `src/data/githubLabData.ts` 中追加 `GitHubProjectLab` 对象，需要包含文件树、请求链路追踪、关键源码逐行注释和热修复挑战四部分。

## 代码规范

- 使用 TypeScript，保持与现有代码一致的命名与注释风格；
- 组件放在 `src/components/`，数据放 `src/data/`，引擎逻辑放 `src/utils/`；
- 样式沿用 `src/index.css` 中已有的设计令牌与 Tailwind 类名，不引入新的 UI 框架；
- 注释解释**为什么**这么做，而不是重复代码字面含义；
- 不提交任何真实密钥、令牌或个人隐私信息。

## 修复缺陷

提交缺陷修复时，请在 Pull Request 描述中说明：

1. 复现步骤；
2. 根因分析；
3. 修复方式；
4. 为什么该修复不会引入回归。

## 提交信息

采用简洁的祈使句风格，推荐格式：

```
fix: 修正 Windows 下代码沙箱临时目录路径
feat: 新增 Linux 进程排查赛道课时
docs: 补充环境变量配置说明
```

## 许可证

贡献的代码与内容将按本项目的 [MIT 许可证](LICENSE) 发布。
