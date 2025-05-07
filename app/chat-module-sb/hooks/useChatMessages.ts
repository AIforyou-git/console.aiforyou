// app/chat-module-sb/hooks/useChatMessages.ts
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Message } from "../types/chat";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useChatMessages(limit: number = 20, keyword: string = "") {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchMessages = async (pageNumber: number, keyword: string) => {
    setLoading(true);
    const from = pageNumber * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .range(from, to);

    if (keyword) {
      query = query.ilike("text", `%${keyword}%`);
    }

    const { data, error } = await query;

    if (!error && data) {
      if (pageNumber === 0) {
        setMessages(data as Message[]);
      } else {
        setMessages((prev) => [...prev, ...(data as Message[])]);
      }
      if (data.length < limit) setHasMore(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    setMessages([]); // clear messages on keyword change
    setPage(0);
    setHasMore(true);
    fetchMessages(0, keyword);
  }, [keyword]);

  useEffect(() => {
    if (page > 0) fetchMessages(page, keyword);
  }, [page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return { messages, loading, loadMore, hasMore };
}
