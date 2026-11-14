import { configDefaults, defineConfig } from "vitest/config";

// Two projects:
// - "unit" needs nothing running: Laura's definition and checks over the repo's files (`npm run test:unit`).
// - "db" runs against the local Supabase (`supabase start`), never the hosted one. Its address and keys come from
//   tests/local-supabase.ts, which fails within 10 seconds when Supabase or Docker is not answering.
const unit = ["tests/laura-agent.test.ts", "tests/repo.test.ts"];

export default defineConfig({
  test: {
    projects: [
      { test: { name: "unit", include: unit } },
      {
        test: {
          name: "db",
          include: ["tests/**/*.test.ts"],
          exclude: [...configDefaults.exclude, ...unit],
          globalSetup: ["tests/local-supabase.ts"],
          setupFiles: ["tests/local-supabase-env.ts"],
          fileParallelism: false,
          env: {
            LAURA_WEBHOOK_SECRET: "test-webhook-secret",
            CALL_NOW_PASSWORD: "test-call-now-password",
            // Placeholders, never the real agent, number or key. Call now's request goes to a host that cannot exist
            // (.invalid never resolves), and the tests fake that one request (fakeOutboundCall in tests/helpers.ts).
            ELEVENLABS_API_URL: "https://api.elevenlabs.invalid",
            ELEVENLABS_API_KEY: "test-elevenlabs-key",
            ELEVENLABS_AGENT_ID: "agent_test",
            ELEVENLABS_PHONE_NUMBER_ID: "phnum_test",
            LIDIA_PHONE_NUMBER: "+37000000000",
          },
        },
      },
    ],
  },
});
