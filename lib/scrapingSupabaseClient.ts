// lib/scrapingSupabaseClient.ts  ※jsも存在するが今後tsに統一していきたい


//import { createClient } from "@supabase/supabase-js";

//const scrapingSupabase = createClient(
//  process.env.NEXT_PUBLIC_SCRAPING_SUPABASE_URL!,
//  process.env.NEXT_PUBLIC_SCRAPING_SUPABASE_ANON_KEY!
//);

//export default scrapingSupabase;

// lib/scrapingSupabaseClient.ts  ※jsも存在するが今後tsに統一していきたい

import { createClient } from "@supabase/supabase-js";

const scrapingSupabase = createClient(
  process.env.NEXT_PUBLIC_SCRAPING_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SCRAPING_SUPABASE_ANON_KEY!,
  {
    auth: {
      storageKey: "supabase.scraping.ts.token", // ✅ 他と競合しないユニークなキー名
    },
  }
);

export default scrapingSupabase;

