import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"; // ✖️ 一旦コメントアウト

function generateAdminReferralCode() {
  const prefix = "HQ-ADMIN-";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const code = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return prefix + code;
}

export async function POST(req) {
  try {
    // 認証スキップ中
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== "admin") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // 仮UIDを直接渡して進める（本番ではここはセッションUID取得に変える）
    const { uid } = await req.json(); // クライアント側で仮にuidを渡す想定

    if (!uid) {
      return NextResponse.json({ error: "UID missing" }, { status: 400 });
    }

    let referralCode;
    let isUnique = false;
    let retryCount = 0;

    while (!isUnique && retryCount < 5) {
      referralCode = generateAdminReferralCode();
      const { data: existingCode } = await supabaseAdmin
        .from("referral")
        .select("id")
        .eq("code", referralCode)
        .single();

      if (!existingCode) {
        isUnique = true;
      } else {
        retryCount++;
      }
    }

    if (!isUnique) {
      return NextResponse.json({ error: "Failed to generate unique code" }, { status: 500 });
    }

    const { error: insertError } = await supabaseAdmin.from("referral").insert({
      code: referralCode,
      referrer_id: uid,
      target_role: "client", // 必要に応じて
      valid: true,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error(insertError);
      return NextResponse.json({ error: "Database insert error" }, { status: 500 });
    }

    return NextResponse.json({ referralCode }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
