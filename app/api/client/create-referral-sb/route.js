import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 🔒 Admin権限が必要
);

// ランダムな短縮紹介コードを生成
function generateShortReferralCode() {
  const prefix = "CLNT-";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const code = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return prefix + code;
}

export async function POST(req) {
  try {
    const headerList = headers();
    const token = headerList.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return new Response(JSON.stringify({ error: "認証情報が見つかりません" }), { status: 401 });
    }

    // ✅ セッション確認
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser(token);

    if (sessionError || !user) {
      return new Response(JSON.stringify({ error: "認証ユーザーの取得に失敗しました" }), { status: 401 });
    }

    const uid = user.id;

    // ✅ すでに紹介コードが存在するか確認
    const existing = await supabase
      .from("referral")
      .select("code")
      .eq("referrer_id", uid)
      .eq("target_role", "client")
      .maybeSingle();

    if (existing.data?.code) {
      const inviteUrl = `https://console.aiforyou.jp/signup-client-sb?ref=${existing.data.code}`;
      return new Response(JSON.stringify({ success: true, inviteUrl }), { status: 200 });
    }

    // ✅ 新しい紹介コードを生成（短縮形式）
    const referralCode = generateShortReferralCode();
    const inviteUrl = `https://console.aiforyou.jp/signup-client-sb?ref=${referralCode}`;

    // ✅ referral テーブルに挿入
    const { error: insertError } = await supabase.from("referral").insert({
      code: referralCode,
      referrer_id: uid,
      target_role: "client",
      valid: true,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      return new Response(JSON.stringify({ error: "紹介コードの作成に失敗しました" }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, inviteUrl }), { status: 200 });
  } catch (err) {
    console.error("❌ referral 作成エラー:", err.message);
    return new Response(JSON.stringify({ error: "サーバーエラー" }), { status: 500 });
  }
}
