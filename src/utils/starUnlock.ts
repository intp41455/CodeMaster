/* CodeMaster (gode) · Star 权益解锁（零依赖，纯前端校验）
 * ============================================================
 * 机制：在 GitHub 仓库 intp41455/gode 点了 star 的用户，在 issue 留言 GitHub 用户名，
 *      由运营侧用 tools/gen-code.py --repo gode 生成解锁码发给用户，
 *      用户在站内输入即解锁「高级板块 · 会员专属」。
 *
 * 安全模型（诚实说明）：
 *   校验采用「FNV-1a 校验和 + 盐」方案，用于防止随手乱输，
 *   不构成密码学级别的授权。真正的门槛是"你得去点个 star"，属荣誉制。
 *
 * 码格式：GD-XXXX-XXXX-XXXX（大写字母 + 数字，去掉易混字符 0 O 1 I L）
 *   - 前 2 位固定 "GD"（与循码的 "CP" 区分：点哪个仓库的 star 解锁哪个站，码不通用）
 *   - 第 3-10 位 = 8 位载荷
 *   - 第 11-14 位 = 基于 (载荷 + 盐) 的 FNV-1a 32bit 校验和
 *
 * 持久化：localStorage['gode_star']
 */

/** gode 仓库地址（领取步骤里展示给用户） */
export const GODE_REPO_URL = "https://github.com/intp41455/gode";
/** 领取解锁码的 issue 预填链接 */
export const GODE_ISSUE_URL =
  "https://github.com/intp41455/gode/issues/new?title=" +
  encodeURIComponent("领取 Star 解锁码") +
  "&body=" +
  encodeURIComponent("我的 GitHub 用户名是：（填在这里，我会发解锁码给你）\n\n感谢支持 🙏");

const STORAGE_KEY = "gode_star";
const SALT = "codemaster-academy-2026";
const PREFIX = "GD";
// 去掉易混字符：0 O 1 I L
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export interface StarState {
  code: string;
  at: number;
}

/* ---------- 校验核心 ---------- */
/**
 * 确定性哈希：FNV-1a 32bit。
 * 关键：必须用 Math.imul 做 32 位精确乘法。普通 `h * 16777619` 会超过 2^53，
 *      双精度浮点丢精度，导致与 Python 发码侧（& 0xFFFFFFFF 精确整数）结果不一致。
 */
function hashPayload(payload: string): string {
  let h = 2166136261 | 0;
  const s = payload + "|" + SALT;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h = h >>> 0;
  let out = "";
  let n = h;
  for (let k = 0; k < 4; k++) {
    out += ALPHABET[n % ALPHABET.length];
    n = Math.floor(n / ALPHABET.length) + 7;
  }
  return out;
}

/** 归一化用户输入：去空格/横杠、转大写 */
export function normalize(raw: string): string {
  return String(raw || "")
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "");
}

/** 校验一个码是否合法（GD + 8 位载荷 + 4 位校验 = 14 字符） */
export function validate(raw: string): boolean {
  const s = normalize(raw);
  if (s.length !== 14) return false;
  if (s.slice(0, 2) !== PREFIX) return false;
  const payload = s.slice(2, 10);
  const check = s.slice(10);
  return check === hashPayload(payload);
}

/* ---------- 状态持久化 ---------- */
function load(): StarState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StarState;
    // 存过的码也要复核一次，避免手改 localStorage 绕过
    if (!parsed || typeof parsed.code !== "string") return null;
    if (!validate(parsed.code)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(state: StarState | null): void {
  try {
    if (!state) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* 隐私模式下 localStorage 可能不可写，忽略 */
  }
}

/** 当前是否已解锁 */
export function isStarUnlocked(): boolean {
  return load() !== null;
}

/** 当前生效的解锁码（未解锁返回 null） */
export function getStarCode(): string | null {
  const s = load();
  return s ? s.code : null;
}

/** 兑换一个码；成功返回 true 并持久化 */
export function redeem(raw: string): boolean {
  const code = normalize(raw);
  if (!validate(code)) return false;
  save({ code, at: Date.now() });
  return true;
}

/** 清除解锁状态（调试 / 用户主动退出） */
export function clearStar(): void {
  save(null);
}

/** 把码格式化成 GD-XXXX-XXXX-XXXX 展示用 */
export function formatCode(raw: string): string {
  const s = normalize(raw);
  if (s.length !== 14) return s;
  return `${s.slice(0, 2)}-${s.slice(2, 6)}-${s.slice(6, 10)}-${s.slice(10)}`;
}
