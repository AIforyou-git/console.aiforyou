// lib/openaiStream.ts
export async function OpenAIStream(response: Response): Promise<ReadableStream<Uint8Array>> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
  
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        if (!reader) {
          controller.error("No response body reader.");
          return;
        }
  
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          controller.enqueue(new TextEncoder().encode(chunk));
        }
  
        controller.close();
      },
    });
  
    return stream;
  }
  