import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { POST as tick } from "../app/api/errands/[id]/tick/route";
import { POST } from "../app/api/tools/[tool]/route";

export const resetSampleData = () => execFileSync("node", ["scripts/sample-data.ts"], { stdio: "pipe" });

// A tool call exactly as ElevenLabs sends it: POST /api/tools/<tool>, the secret header, the tool's fields as the body.
export function sendTool(tool: string, body: object, headers: Record<string, string> = { "x-laura-secret": process.env.LAURA_WEBHOOK_SECRET! }) {
  const request = new Request(`http://localhost/api/tools/${tool}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  return POST(request, { params: Promise.resolve({ tool }) });
}

// The Family carer ticking an Errand on the page: POST /api/errands/<id>/tick, with no body.
export function tickErrand(id: string) {
  return tick(new Request(`http://localhost/api/errands/${id}/tick`, { method: "POST" }), { params: Promise.resolve({ id }) });
}

const db = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

// A live Call, which becomes Today. Stands in for Call now until that exists.
// `daysAgo` dates it in the past, for the tablet count's 14-day window.
export async function startCall(daysAgo = 0): Promise<string> {
  const startedAt: { started_at?: string } = daysAgo ? { started_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString() } : {};
  const { data, error } = await db().from("calls").insert(startedAt).select("id").single();
  if (error) throw new Error(`Could not start a call: ${error.message}`);
  return data.id;
}

// Removes every Call and Entry, the sample History included, and keeps the Care plan.
// For tests that need a page with nothing recorded yet.
export async function clearCalls() {
  const { error } = await db().from("calls").delete().not("id", "is", null);
  if (error) throw new Error(`Could not clear the calls: ${error.message}`);
}
