// app/api/client/update-last-login/route.js
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "認証情報がありません" }), { status: 401 });
  }

  const { error } = await supabase
    .from("users")
    .update({ last_login: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return new Response(JSON.stringify({ error: "ログイン更新に失敗しました" }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
