// app/chat-module-sb/components/ChatMessage.tsx
import { Message } from "../types/chat";

export default function ChatMessage({ message }: { message: Message }) {
  return (
    <div className={`text-sm p-2 rounded ${message.role === "user" ? "text-right bg-blue-100" : "text-left bg-gray-100"}`}>
      {message.text}
    </div>
  );
}
