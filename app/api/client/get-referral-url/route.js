import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログイン情報が取得できませんでした" }, { status: 401 });
  }

  const { data, error: dbError } = await supabase
    .from("users")
    .select("client_invite_url")
    .eq("id", user.id)
    .single();

  if (dbError) {
    return NextResponse.json({ error: "招待URLの取得に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ inviteUrl: data.client_invite_url });
}
