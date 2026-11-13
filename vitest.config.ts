import { execFileSync } from "node:child_process";
import { defineConfig } from "vitest/config";

// Tests run against the local Supabase database (`supabase start`), never the hosted one.
function localSupabase() {
  let out: string;
  try {
    out = execFileSync("supabase", ["status", "-o", "env"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    throw new Error("Local Supabase is not running. Start it with: supabase start");
  }
  const vars = Object.fromEntries(
    [...out.matchAll(/^(\w+)="(.*)"$/gm)].map(([, name, value]) => [name, value]),
  );
  return {
    NEXT_PUBLIC_SUPABASE_URL: vars.API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: vars.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: vars.SERVICE_ROLE_KEY,
    SUPABASE_DB_URL: vars.DB_URL,
  };
}

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    env: localSupabase(),
    fileParallelism: false,
  },
});
