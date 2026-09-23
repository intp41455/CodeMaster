import React, { useEffect, useState, useCallback } from "react";
import { Crown, Lock, Unlock, Sparkles } from "lucide-react";
import {
  fetchPremiumCatalog,
  fetchPremiumLessons,
  getMembership,
  type PremiumCourseMeta,
  type MembershipInfo,
} from "../utils/premiumContent";
import type { Lesson } from "../types";

interface Props {
  onOpenAuth: () => void;
}

export default function PremiumSection({ onOpenAuth }: Props) {
  const [catalog, setCatalog] = useState<PremiumCourseMeta[]>([]);
  const [membership, setMembership] = useState<MembershipInfo>({ isMember: false });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [cats, mem] = await Promise.all([fetchPremiumCatalog(), getMembership()]);
      if (!alive) return;
      setCatalog(cats);
      setMembership(mem);
      setCatalogReady(true);
    })();
    return () => { alive = false; };
  }, []);

  const handleOpenCourse = useCallback(async (course: PremiumCourseMeta) => {
    setExpandedId(course.id);
    if (!membership.isMember) return; // 非会员：只展开锁定提示
    setLoadingLessons(true);
    const ls = await fetchPremiumLessons(course.id);
    setLessons(ls);
    setLoadingLessons(false);
  }, [membership.isMember]);

  if (!catalogReady) return null;

  return (
    <section className="mt-10 border-t border-[rgba(26,26,26,0.08)] pt-8">
      <div className="flex items-center gap-2 mb-1">
        <Crown className="h-4 w-4 text-purple-700" />
        <h2 className="text-sm font-semibold text-[#1a1a1a] tracking-wide">
          高级板块 · 会员专属
        </h2>
        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-[0.65rem] font-medium text-purple-700">
          <Sparkles className="h-3 w-3" /> 即将开放
        </span>
      </div>
      <p className="text-xs text-[rgba(26,26,26,0.5)] mb-4">
        深度实战课程：大模型部署与微调、多智能体系统、企业级架构。内容由云端按会员身份鉴权分发。
      </p>

      {catalog.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[rgba(26,26,26,0.15)] bg-white/60 p-6 text-center">
          <p className="text-xs text-[rgba(26,26,26,0.45)]">
            高级课程正在制作中，敬请期待。当前免费课程已可完整学习。
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((course) => (
            <div
              key={course.id}
              className={`rounded-xl border bg-white transition-all ${
                expandedId === course.id
                  ? "border-purple-300 shadow-sm"
                  : "border-[rgba(26,26,26,0.1)] hover:border-purple-200"
              }`}
            >
              <button
                onClick={() => handleOpenCourse(course)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-medium text-[#1a1a1a]">{course.title}</h3>
                    {course.tagline && (
                      <p className="mt-0.5 text-[0.7rem] text-[rgba(26,26,26,0.55)]">{course.tagline}</p>
                    )}
                  </div>
                  {membership.isMember ? (
                    <Unlock className="h-4 w-4 shrink-0 text-emerald-700" />
                  ) : (
                    <Lock className="h-4 w-4 shrink-0 text-[rgba(26,26,26,0.35)]" />
                  )}
                </div>
                {course.description && (
                  <p className="mt-2 text-[0.7rem] leading-relaxed text-[rgba(26,26,26,0.6)]">
                    {course.description}
                  </p>
                )}
              </button>

              {expandedId === course.id && !membership.isMember && (
                <div className="border-t border-purple-100 bg-purple-50/60 rounded-b-xl px-4 py-3">
                  <p className="text-[0.7rem] text-purple-800 mb-2">
                    本课程仅限会员学习。开通后云端将为你鉴权解锁全部内容。
                  </p>
                  <button
                    onClick={onOpenAuth}
                    className="w-full rounded-lg bg-purple-700 py-1.5 text-[0.7rem] font-medium text-white hover:bg-purple-800 transition-colors"
                  >
                    登录 / 开通会员
                  </button>
                </div>
              )}

              {expandedId === course.id && membership.isMember && (
                <div className="border-t border-[rgba(26,26,26,0.08)] px-4 py-3">
                  {loadingLessons ? (
                    <p className="text-[0.7rem] text-[rgba(26,26,26,0.5)]">正在从云端解锁内容…</p>
                  ) : lessons && lessons.length > 0 ? (
                    <div>
                      <p className="text-[0.7rem] text-emerald-700 mb-1.5">
                        已解锁 {lessons.length} 节课：
                      </p>
                      <ul className="space-y-1">
                        {lessons.map((l, i) => (
                          <li key={l.id} className="text-[0.7rem] text-[rgba(26,26,26,0.7)]">
                            {i + 1}. {l.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-[0.7rem] text-[rgba(26,26,26,0.5)]">课程内容暂未发布。</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
