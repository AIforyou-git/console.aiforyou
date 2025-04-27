// ✅ signup-next/register-client/route.js
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { nanoid } from "nanoid";

// 紹介URL用コード生成関数
function generateShortReferralCode() {
  const prefix = "CQ-CLIENT-";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const code = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return prefix + code;
}

export async function POST(req) {
  try {
    const { email, referralCode } = await req.json();

    if (!email || !referralCode) {
      return new Response(JSON.stringify({ error: "メールアドレスと紹介コードは必須です" }), { status: 400 });
    }

    // ✅ 紹介コードをチェック（有効性と紹介者のUUID取得）
    const { data: referral, error: referralError } = await supabaseAdmin
      .from("referral")
      .select("referrer_id, code, expires_at, valid")
      .eq("code", referralCode)
      .eq("valid", true)
      .maybeSingle();

    if (referralError || !referral) {
      return new Response(JSON.stringify({ error: "紹介コードが無効です" }), { status: 400 });
    }

    if (referral.expires_at && new Date(referral.expires_at) <= new Date()) {
      return new Response(JSON.stringify({ error: "紹介コードの有効期限が切れています" }), { status: 400 });
    }

    // ✅ Supabase Auth で仮登録（仮パスワードを発行）
    const tempPassword = Math.random().toString(36).slice(-8);
    const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (authError || !user) {
      throw new Error("Auth登録に失敗しました");
    }

    const uid = user.user.id;

    // ✅ 自分用の紹介URLを生成
    const referralCodeSelf = generateShortReferralCode();
    const inviteUrl = `https://console.aiforyou.jp/signup-client-sb?ref=${referralCodeSelf}`;

    // ✅ users テーブルへ登録（紹介元を UUID で保存）
    const { error: insertUserError } = await supabaseAdmin
      .from("users")
      .insert({
        id: uid,
        email,
        role: "client",
        referred_by: referral.referrer_id,
        status: "pending",
        created_at: new Date().toISOString(),
        client_invite_url: inviteUrl,
      });

    if (insertUserError) {
      throw new Error("ユーザー情報の保存に失敗しました");
    }

    // ✅ referral テーブルにも自分の紹介コードを保存
    const { error: insertReferralError } = await supabaseAdmin
      .from("referral")
      .insert({
        code: referralCodeSelf,
        referrer_id: uid,
        target_role: "client",
        valid: true,
        created_at: new Date().toISOString(),
      });

    if (insertReferralError) {
      throw new Error("紹介コードの登録に失敗しました");
    }

    return new Response(JSON.stringify({
      success: true,
      message: "登録に成功しました",
      tempPassword,
    }), { status: 200 });

  } catch (err) {
    console.error("[SIGNUP-NEXT] register-client エラー:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
