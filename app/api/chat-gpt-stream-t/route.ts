// app/api/chat-gpt-stream-t/route.ts
import { ChatCompletionRequestMessage } from "openai-edge";
import { openai } from "@/lib/openai";
import { OpenAIStream } from "@/lib/openaiStream";

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
    ? `以下は補助金に関する構造化された情報です。これをもとに、制度の内容をできるだけやさしく200文字以内で説明してください。

【制度名】${extract(systemStruct.content, "制度名")}
【対象者】${extract(systemStruct.content, "対象者")}
【金額】${extract(systemStruct.content, "支援内容")}
【募集期間】${extract(systemStruct.content, "受付期間")}
【目的】${extract(systemStruct.content, "目的")}

※難しい用語は避け、初めての方でもわかるように工夫してください。申請を考えている方に向けた説明にしてください。`
    : "";

  const gptMessages: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: `あなたは中小企業向け補助金に詳しいサポートAIです。
構造化された情報がある場合、それをもとに初心者にもわかりやすい200文字以内の説明を作成してください。
必要に応じて「申請サポート機能があること」にも軽く触れてください。
専門用語は避け、親しみやすく簡潔に伝えてください。`,
    },
    ...(formattedStruct
      ? [{ role: "system", content: formattedStruct }]
      : []),
    ...visibleMessages,
  ];

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    max_tokens: 300,
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

// ✅ systemStruct.content から情報を抜き出す補助関数
function extract(text: string, label: string): string {
  const regex = new RegExp(`[【】]?${label}[：:\\s]*([^\n]+)`);
  const match = text.match(regex);
  return match?.[1]?.trim() || "情報なし";
}
