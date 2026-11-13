import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Read-only access: the anon key can only select.
export const readClient = () =>
  createClient(
    env("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    { auth: { persistSession: false } },
  );
