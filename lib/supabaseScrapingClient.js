// lib/supabaseScrapingClient.js
import { createClient } from "@supabase/supabase-js";

const scrapingSupabaseUrl = process.env.NEXT_PUBLIC_SCRAPING_SUPABASE_URL;
const scrapingSupabaseAnonKey = process.env.NEXT_PUBLIC_SCRAPING_SUPABASE_ANON_KEY;

const scrapingClient = createClient(scrapingSupabaseUrl, scrapingSupabaseAnonKey);

export default scrapingClient;
