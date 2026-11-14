import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { vi } from "vitest";
import { POST as callNowRoute } from "../app/api/call-now/route";
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

// What a browser adds to a request the page itself sends. Tests pass other headers to act as another site.
const fromThePage = { origin: "http://localhost", "sec-fetch-site": "same-origin" };

// The Family carer ticking an Errand on the page: POST /api/errands/<id>/tick, with no body.
export function tickErrand(id: string, headers: Record<string, string> = fromThePage) {
  return tick(new Request(`http://localhost/api/errands/${id}/tick`, { method: "POST", headers }), { params: Promise.resolve({ id }) });
}

// Pressing Call now on the page: POST /api/call-now, with no body. Install fakeOutboundCall first.
// Call now from the page, with the password typed in unless a test passes another one (null sends none).
export const callNow = (headers: Record<string, string> = fromThePage, password: string | null = process.env.CALL_NOW_PASSWORD!) =>
  callNowRoute(new Request("http://localhost/api/call-now", { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(password === null ? {} : { password }) }));

// What Call now would have sent to ElevenLabs.
export type OutboundCall = { url: string; apiKey: string | null; body: any };

// The one fake: ElevenLabs's outbound-call request, which would ring a real phone. It answers with `reply`
// with `status`, or throws `reply` when it is an Error, as when ElevenLabs cannot be reached.
// It returns every request Call now would have sent. Requests to the local database go through;
// any other request fails the test. Undo it with vi.restoreAllMocks().
export function fakeOutboundCall(
  reply: object = { success: true, message: "Call started", conversation_id: "conv_test", sip_call_id: "sip_test" },
  status = 200,
) {
  const sent: OutboundCall[] = [];
  const realFetch = globalThis.fetch;
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.origin === new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin) return realFetch(input, init);
    if (url.pathname !== "/v1/convai/sip-trunk/outbound-call") throw new Error(`Unexpected request to ${url}`);
    sent.push({ url: url.toString(), apiKey: new Headers(init?.headers).get("xi-api-key"), body: JSON.parse(String(init?.body)) });
    if (reply instanceof Error) throw reply;
    return Response.json(reply, { status });
  });
  return sent;
}

const db = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

// A live Call put straight into the database, which becomes Today. Call now refuses a second Call within
// 60 seconds, so tests that need several Calls, or a Call in the past, start them here.
// `daysAgo` dates it in the past, for the tablet count's 14-day window; fractions of a day work too.
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
