// 会员内容后端化：高级课程目录（公开元信息）与课程内容（会员 RLS 保护）读取
// 设计要点：
// - premium_catalog 视图对 anon 开放，只含标题/简介（吸引转化，无内容泄漏）
// - premium_content 表 lessons 受 RLS 保护，仅 is_member 且未过期用户可读
// - 非会员前端拿不到任何课程正文，杜绝抓包白嫖
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Lesson } from "../types";
import { getMembershipStatus } from "./progressSync";
import { isStarUnlocked } from "./starUnlock";

export interface PremiumCourseMeta {
  id: string;
  title: string;
  tagline: string | null;
  description: string | null;
}

export interface MembershipInfo {
  isMember: boolean;
  until?: string;
}

/** 拉取高级课程目录（公开元信息，非会员可见） */
export async function fetchPremiumCatalog(): Promise<PremiumCourseMeta[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from("premium_catalog")
    .select("id, title, tagline, description")
    .order("created_at", { ascending: true });
  if (error) {
    console.warn("[Premium] 目录读取失败:", error.message);
    return [];
  }
  return (data || []) as PremiumCourseMeta[];
}

/** 拉取会员课程完整内容（仅会员；非会员返回 null） */
export async function fetchPremiumLessons(courseId: string): Promise<Lesson[] | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("premium_content")
    .select("lessons")
    .eq("id", courseId)
    .maybeSingle();
  if (error || !data) return null;
  const lessons = data.lessons as unknown;
  return Array.isArray(lessons) ? (lessons as Lesson[]) : null;
}

/** 当前用户会员状态（缓存 60s 内不重复查） */
let cachedMembership: MembershipInfo | null | undefined;
let membershipCacheTime = 0;

export async function getMembership(): Promise<MembershipInfo> {
  const now = Date.now();
  if (cachedMembership !== undefined && now - membershipCacheTime < 60_000) {
    return cachedMembership ?? { isMember: false };
  }
  const status = await getMembershipStatus();
  // Star 权益：点了仓库 star 并领到解锁码的用户，等同会员，解锁「高级板块」。
  // 与付费会员取并集——任一条成立即视为会员（Star 为长期有效，无到期时间）。
  const star = isStarUnlocked();
  const isMember = Boolean(status?.isMember) || star;
  const result: MembershipInfo = isMember
    ? { isMember: true, until: status?.until ?? (star ? "star-lifetime" : undefined) }
    : { isMember: false };
  cachedMembership = result;
  membershipCacheTime = now;
  return result;
}

/** 手动失效会员缓存（登录/登出后调用） */
export function invalidateMembershipCache(): void {
  cachedMembership = undefined;
}
