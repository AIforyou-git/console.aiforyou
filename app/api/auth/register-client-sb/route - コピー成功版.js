import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

function generateShortReferralCode() {
  const prefix = "CQ-CLIENT-";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const code = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return prefix + code;
}

function maskEmail(email) {
  const [user, domain] = email.split("@");
  return user.slice(0, 2) + "***@" + domain;
}

export async function POST(req) {
  try {
    const { email, referralCode } = await req.json();

    if (!email || !referralCode) {
      return new Response(JSON.stringify({ error: "メールアドレスと紹介コードは必須です" }), { status: 400 });
    }

    const { data: referral, error: referralError } = await supabaseAdmin
      .from("referral")
      .select("*")
      .eq("code", referralCode)
      .eq("valid", true)
      .maybeSingle();

    if (referralError || !referral) {
      return new Response(JSON.stringify({ error: "紹介コードが無効です" }), { status: 400 });
    }

    if (referral.expires_at && new Date(referral.expires_at) <= new Date()) {
      return new Response(JSON.stringify({ error: "紹介コードの有効期限が切れています" }), { status: 400 });
    }

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
    const referralCodeSelf = generateShortReferralCode();
    const inviteUrl = `https://console.aiforyou.jp/signup-client-sb?ref=${referralCodeSelf}`;

    const { error: dbError } = await supabaseAdmin.from("users").insert({
      id: uid,
      email,
      role: "client",
      referred_by: referralCode,
      status: "pending",
      created_at: new Date().toISOString(),
      client_invite_url: inviteUrl,
    });

    if (dbError) {
      throw new Error("ユーザーデータ保存に失敗しました");
    }

    // ✅ 紹介者のメールアドレスを後から反映（安定構成）
    try {
      const { data: referrerUser, error: referrerError } = await supabaseAdmin
        .from("users")
        .select("email")
        .eq("id", referral.referrer_id)
        .maybeSingle();

      if (referrerUser?.email) {
        await supabaseAdmin
          .from("users")
          .update({ referrer_email: referrerUser.email })
          .eq("id", uid);
      } else {
        console.warn("⚠ 紹介者のメールが取得できませんでした:", referral.referrer_id);
      }
    } catch (refEmailErr) {
      console.error("❌ referrer_email 更新エラー:", refEmailErr.message);
    }

    await supabaseAdmin.from("referral_relations").insert({
      referrer_id: referral.referrer_id,
      referred_id: uid,
      source: `ref=${referralCode}`,
      referred_email_masked: maskEmail(email),
      referred_name: null,
      referred_status: "pending",
    });

    await supabaseAdmin.from("referral").insert({
      code: referralCodeSelf,
      referrer_id: uid,
      referrer_email: email, // ← ここで登録者自身のメールを入れる
      target_role: "client",
      valid: true,
      created_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, tempPassword }), { status: 200 });
  } catch (err) {
    console.error("[REGISTER-CLIENT-SB] エラー:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
