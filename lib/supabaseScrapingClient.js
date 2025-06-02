// lib/supabaseScrapingClient.js
import { createClient } from "@supabase/supabase-js";

const scrapingSupabaseUrl = process.env.NEXT_PUBLIC_SCRAPING_SUPABASE_URL;
const scrapingSupabaseAnonKey = process.env.NEXT_PUBLIC_SCRAPING_SUPABASE_ANON_KEY;

//const scrapingClient = createClient(scrapingSupabaseUrl, scrapingSupabaseAnonKey);//エラー消す為
const scrapingClient = createClient(scrapingSupabaseUrl, scrapingSupabaseAnonKey, {
  auth: {
    storageKey: "supabase.scraping.auth.token", // ✅ メインのセッションと分離
  },
});


//export { supabaseScrapingClient };     // ✅ 名前付きエクスポートを追加
export default scrapingClient;