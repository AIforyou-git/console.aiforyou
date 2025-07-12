//import { createClient } from "@supabase/supabase-js";

//const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

//export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ✅ ここにログ追加
console.log("🔑 Supabase URL:", supabaseUrl);
console.log("🔐 Supabase anon key:", supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "supabase.client.auth.token",
    persistSession: true, // ✅ セッション永続化を明示
  },
});
