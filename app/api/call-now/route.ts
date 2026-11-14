import { createHash, timingSafeEqual } from "node:crypto";
import { calendarDay, previousCall } from "../../../lib/dashboard";
import { env } from "../../../lib/env";
import { fromAnotherSite, refuseAnotherSite } from "../../../lib/same-origin";
import { writeClient } from "../../../lib/supabase";

// The database has no field for their names; the page says "Paul" too.
const CARE_RECIPIENT = "Lidia";
const FAMILY_CARER = "Paul";

// How long ago a Call was, in the words Laura says: "earlier today", "yesterday", "3 days ago".
// Under 12 hours is "earlier today" even across midnight, so ten minutes ago is never "yesterday".
function howLongAgo(at: string) {
  if (Date.now() - Date.parse(at) < 12 * 60 * 60 * 1000) return "earlier today";
  const days = (Date.parse(calendarDay(Date.now())) - Date.parse(calendarDay(at))) / (24 * 60 * 60 * 1000);
  return days === 0 ? "earlier today" : days === 1 ? "yesterday" : `${days} days ago`;
}

type Medication = { name: string; strength: string; time_of_day: string };

// The site is public, so only someone with the password can ring her phone. Hashing first gives two equal-length
// values, so the comparison takes the same time whatever was typed.
const digest = (text: string) => createHash("sha256").update(text).digest();
async function rightPassword(request: Request, expected: string) {
  const { password } = await request.json().catch(() => ({}));
  return typeof password === "string" && timingSafeEqual(digest(password), digest(expected));
}

// The message is shown on the page.
const refuse = (message: string, status: number) => Response.json({ ok: false, message }, { status });

// Call now: creates the Call as live, which makes it Today (ADR-0001), then has ElevenLabs phone her
// from the Peoplefone number over the SIP trunk.
export async function POST(request: Request) {
  if (fromAnotherSite(request)) return refuseAnotherSite();
  // A site without CALL_NOW_PASSWORD places no calls at all, and says so.
  const expected = process.env.CALL_NOW_PASSWORD;
  if (!expected) return refuse("Calls are switched off on this site.", 503);
  if (!(await rightPassword(request, expected))) return refuse("Wrong password.", 401);
  // Read first, so a missing variable leaves no Call behind. Tests and local checks point ELEVENLABS_API_URL at a fake,
  // so they can never ring her phone; when it is not set, the request goes to ElevenLabs.
  const apiUrl = process.env.ELEVENLABS_API_URL ?? "https://api.elevenlabs.io";
  const apiKey = env("ELEVENLABS_API_KEY");
  const outbound = { agent_id: env("ELEVENLABS_AGENT_ID"), agent_phone_number_id: env("ELEVENLABS_PHONE_NUMBER_ID"), to_number: env("LIDIA_PHONE_NUMBER") };

  const db = writeClient();
  // Before the new Call starts, every Call is earlier, so none is left out as Today.
  const [plan, previous] = await Promise.all([db.from("care_plan").select("family_phrase, medications, watch_items").single(), previousCall(db)]);
  if (plan.error) throw new Error(`Could not read the care plan: ${plan.error.message}`);

  // One Call a minute at most, so a double click or a stranger cannot ring her phone again and again.
  // The database checks and starts the Call in one step (start_call), so two requests at once cannot both get through.
  const started = await db.rpc("start_call");
  if (started.error) throw new Error(`Could not start the call: ${started.error.message}`);
  const call: { id?: string; last_started_at?: string } = started.data;
  if (!call.id) {
    const seconds = Math.max(1, Math.ceil((60_000 - (Date.now() - Date.parse(call.last_started_at!))) / 1000));
    return refuse(`Laura phoned her less than a minute ago. You can call again in ${seconds} ${seconds === 1 ? "second" : "seconds"}.`, 429);
  }

  // What Laura is given before the call. Every one must be sent, as a string, or the call fails as it starts.
  const dynamic_variables = {
    call_id: call.id,
    care_recipient_name: CARE_RECIPIENT,
    family_carer_name: FAMILY_CARER,
    family_phrase: plan.data.family_phrase,
    morning_medications: plan.data.medications
      .filter((m: Medication) => m.time_of_day === "morning")
      .map((m: Medication) => `${m.name} ${m.strength}`)
      .join("; "),
    watch_items: plan.data.watch_items.join("; "),
    previous_call_summary: previous?.summary ?? "none",
    previous_call_when: previous ? howLongAgo(previous.started_at) : "none",
  };

  const response = await fetch(`${apiUrl}/v1/convai/sip-trunk/outbound-call`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify({ ...outbound, conversation_initiation_client_data: { dynamic_variables } }),
  }).catch(() => null);
  // No answer, or a server error on the way (a 502 or 504 from a gateway): the call may have been placed,
  // so the Call stays live for what Laura records, and the next Call replaces it.
  if (!response || response.status >= 500) {
    return refuse("The call may have been placed. If her phone does not ring, you can call again in a minute.", 502);
  }
  const result = await response.json().catch(() => null);
  // A 4xx, or `success` not true: ElevenLabs did not start the call, the phone never rang, so no Call is kept.
  if (!response.ok || result?.success !== true) {
    const removed = await db.from("calls").delete().eq("id", call.id);
    if (removed.error) throw new Error(`Could not remove the call that was not placed: ${removed.error.message}`);
    const said = typeof result?.message === "string" && result.message ? ` ElevenLabs said: ${result.message}` : "";
    return refuse(`The call could not be placed.${said}`, 502);
  }
  return Response.json({ ok: true });
}
