// lib/supabaseRouteClient.js

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * ✅ 既存方式（旧バージョンなど互換のため残す）
 * 使用例: const supabase = createSupabaseRouteClient();
 */
export const createSupabaseRouteClient = () => {
  return createRouteHandlerClient({ cookies });
};

/**
 * ✅ 新方式（Turbopack/Next.js 14以降対応・cookie警告回避）
 * 使用例: const supabase = await createSupabaseRouteClientWithCookies();
 */
export const createSupabaseRouteClientWithCookies = async () => {
  const cookieStore = cookies(); // ここで明示的に取得（同期関数だが非同期互換対応）
  return createRouteHandlerClient({ cookies: () => cookieStore });
};
