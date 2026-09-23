// Supabase 客户端初始化
// 凭据来自构建时环境变量 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY。
// 未配置时 supabase 为 null，全站保持匿名模式（进度存本地），功能不受影响。
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export type AuthState = {
  configured: boolean;
  user: { id: string; email?: string } | null;
  loading: boolean;
};
