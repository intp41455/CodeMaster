-- ============================================================
-- CodeMaster 账号体系与进度云同步 Schema
-- 在 Supabase 控制台 → SQL Editor 中整段执行即可。
-- 完成后把 Project Settings → API 的 URL 与 anon key 填入
-- 项目 .env 的 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY。
-- ============================================================

-- 1. 用户档案表：进度 JSON + 会员状态（高级板块预留）
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  progress          jsonb not null default '{}'::jsonb,
  is_member         boolean not null default false,
  membership_until  timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.profiles is 'CodeMaster 用户档案：进度云同步 + 会员状态';

-- 2. 行级安全：用户只能读写自己的记录
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 3. 列级权限：会员字段只允许服务端（service_role）写入，
--    前端 anon key 无法自行把 is_member 置 true —— 防止白嫖。
revoke update on public.profiles from anon, authenticated;
grant update (progress, updated_at) on public.profiles to authenticated;
grant select, insert on public.profiles to authenticated;
grant select on public.profiles to anon;

-- 4. updated_at 自动刷新
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 5. 会员状态查询视图（服务端校验用；前端仅能读自己的）
create or replace view public.my_membership as
select id, is_member, membership_until
from public.profiles
where id = auth.uid();

-- ============================================================
-- 高级板块：付费内容存储与鉴权分发（会员内容后端化）
-- 免费课程数据仍在前端 bundle；高级课程内容存此表，仅会员可读。
-- ============================================================

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

-- RLS：非会员读不到任何内容（含课程详情）
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

-- 内容写入仅限服务端（service_role）；anon/authenticated 均无写权限
revoke insert, update, delete on public.premium_content from anon, authenticated;
grant select on public.premium_content to authenticated;

-- 公开目录视图：只有标题/简介（非会员可见，用于展示与转化），无课程正文
drop view if exists public.premium_catalog;
create view public.premium_catalog as
select id, title, tagline, description
from public.premium_content
where is_published = true;

grant select on public.premium_catalog to anon, authenticated;
