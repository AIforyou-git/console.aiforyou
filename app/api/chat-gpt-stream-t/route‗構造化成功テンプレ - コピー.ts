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
        "あなたは中小企業支援に詳しい制度案内の専門AIです。次の補助金情報をもとに、制度の概要、対象、金額、募集期間などを200文字以内でわかりやすく説明してください。",
    },
    ...(systemStruct
      ? [
          {
            role: "system",
            content: systemStruct.content,
          },
        ]
      : []),
    ...visibleMessages,
  ];

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    max_tokens: 200,
    messages: gptMessages,
    stream: true,
  });

  const stream = await OpenAIStream(response);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
