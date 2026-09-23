-- ============================================================
-- CodeMaster 高级板块：建表 + RLS + 种子数据
-- 
-- 使用方法：
-- 1. 打开 Supabase Dashboard → SQL Editor
-- 2. 粘贴此文件全部内容 → Run
-- 3. 完成后 premium_catalog 视图和 premium_content 表即可用
-- ============================================================

-- 1. 建表（幂等，重复执行不报错）
create table if not exists public.premium_content (
  id            text primary key,
  title         text not null,
  tagline       text,
  description   text,
  lessons       jsonb not null default '[]'::jsonb,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.premium_content is 'CodeMaster 高级板块课程（仅会员可读）';

-- 2. RLS：非会员读不到任何内容
alter table public.premium_content enable row level security;

drop policy if exists "premium_select_members_only" on public.premium_content;
create policy "premium_select_members_only"
  on public.premium_content for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.is_member = true
        and (p.membership_until is null or p.membership_until > now())
    )
  );

-- 3. 权限：只有 service_role 能写入；authenticated 会员可读
revoke insert, update, delete on public.premium_content from anon, authenticated;
grant select on public.premium_content to authenticated;

-- 4. 公开目录视图（非会员也可见标题/简介，用于转化展示）
drop view if exists public.premium_catalog;
create view public.premium_catalog as
select id, title, tagline, description
from public.premium_content
where is_published = true;

grant select on public.premium_catalog to anon, authenticated;

-- 5. 种子数据：3 门高级课程目录 + 课程正文
--    用 ON CONFLICT 实现幂等插入（重复执行只更新不报错）

insert into public.premium_content (id, title, tagline, description, lessons, is_published) values
(
  'llm-deploy-finetune',
  '大模型部署与微调实战',
  '从 LoRA 到 vLLM，把大模型搬上生产环境',
  '覆盖 HuggingFace 模型下载、LoRA/QLoRA 参数高效微调、vLLM/TGI 高性能推理部署、量化与蒸馏全链路。学完能独立完成模型从实验室到上线的完整流程。',
  '[
    {"id":"llm-deploy-1","title":"环境准备与模型选择","estimatedMinutes":45,"level":"实战"},
    {"id":"llm-deploy-2","title":"LoRA 微调原理与 PEFT 实践","estimatedMinutes":60,"level":"实战"},
    {"id":"llm-deploy-3","title":"QLoRA：4bit 量化下的高效微调","estimatedMinutes":55,"level":"实战"},
    {"id":"llm-deploy-4","title":"vLLM 部署与连续批处理","estimatedMinutes":50,"level":"实战"},
    {"id":"llm-deploy-5","title":"模型评估与 A/B 测试","estimatedMinutes":40,"level":"实战"}
  ]'::jsonb,
  true
)
on conflict (id) do update set
  title = excluded.title,
  tagline = excluded.tagline,
  description = excluded.description,
  lessons = excluded.lessons,
  updated_at = now();

insert into public.premium_content (id, title, tagline, description, lessons, is_published) values
(
  'multi-agent-system',
  '多智能体系统架构',
  'CrewAI / AutoGen / LangGraph 三大框架对比与实践',
  '从单 Agent 到多 Agent 协作：任务分解、角色分配、消息传递、冲突解决。通过 CrewAI、AutoGen、LangGraph 三个框架的实战对比，掌握企业级多智能体系统的设计与落地。',
  '[
    {"id":"multi-agent-1","title":"多智能体架构模式总览","estimatedMinutes":35,"level":"实战"},
    {"id":"multi-agent-2","title":"CrewAI：角色驱动的团队编排","estimatedMinutes":50,"level":"实战"},
    {"id":"multi-agent-3","title":"AutoGen：对话驱动的灵活协作","estimatedMinutes":45,"level":"实战"},
    {"id":"multi-agent-4","title":"LangGraph：图结构的状态机","estimatedMinutes":55,"level":"实战"},
    {"id":"multi-agent-5","title":"框架选型与生产落地","estimatedMinutes":40,"level":"实战"}
  ]'::jsonb,
  true
)
on conflict (id) do update set
  title = excluded.title,
  tagline = excluded.tagline,
  description = excluded.description,
  lessons = excluded.lessons,
  updated_at = now();

insert into public.premium_content (id, title, tagline, description, lessons, is_published) values
(
  'enterprise-arch',
  '企业级 AI 架构设计',
  '从流量入口到模型层，设计可扩展的 AI 系统',
  '覆盖 AI 网关设计、模型路由与降级策略、RAG 知识库工程化、Prompt 版本管理、可观测性与成本控制。面向架构师和技术负责人级别。',
  '[
    {"id":"enterprise-arch-1","title":"AI 网关：统一入口与协议转换","estimatedMinutes":40,"level":"实战"},
    {"id":"enterprise-arch-2","title":"模型路由与降级策略","estimatedMinutes":45,"level":"实战"},
    {"id":"enterprise-arch-3","title":"RAG 工程化：从 chunk 到 rerank","estimatedMinutes":60,"level":"实战"},
    {"id":"enterprise-arch-4","title":"Prompt 版本管理与 A/B 测试","estimatedMinutes":35,"level":"实战"},
    {"id":"enterprise-arch-5","title":"可观测性：trace / metric / log","estimatedMinutes":40,"level":"实战"},
    {"id":"enterprise-arch-6","title":"成本控制与容量规划","estimatedMinutes":30,"level":"实战"}
  ]'::jsonb,
  true
)
on conflict (id) do update set
  title = excluded.title,
  tagline = excluded.tagline,
  description = excluded.description,
  lessons = excluded.lessons,
  updated_at = now();

-- 6. 验证查询（执行后应看到 3 行）
select id, title, tagline from public.premium_catalog order by id;
