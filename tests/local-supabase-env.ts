import { inject } from "vitest";

// Runs before each "db" test file: the local Supabase's address and keys, read once by tests/local-supabase.ts.
declare module "vitest" {
  export interface ProvidedContext {
    localSupabase: Record<string, string>;
  }
}

Object.assign(process.env, inject("localSupabase"));
