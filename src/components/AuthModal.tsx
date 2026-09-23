import React, { useState } from "react";
import { signInWithEmail, signUpWithEmail, signOut } from "../utils/progressSync";
import { isSupabaseConfigured } from "../lib/supabase";

interface Props {
  open: boolean;
  onClose: () => void;
  user: { id: string; email?: string } | null;
  onUserChange: () => void;
}

export default function AuthModal({ open, onClose, user, onUserChange }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const fn = mode === "signin" ? signInWithEmail : signUpWithEmail;
    const res = await fn(email.trim(), password);
    setBusy(false);
    if (res.ok) {
      setMessage({ kind: "ok", text: mode === "signin" ? "登录成功" : res.message });
      onUserChange();
      if (mode === "signin") setTimeout(onClose, 600);
    } else {
      setMessage({ kind: "err", text: res.message });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onUserChange();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl bg-white border border-[rgba(26,26,26,0.08)] shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#1a1a1a]">
            {user ? "账号" : mode === "signin" ? "登录" : "注册"}
          </h3>
          <button onClick={onClose} className="text-[rgba(26,26,26,0.45)] hover:text-[#1a1a1a] text-sm">✕</button>
        </div>

        {user ? (
          <div className="space-y-3">
            <p className="text-xs text-[rgba(26,26,26,0.7)]">已登录：{user.email || "匿名用户"}</p>
            <p className="text-[0.7rem] text-[rgba(26,26,26,0.5)]">
              学习进度已开启云端同步，换设备登录同一账号即可继续。
            </p>
            <button
              onClick={handleSignOut}
              className="w-full py-2 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
            >
              退出登录
            </button>
          </div>
        ) : !isSupabaseConfigured ? (
          <div className="space-y-3">
            <p className="text-xs text-[rgba(26,26,26,0.7)] leading-relaxed">
              云端账号尚未启用。在 <code className="font-mono text-[0.7rem] bg-[#f1efe8] px-1 rounded">.env</code> 中填入
              <code className="font-mono text-[0.7rem] bg-[#f1efe8] px-1 rounded">VITE_SUPABASE_URL</code> 与
              <code className="font-mono text-[0.7rem] bg-[#f1efe8] px-1 rounded">VITE_SUPABASE_ANON_KEY</code> 后重新构建即可开通。
            </p>
            <button onClick={onClose} className="w-full py-2 rounded-lg bg-[#f1efe8] text-xs font-medium text-[#1a1a1a] hover:bg-[#e6e3da] transition-colors">
              知道了
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-1 mb-1">
              <button
                type="button"
                onClick={() => { setMode("signin"); setMessage(null); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === "signin" ? "bg-[#1a1a1a] text-white" : "bg-[#f1efe8] text-[rgba(26,26,26,0.6)]"}`}
              >
                登录
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setMessage(null); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${mode === "signup" ? "bg-[#1a1a1a] text-white" : "bg-[#f1efe8] text-[rgba(26,26,26,0.6)]"}`}
              >
                注册
              </button>
            </div>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱"
              className="w-full px-3 py-2 rounded-lg border border-[rgba(26,26,26,0.15)] text-xs outline-none focus:border-[#2563eb] bg-white"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码（至少 6 位）"
              className="w-full px-3 py-2 rounded-lg border border-[rgba(26,26,26,0.15)] text-xs outline-none focus:border-[#2563eb] bg-white"
            />

            {message && (
              <p className={`text-[0.7rem] leading-relaxed ${message.kind === "ok" ? "text-emerald-700" : "text-[#be123c]"}`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2 rounded-lg bg-[#1a1a1a] text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {busy ? "处理中…" : mode === "signin" ? "登录并同步进度" : "创建账号"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
