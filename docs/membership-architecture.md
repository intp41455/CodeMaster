# gode 会员化内容后端化架构

> 版本：v1.0 · 2026-09-23 · 决策人：陛下 / 小腾子

## 1. 目标

把「高级板块」从**前端 bundle 明文内容**升级为**后端鉴权分发**，实现：
- 非会员在前端拿不到高级课程的任何内容（防源码/接口白嫖）
- 会员按状态实时放行，过期立即失效
- 为后续 Paddle 支付打通提供权限底座

## 2. 现状与问题

| 项 | 现状 |
|---|---|
| 课程数据 | 全部打包在 `src/data/coursesData.ts`（约 2900 行），随前端 bundle 分发 |
| 访问控制 | 无——任何人打开开发者工具即可读全部内容 |
| 账号 | Supabase Auth + profiles（is_member 字段已预留，仅服务端可写） |
| 沙箱/AI | 前端 Pyodide + BYOK，与内容鉴权无关 |

## 3. 目标架构

```
┌─ 前端（静态托管，EdgeOne 中国站）────────────────────┐
│  免费课程 ← src/data（bundle 内，任何人可读）          │
│  高级板块 UI ← PremiumSection 组件                     │
│      ├─ 非会员：显示课程卡（标题/简介）+ 锁定遮罩       │
│      └─ 会员：按需 fetch premium_content（完整课程）    │
└───────────────┬───────────────────────────────────────┘
                │ Supabase JS SDK（登录态 + RLS）
┌───────────────▼───────────────────────────────────────┐
│  Supabase（Postgres + RLS）                            │
│  profiles          → 用户 + is_member + membership_until│
│  premium_content   → 高级课程 jsonb（仅会员可 select）  │
│  RLS: select policy 校验 is_member 且未过期             │
└───────────────────────────────────────────────────────┘
```

**核心原则：内容不在前端，就在 RLS 后面。** 前端 bundle 里只有课程卡片的标题/简介（用于展示锁），完整 lessons（markdown、starterCode、solutionCode、checkpoints）只存在数据库。

## 4. 数据模型

### profiles（已有）
- `is_member boolean` —— 会员标记
- `membership_until timestamptz` —— 到期时间（空 = 永久）
- 列级权限：`is_member` / `membership_until` **仅 service_role 可写**，前端 anon key 无法自封会员

### premium_content（新增）
| 列 | 类型 | 说明 |
|---|---|---|
| id | text PK | 高级课程 id（如 `premium-llm`） |
| title / tagline / description | text | 展示卡信息（非会员可见的元信息） |
| lessons | jsonb | `Lesson[]` 完整内容（markdown/代码/检查点），会员才可取 |
| is_published | bool | 上下架 |
| created_at / updated_at | timestamptz | 时间戳 |

### RLS 策略（防白嫖关键）
```sql
create policy "premium_select_members_only" on premium_content for select
using (exists (
  select 1 from profiles p
  where p.id = auth.uid()
    and p.is_member = true
    and (p.membership_until is null or p.membership_until > now())
));
```

## 5. 前端接入

### 新组件：PremiumSection
- 位置：课程页新增「高级板块」分区（或独立 Tab）
- 渲染：`premium_content` 表里 `is_published` 的课程卡（title/tagline 来自一个**公开的元信息视图**，见下）
- 非会员点击课程卡 → 会员引导弹窗（"开通会员"，跳转支付页——Paddle 接入后）
- 会员点击 → 拉取 `lessons` → 渲染进现有 `CodecademyWorkspace` 复用全套教学 UI

### 元信息 vs 内容分离（额外防护）
非会员也需要看到课程卡（吸引转化），所以需要**元信息可读**：
```sql
create view premium_catalog as
select id, title, tagline, description, is_published from premium_content;
```
该视图对 anon 开放（只有标题简介，无内容）；`lessons` 仍受会员 RLS 保护。

### 缓存与体验
- 会员拉取 lessons 后 session 内缓存，避免切课重复请求
- 非会员不发起内容请求（前端就不给入口），杜绝无效请求

## 6. 内容生产与导入

`scripts/import-premium-content.mjs`：
- 输入：`docs/premium-content/*.json`（Lesson[] 结构，与现有类型一致）
- 使用 service_role key（**只在管理端脚本用，绝不进前端**）
- 幂等 upsert，支持单文件/全量导入

## 7. 安全边界

| 威胁 | 防线 |
|---|---|
| 爬虫抓前端 bundle | 高级内容不在 bundle，抓不到 |
| 直接调 REST API | RLS：非会员 select 返回空 |
| 用户伪造 is_member | 列级权限：anon/authenticated 无法 update is_member |
| 会员过期 | policy 里 `now() > membership_until` 实时失效 |
| service_role 泄漏 | 仅存在于管理员本地 .env，不入库不进前端 |

## 8. 后续（依赖支付）

1. Paddle 订阅创建 → webhook 验签 → service_role 写 `is_member` + `membership_until`
2. 会员引导弹窗接支付链接
3. 管理后台（Supabase Studio）手动开/关会员兜底

## 9. 待办清单

- [x] schema：premium_content 表 + RLS + 元信息视图
- [x] 前端：PremiumSection 组件 + 会员内容读取 hook
- [x] 导入脚本骨架
- [ ] Paddle 支付 + webhook（需账号）
- [ ] 高级课程内容生产（需课程材料）
- [ ] 自定义域名（已暂缓，先用免费子域名）
