// lib/supabaseRouteClient.js
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const createSupabaseRouteClient = () => {
  return createRouteHandlerClient({ cookies });
};
