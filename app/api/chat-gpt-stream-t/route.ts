// app/api/chat-gpt-stream-t/route.ts
import { ChatCompletionRequestMessage } from "openai-edge";
import { openai } from "@/lib/openai";
import { OpenAIStream } from "@/lib/openaiStream"; // ✅ 自作版のインポート

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body.messages || [];

  const systemStruct = messages.find(
    (msg: ChatCompletionRequestMessage & { hidden?: boolean }) =>
      msg.role === "assistant" && msg.hidden
  );

  const visibleMessages = messages.filter(
    (msg: ChatCompletionRequestMessage & { hidden?: boolean }) => !msg.hidden
  );

  // ✅ structured_summary をテンプレ形式に整形
  const formattedStruct = systemStruct?.content
    ? `以下は補助金制度に関する構造化情報です。これをもとに、制度名・対象者・金額・募集期間・目的を簡潔に説明してください（200文字以内）。

【制度名】${extract(systemStruct.content, "タイトル")}
【対象】${extract(systemStruct.content, "対象者")}
【金額】${extract(systemStruct.content, "最大金額")}
【募集期間】${extract(systemStruct.content, "受付期間")}
【目的】${extract(systemStruct.content, "目的")}

※例や前置きは不要です。形式通り、わかりやすく説明してください。`
    : "";

  const gptMessages: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content:
        "あなたは中小企業支援に詳しい制度案内の専門AIです。制度の目的や対象者、金額、募集期間などを元に補助金制度をわかりやすく説明してください。必ず1回の回答は200文字以内に収めてください。",
    },
    ...(formattedStruct
      ? [
          {
            role: "system",
            content: formattedStruct,
          },
        ]
      : []),
    ...visibleMessages,
  ];

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo", // ✅ 軽量モデル
    max_tokens: 200,         // ✅ 文字数制限（日本語換算 約300文字未満）
    messages: gptMessages,
    stream: true,
  });

  const stream = await OpenAIStream(response); // ✅ 自作stream

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}

// ✅ systemStruct.content から情報を抜き出す補助関数
function extract(text: string, label: string): string {
  const regex = new RegExp(`${label}:\\s*(.*)`);
  const match = text.match(regex);
  return match?.[1]?.trim() || "不明";
}
