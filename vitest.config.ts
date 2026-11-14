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
    LAURA_WEBHOOK_SECRET: "test-webhook-secret",
    CALL_NOW_PASSWORD: "test-call-now-password",
    // Placeholders, never the real agent, number or key. Call now's request goes to a host that cannot exist
    // (.invalid never resolves), and the tests fake that one request (fakeOutboundCall in tests/helpers.ts).
    ELEVENLABS_API_URL: "https://api.elevenlabs.invalid",
    ELEVENLABS_API_KEY: "test-elevenlabs-key",
    ELEVENLABS_AGENT_ID: "agent_test",
    ELEVENLABS_PHONE_NUMBER_ID: "phnum_test",
    LIDIA_PHONE_NUMBER: "+37000000000",
  };
}

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    env: localSupabase(),
    fileParallelism: false,
  },
});
