// app/chat-module-sb/components/ChatSessionList.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Session {
  id: string;
  created_at: string;
}

export default function ChatSessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("id, created_at")
        .order("created_at", { ascending: false });

      if (!error) setSessions(data || []);
    };
    fetchSessions();
  }, []);

  return (
    <div className="p-4 border-r w-full md:w-1/4 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">セッション履歴</h2>
      <ul className="space-y-2">
        {sessions.map((session) => (
          <li key={session.id} className="text-sm text-gray-700">
            🗂️ {new Date(session.created_at).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
