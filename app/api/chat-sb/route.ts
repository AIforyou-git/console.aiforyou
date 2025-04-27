// /app/api/chat-sb/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("✅ POST受信", body);

  // 仮返答
  return NextResponse.json({ assistantText: "「質問をうまく認識できませんでした。もう少し詳しく教えてください。e」" });
}
