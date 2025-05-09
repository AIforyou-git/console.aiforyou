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

  const gptMessages: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content:
        "あなたは中小企業支援に詳しい制度案内の専門AIです。わかりやすく、制度の目的や対象者、金額、募集期間などを元に補助金制度を説明してください。",
    },
    ...(systemStruct
      ? [
          {
            role: "system",
            content: `以下は制度に関する構造化情報です。\n${systemStruct.content}`,
          },
        ]
      : []),
    ...visibleMessages,
  ];

  const response = await openai.createChatCompletion({
    model: "gpt-4",
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
