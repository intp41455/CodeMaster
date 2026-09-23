// 进度云同步：登录后把 UserProgress 同步到 Supabase profiles 表
// 未配置 Supabase 或未登录时所有函数安全返回 false / null，不影响本地模式。
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { UserProgress } from "../types";

export async function signInWithEmail(email: string, password: string): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) return { ok: false, message: "云端账号未启用（未配置 Supabase）" };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error
    ? { ok: false, message: error.message }
    : { ok: true, message: "" };
}

export async function signUpWithEmail(email: string, password: string): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured || !supabase) return { ok: false, message: "云端账号未启用（未配置 Supabase）" };
  const { error } = await supabase.auth.signUp({ email, password });
  return error
    ? { ok: false, message: error.message }
    : { ok: true, message: "注册成功，请查收邮箱完成确认（若未配置邮件服务则直接生效）" };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<{ id: string; email?: string } | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data } = await supabase.auth.getSession();
  const u = data?.session?.user;
  return u ? { id: u.id, email: u.email ?? undefined } : null;
}

export function onAuthChange(cb: (user: { id: string; email?: string } | null) => void): void {
  if (!isSupabaseConfigured || !supabase) return;
  supabase.auth.onAuthStateChange((_event, session) => {
    const u = session?.user;
    cb(u ? { id: u.id, email: u.email ?? undefined } : null);
  });
}

/** 把当前进度上传云端（幂等 upsert） */
export async function syncProgressToCloud(progress: UserProgress): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, progress, updated_at: new Date().toISOString() });
  return !error;
}

/** 从云端拉取进度；无记录返回 null */
export async function loadProgressFromCloud(): Promise<UserProgress | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("progress")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data || !data.progress) return null;
  return data.progress as UserProgress;
}

/** 查询当前用户会员状态（高级板块预留） */
export async function getMembershipStatus(): Promise<{ isMember: boolean; until?: string } | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("is_member, membership_until")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  const until = data.membership_until ? String(data.membership_until) : undefined;
  const isMember = Boolean(data.is_member) && (!until || new Date(until).getTime() > Date.now());
  return { isMember, until };
}
