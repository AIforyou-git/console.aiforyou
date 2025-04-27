// app/chat-module-sb/page.tsx
"use client";

import ChatClientSB from "./ChatClientSB";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get("aid"); // ✅ URLから ?aid=xxx を取得

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 p-4">
        {/* ✅ ChatClientSB に articleId を props で渡す */}
        <ChatClientSB articleId={articleId} />
      </div>
    </div>
  );
}
