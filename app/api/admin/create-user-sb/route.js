import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req) {
  try {
    const { email, role } = await req.json();

    if (!email || !role) {
      return new Response(JSON.stringify({ error: "メールアドレスとロールは必須です" }), { status: 400 });
    }

    const tempPassword = Math.random().toString(36).slice(-8);

    // Supabase Auth 登録（管理者）
    const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (authError || !user) throw new Error("Auth登録に失敗しました");

    const uid = user.user.id;

    // users テーブル登録
    const { error: dbError } = await supabaseAdmin.from("users").insert({
      id: uid,
      email,
      role,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    if (dbError) throw new Error("ユーザーデータ保存に失敗しました");

    // （任意）メール送信API 呼び出し
    // await fetch(`${process.env.API_BASE_URL}/api/auth/send-email`, { ... });

    return new Response(JSON.stringify({ success: true, uid }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
