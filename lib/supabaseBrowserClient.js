//'use client';

//import { createClient } from '@supabase/supabase-js';

//const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

//export const supabase = createClient(supabaseUrl, supabaseAnonKey);


'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "supabase.client.auth.token", // ✅ 他のクライアントと分離
  },
});
