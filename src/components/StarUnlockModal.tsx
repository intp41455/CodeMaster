/**
 * Star 权益解锁弹窗 —— CodeMaster (gode)
 *
 * 机制：在 GitHub 仓库 intp41455/gode 点了 star 的用户，在 issue 留言 GitHub 用户名，
 *      由运营侧发解锁码，在此输入即解锁「高级板块 · 会员专属」。
 * 校验：纯前端（FNV-1a + 盐），见 utils/starUnlock.ts。
 */

import React, { useEffect, useState } from "react";
import { X, Star, CheckCircle2, ExternalLink, Trash2 } from "lucide-react";
import {
  GODE_REPO_URL,
  GODE_ISSUE_URL,
  redeem,
  isStarUnlocked,
  getStarCode,
  clearStar,
  formatCode,
} from "../utils/starUnlock";
// 解锁后要让「高级板块」重新判定会员身份：清掉会员缓存 + 刷新页面
import { invalidateMembershipCache } from "../utils/premiumContent";

interface StarUnlockModalProps {
  open: boolean;
  onClose: () => void;
  /** 解锁状态变化后回调（用于刷新高级板块） */
  onUnlockedChange?: () => void;
}

export const StarUnlockModal: React.FC<StarUnlockModalProps> = ({
  open,
  onClose,
  onUnlockedChange,
}) => {
  const [code, setCode] = useState<string>("");
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [savedCode, setSavedCode] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setUnlocked(isStarUnlocked());
    setSavedCode(getStarCode());
    setCode("");
    setError("");
  }, [open]);

  if (!open) return null;

  const handleRedeem = () => {
    const ok = redeem(code);
    if (ok) {
      setUnlocked(true);
      setSavedCode(getStarCode());
      setError("");
      // 会员判定有 60s 缓存，且高级板块在挂载时拉取一次 ——
      // 清缓存后刷新，让它立刻按新身份重新判定（解锁是一次性动作，刷新可接受）
      invalidateMembershipCache();
      setTimeout(() => window.location.reload(), 600);
    } else {
      setError("这个码不对。检查一下有没有输错，或去 issue 里确认一下。");
    }
  };

  const handleClear = () => {
    clearStar();
    invalidateMembershipCache();
    setUnlocked(false);
    setSavedCode(null);
    setCode("");
    setError("");
    setTimeout(() => window.location.reload(), 400);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 font-['Geist',sans-serif]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[rgba(26,26,26,0.08)] bg-white shadow-2xl text-[#1a1a1a]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(26,26,26,0.08)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-[#f5b301]" />
            <h2 className="text-sm font-semibold tracking-wide">Star 权益 · 解锁高级板块</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[rgba(26,26,26,0.5)] hover:bg-neutral-100 hover:text-[#1a1a1a] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 text-sm leading-relaxed">
          {unlocked ? (
            /* ---- 已解锁 ---- */
            <div className="text-center py-2">
              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-[#178568]" />
              <b className="block text-base mb-2">高级板块已解锁</b>
              <p className="text-[rgba(26,26,26,0.6)] mb-3">
                感谢你点的 Star 🙏 高级课程已对你开放。
              </p>
              {savedCode && (
                <p className="font-['Geist_Mono',monospace] text-xs text-[rgba(26,26,26,0.45)] mb-4">
                  {formatCode(savedCode)}
                </p>
              )}
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(26,26,26,0.15)] px-3 py-1.5 text-xs text-[rgba(26,26,26,0.6)] hover:bg-neutral-100 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                清除解锁状态
              </button>
            </div>
          ) : (
            /* ---- 未解锁：领取步骤 ---- */
            <>
              <p className="text-[rgba(26,26,26,0.6)] mb-4">
                这个项目纯静态、零后端，Star 是它被看见的唯一途径。
                所以做了个小交换：<b className="text-[#1a1a1a]">点 Star，我免费解锁站内全部高级板块</b>。
              </p>

              <ol className="ml-5 list-decimal space-y-1.5 text-[rgba(26,26,26,0.7)]">
                <li>
                  去{" "}
                  <a
                    href={GODE_REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#2563eb] hover:underline"
                  >
                    仓库点个 Star <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  在{" "}
                  <a
                    href={GODE_ISSUE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#2563eb] hover:underline"
                  >
                    issue 留个 GitHub 用户名 <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>我把解锁码发给你，填进下面即可</li>
              </ol>

              <div className="mt-5 flex gap-2">
                <input
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRedeem();
                  }}
                  placeholder="GD-XXXX-XXXX-XXXX"
                  className="flex-1 rounded-lg border border-[rgba(26,26,26,0.15)] bg-white px-3 py-2 font-['Geist_Mono',monospace] text-sm tracking-wider placeholder:text-[rgba(26,26,26,0.3)] focus:border-[#2563eb] focus:outline-none"
                />
                <button
                  onClick={handleRedeem}
                  className="shrink-0 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity active:scale-95"
                >
                  解锁
                </button>
              </div>

              {error && <p className="mt-2 text-xs text-[#b91c1c]">{error}</p>}

              <p className="mt-4 text-xs text-[rgba(26,26,26,0.45)] leading-relaxed">
                觉得项目有用再点，没用就路过，都行。解锁码一码对应一次 Star，纯荣誉制。
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
