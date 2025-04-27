// app/api/client/get-profile/route.js
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "認証情報が取得できませんでした" }), { status: 401 });
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: clientData, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("uid", user.id)
    .single();

  if (userError || clientError) {
    return new Response(JSON.stringify({ error: "ユーザーデータの取得に失敗しました" }), { status: 500 });
  }

  return new Response(JSON.stringify({ user: userData, client: clientData }), { status: 200 });
}
