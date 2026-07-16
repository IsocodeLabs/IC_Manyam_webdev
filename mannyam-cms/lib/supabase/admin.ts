import "server-only";

// WARNING: NEVER import this client in client components!
// This client uses the SUPABASE_SERVICE_ROLE_KEY which bypasses Row Level Security (RLS).
// It must only be used in trusted server-side operations (Server Actions, Route Handlers).

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
