import { execFileSync } from "node:child_process";
import { expect, test } from "vitest";

// The scripts in scripts/, run as `npm run` runs them. No database: each fails before it connects.
test("the sample-data script names a missing environment variable", () => {
  const env = { PATH: process.env.PATH, NODE_ENV: "test", NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:1" } as const;

  expect(() => execFileSync("node", ["scripts/sample-data.ts"], { env, stdio: "pipe" })).toThrow(
    "Missing environment variable SUPABASE_SERVICE_ROLE_KEY",
  );
});
