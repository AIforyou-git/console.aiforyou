import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

// 🔧 紹介コード（短縮形式）生成関数
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
    const { email, referralCode } = await req.json();

    if (!email || !referralCode) {
      return new Response(JSON.stringify({ error: "メールアドレスと紹介コードは必須です" }), { status: 400 });
    }

    console.log("📩 email:", email);
    console.log("🔗 referralCode:", referralCode);

    // 🔍 紹介コードのチェック
    const { data: referral, error: referralError } = await supabaseAdmin
      .from("referral")
      .select("*")
      .eq("code", referralCode)
      .eq("valid", true)
      .maybeSingle();

    console.log("📦 referral:", referral);

    if (referralError || !referral) {
      return new Response(JSON.stringify({ error: "紹介コードが無効です" }), { status: 400 });
    }

    // ⏳ 有効期限のチェック（あれば）
    if (referral.expires_at && new Date(referral.expires_at) <= new Date()) {
      return new Response(JSON.stringify({ error: "紹介コードの有効期限が切れています" }), { status: 400 });
    }

    const targetRole = referral.target_role || "user";
    const tempPassword = Math.random().toString(36).slice(-8);

    // 🔐 Supabase Auth 登録
    const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (authError || !user) {
      console.error("Auth Error:", authError);
      throw new Error("Auth登録に失敗しました");
    }

    const uid = user.user.id;

    // ✅ 自分の紹介コード（短縮形式）を生成
    const referralCodeSelf = generateShortReferralCode();
    const inviteUrl = `https://console.aiforyou.jp/signup-client-sb?ref=${referralCodeSelf}`;

    // 🗃️ users テーブルへ登録
    const { error: dbError } = await supabaseAdmin.from("users").insert({
      id: uid,
      email,
      role: targetRole,
      referred_by: referralCode,
      status: "pending",
      created_at: new Date().toISOString(),
      client_invite_url: inviteUrl,
    });

    if (dbError) {
      console.error("DB Error:", dbError);
      throw new Error("ユーザーデータ保存に失敗しました");
    }

    // ✅ referral テーブルにも紹介者として登録（1回だけ）
    await supabaseAdmin.from("referral").insert({
      code: referralCodeSelf,
      referrer_id: uid,
      target_role: "client",
      valid: true,
      created_at: new Date().toISOString(),
    });

    // 📧 メール送信API 呼び出し（nodemailer）
    await fetch(`${process.env.API_BASE_URL}/api/auth/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        tempPassword,
      }),
    });

    return new Response(JSON.stringify({ success: true, uid }), { status: 200 });
  } catch (err) {
    console.error("Fatal Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
