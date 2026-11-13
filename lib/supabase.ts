import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Read-only access: the anon key can only select.
export const readClient = () =>
  createClient(
    env("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    { auth: { persistSession: false } },
  );

// Server only: every write goes through the server with the service role key.
export const writeClient = () =>
  createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
