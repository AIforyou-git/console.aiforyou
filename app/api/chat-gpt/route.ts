import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { messages } = await req.json(); // ✅ ← textではなく messagesを受け取る

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo", // ✅ 3.5のままでOK
      messages: messages,     // ✅ そのまま流し込む
      temperature: 0.3,       // 🎯 より安定した応答に
    }),
  });

  const data = await res.json();
  const answer = data.choices?.[0]?.message?.content ?? "回答の取得に失敗しました。";
  return NextResponse.json({ answer });
}
