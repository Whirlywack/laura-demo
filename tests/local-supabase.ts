import { execFileSync } from "node:child_process";
import type { TestProject } from "vitest/node";

// Global setup for the "db" tests: reads the local Supabase's address and keys once (`supabase start`),
// never the hosted project's. It gives up after 10 seconds, so a stopped Docker fails the run at once
// instead of hanging it. tests/local-supabase-env.ts puts the values into process.env for each test file.
export default function setup(project: TestProject) {
  let out: string;
  try {
    out = execFileSync("supabase", ["status", "-o", "env"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 10_000 });
  } catch {
    throw new Error("Local Supabase is not answering. Start Docker, then run: supabase start");
  }
  const vars = Object.fromEntries([...out.matchAll(/^(\w+)="(.*)"$/gm)].map(([, name, value]) => [name, value]));
  project.provide("localSupabase", {
    NEXT_PUBLIC_SUPABASE_URL: vars.API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: vars.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: vars.SERVICE_ROLE_KEY,
    SUPABASE_DB_URL: vars.DB_URL,
  });
}
