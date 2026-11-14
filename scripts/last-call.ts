// Prints Laura's latest call as ElevenLabs saw it (what was said, each tool call and its result, any guardrail
// that fired with its reason, how the call ended) and then what the database recorded for the latest Call.
// Read-only: it reads ElevenLabs with the API key and the database with the anon key.
// Run with `npm run last-call` (reads .env.local); `npm run last-call -- <conversation id>` shows another call.
import { createClient } from "@supabase/supabase-js";
import { env } from "../lib/env.ts";

const apiKey = env("ELEVENLABS_API_KEY");
const agentId = env("ELEVENLABS_AGENT_ID");
const time = (ms: number) => new Date(ms).toLocaleTimeString("en-GB", { timeZone: "Europe/Vilnius" });
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

async function api(path: string) {
  const res = await fetch(`https://api.elevenlabs.io${path}`, { headers: { "xi-api-key": apiKey } });
  if (!res.ok) throw new Error(`GET ${path} failed with ${res.status}: ${await res.text()}`);
  return res.json();
}

// The call, as ElevenLabs saw it.
const id = process.argv[2] ?? (await api(`/v1/convai/conversations?agent_id=${agentId}&page_size=1`)).conversations[0]?.conversation_id;
if (!id) throw new Error("Laura has no conversations yet.");
const call = await api(`/v1/convai/conversations/${id}`);
const meta = call.metadata ?? {};
console.log(`${id} · ${time(meta.start_time_unix_secs * 1000)} · ${clock(meta.call_duration_secs ?? 0)} · ${call.status} · ${meta.termination_reason || "no end reason"} · ${meta.cost ?? "?"} credits`);
for (const turn of call.transcript ?? []) {
  const who = turn.role === "agent" ? "Laura" : "Lidia";
  if (turn.message) console.log(`[${clock(turn.time_in_call_secs)}] ${who}: ${turn.message}`);
  for (const tool of turn.tool_calls ?? []) console.log(`        → ${tool.tool_name} ${tool.params_as_json ?? ""}`);
  for (const result of turn.tool_results ?? []) console.log(`        ← ${result.tool_name} ${result.is_error ? "ERROR " : ""}${String(result.result_value ?? "").slice(0, 160)}`);
  for (const g of turn.triggered_guardrails ?? []) console.log(`        ! guardrail ${g.guardrail_name ?? g.guardrail_type}: ${g.guardrail_details?.rationale ?? ""}`);
}

// What the page shows: the latest Call that is not sample data, with its Entries.
const db = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("NEXT_PUBLIC_SUPABASE_ANON_KEY"), { auth: { persistSession: false } });
const { data, error } = await db
  .from("calls")
  .select("id, status, started_at, summary, entries(kind, quote, details, created_at)")
  .eq("sample", false)
  .order("started_at", { ascending: false })
  .limit(1);
if (error) throw new Error(`Could not read the database: ${error.message}`);
const today = data?.[0];
if (!today) {
  console.log("\nDatabase: no Call today (sample data only).");
} else {
  console.log(`\nDatabase · Call ${today.id.slice(0, 8)} · ${today.status} · started ${time(Date.parse(today.started_at))}`);
  if (today.summary) console.log(`  summary: ${today.summary}`);
  const entries = [...today.entries].sort((a, b) => a.created_at.localeCompare(b.created_at));
  for (const e of entries) console.log(`  ${time(Date.parse(e.created_at))} ${e.kind} ${JSON.stringify(e.details)} “${e.quote}”`);
}
