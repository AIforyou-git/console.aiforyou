// app/chat-module-sb/api/chat-gpt/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text } = await req.json();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "あなたは親切なAI補助金アシスタントです。" },
        { role: "user", content: text },
      ],
    }),
  });

  const data = await res.json();
  const answer = data.choices?.[0]?.message?.content ?? "回答の取得に失敗しました。";
  return NextResponse.json({ answer });
}
