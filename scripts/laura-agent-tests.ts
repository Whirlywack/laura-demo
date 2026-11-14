// Checks Laura's replies with ElevenLabs agent tests: no phone call, roughly 50–150 credits per test run.
// The tests are defined in agent/tests.json and found in ElevenLabs by exact name, so re-running updates them.
// Run with `npm run laura-agent:test` (reads .env.local); `npm run laura-agent:test -- 3` runs each test 3 times,
// and `npm run laura-agent:test -- 5 medical` runs only the tests whose name contains "medical", 5 times each.
// A test passes when its success condition holds and no guardrail fires, or, for "expect": "blocked",
// when a guardrail fires. The tests read Laura's words only: they do not hear the audio.
import { readFileSync } from "node:fs";
import { env } from "../lib/env.ts";

type Test = { name: string; expect?: "blocked"; success_condition: string; chat_history: ["agent" | "user", string][] };
type Run = {
  test_name: string;
  status: string;
  agent_responses?: { message?: string | null }[] | null;
  triggered_guardrails?: { guardrail_name?: string; guardrail_type?: string }[];
  condition_result?: { rationale?: { summary?: string } } | null;
  credits_used?: number | null;
};

const apiKey = env("ELEVENLABS_API_KEY");
const agentId = env("ELEVENLABS_AGENT_ID");
const repeat = Number(process.argv[2] ?? 1);
const only = process.argv[3];
const tests: Test[] = (JSON.parse(readFileSync(new URL("../agent/tests.json", import.meta.url), "utf8")) as Test[]).filter((t) => !only || t.name.includes(only));
if (!tests.length) throw new Error(`No test in agent/tests.json has "${only}" in its name.`);

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(`https://api.elevenlabs.io${path}`, {
    method,
    headers: { "xi-api-key": apiKey, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${path} failed with ${res.status}: ${await res.text()}`);
  return res.json();
}

// Create or update each test by its exact name.
const { tests: existing } = await api("GET", "/v1/convai/agent-testing?search=Laura&page_size=100");
const ids: string[] = [];
for (const test of tests) {
  const body = {
    type: "llm",
    name: test.name,
    success_condition: test.success_condition,
    chat_history: test.chat_history.map(([role, message], i) => ({ role, message, time_in_call_secs: i * 5 })),
  };
  const found = existing.filter((t: { name: string }) => t.name === test.name);
  if (found.length > 1) throw new Error(`Found ${found.length} ElevenLabs tests named ${test.name}; expected at most one.`);
  ids.push(found[0] ? (await api("PUT", `/v1/convai/agent-testing/${found[0].id}`, body), found[0].id) : (await api("POST", "/v1/convai/agent-testing/create", body)).id);
}

// Run them all against Laura's live configuration, and wait for the results.
const invocation = await api("POST", `/v1/convai/agents/${agentId}/run-tests`, { repeat_count: repeat, tests: ids.map((test_id) => ({ test_id })) });
let runs: Run[] = [];
for (let i = 0; i < 72; i++) {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  runs = (await api("GET", `/v1/convai/test-invocations/${invocation.id}`)).test_runs;
  if (runs.every((r) => !["pending", "running"].includes(r.status))) break;
}

let failed = 0;
for (const run of runs) {
  const test = tests.find((t) => t.name === run.test_name);
  const fired = (run.triggered_guardrails ?? []).map((g) => g.guardrail_name ?? g.guardrail_type);
  const ok = test?.expect === "blocked" ? fired.length > 0 : run.status === "passed" && fired.length === 0;
  if (!ok) failed++;
  const said = (run.agent_responses ?? []).map((m) => m.message).filter(Boolean).join(" / ").replace(/\s+/g, " ");
  console.log(`${ok ? "ok  " : "FAIL"} ${run.test_name}${fired.length ? ` | guardrail: ${fired.join(", ")}` : ""}`);
  if (said) console.log(`     said: ${said}`);
  if (!ok && run.condition_result?.rationale?.summary) console.log(`     why: ${run.condition_result.rationale.summary}`);
}
console.log(`${runs.length - failed} of ${runs.length} passed · ${runs.reduce((sum, r) => sum + (r.credits_used ?? 0), 0)} credits`);
process.exitCode = failed ? 1 : 0;
