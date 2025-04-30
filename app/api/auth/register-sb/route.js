import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

const prefixMap = {
  client: "HQ-CLNT-",
  user: "HQ-USER-",
  agency: "HQ-AGE-",
  admin: "HQ-ADMIN-",
};

function generateShortReferralCode(role = "client") {
  const prefix = prefixMap[role] || "HQ-CLNT-";
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
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "認証トークンがありません" }), { status: 401 });
    }

    const { data: { user: authUser }, error: sessionError } = await supabaseAdmin.auth.getUser(token);
    if (sessionError || !authUser) {
      return new Response(JSON.stringify({ error: "認証エラーが発生しました" }), { status: 401 });
    }

    const { email, referralCode, targetRole } = await req.json();

    if (!email || !referralCode || !targetRole) {
      return new Response(JSON.stringify({ error: "全項目必須です" }), { status: 400 });
    }

    if (!["admin", "agency", "user", "client"].includes(targetRole)) {
      return new Response(JSON.stringify({ error: "無効なロールです" }), { status: 400 });
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
    const referralCodeSelf = generateShortReferralCode(targetRole);
    const invitePage = {
      client: "signup-client-sb",
      user: "signup-user-sb",
      agency: "signup-agency-sb",
      admin: "signup-admin-sb",
    }[targetRole] || "signup-client-sb";
    const inviteUrl = `https://console.aiforyou.jp/${invitePage}?ref=${referralCodeSelf}`;

    const status = "pending";

    const { error: dbError } = await supabaseAdmin.from("users").insert({
      id: uid,
      email,
      role: targetRole,
      referred_by: referralCode,
      status,
      created_at: new Date().toISOString(),
      client_invite_url: inviteUrl,
    });

    if (dbError) {
      console.error("🔥 Supabase Insertエラー:", dbError);
      throw new Error("ユーザー情報の保存に失敗しました");
    }

    await supabaseAdmin.from("referral").insert({
      code: referralCodeSelf,
      referrer_id: uid,
      referrer_email: email,
      target_role: targetRole,
      valid: true,
      created_at: new Date().toISOString(),
    });

    await supabaseAdmin.from("referral_relations").insert({
      referrer_id: referral.referrer_id,
      referred_id: uid,
      source: `ref=${referral.code}`,
      referred_email_masked: maskEmail(email),
      referred_name: null,
      referred_status: status,
      created_at: new Date().toISOString(),
    });

    // ✅ ここで referral_relations の referred_status を users.status に同期
    await supabaseAdmin
      .from("referral_relations")
      .update({ referred_status: status })
      .eq("referred_id", uid);

    await fetch(`${process.env.API_BASE_URL}/api/auth/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, tempPassword }),
    });

    return new Response(JSON.stringify({ success: true, uid }), { status: 200 });
  } catch (err) {
    console.error("[REGISTER-SB] Fatal Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
