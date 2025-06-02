// lib/supabaseAdmin.js

//import { createClient } from "@supabase/supabase-js";

// ✅ Supabase 管理者クライアント（Service Role Key 使用）
//const supabaseAdmin = createClient(
//  process.env.NEXT_PUBLIC_SUPABASE_URL,
//  process.env.SUPABASE_SERVICE_ROLE_KEY
//);

// ✅ 名前付きエクスポート（構文維持）
//export { supabaseAdmin };

// lib/supabaseAdmin.js

import { createClient } from "@supabase/supabase-js";

// ✅ Supabase 管理者クライアント（Service Role Key 使用）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      storageKey: "supabase.admin.auth.token", // ✅ 他のクライアントとセッションキーを分離
    },
  }
);

// ✅ 名前付きエクスポート（構文維持）
export { supabaseAdmin };
export default supabaseAdmin;

