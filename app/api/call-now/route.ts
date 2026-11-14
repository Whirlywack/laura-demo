import { env } from "../../../lib/env";
import { fromAnotherSite, refuseAnotherSite } from "../../../lib/same-origin";
import { writeClient } from "../../../lib/supabase";

// The database has no field for their names; the page says "Povilas" too.
const CARE_RECIPIENT = "Lidia";
const FAMILY_CARER = "Povilas";

// The date on her calendar in Lithuania, e.g. "2026-11-14".
const calendarDay = (at: string | number) => new Date(at).toLocaleDateString("en-CA", { timeZone: "Europe/Vilnius" });

// How long ago a Call was, in the words Laura says: "earlier today", "yesterday", "3 days ago".
function howLongAgo(at: string) {
  const days = (Date.parse(calendarDay(Date.now())) - Date.parse(calendarDay(at))) / (24 * 60 * 60 * 1000);
  return days === 0 ? "earlier today" : days === 1 ? "yesterday" : `${days} days ago`;
}

type Medication = { name: string; strength: string; time_of_day: string };

// The message is shown on the page.
const refuse = (message: string, status: number) => Response.json({ ok: false, message }, { status });

// Call now: creates the Call as live, which makes it Today (ADR-0001), then has ElevenLabs phone her
// from the Peoplefone number over the SIP trunk.
export async function POST(request: Request) {
  if (fromAnotherSite(request)) return refuseAnotherSite();
  // Read first, so a missing variable leaves no Call behind. Tests and local checks point ELEVENLABS_API_URL at a fake,
  // so they can never ring her phone; when it is not set, the request goes to ElevenLabs.
  const apiUrl = process.env.ELEVENLABS_API_URL ?? "https://api.elevenlabs.io";
  const apiKey = env("ELEVENLABS_API_KEY");
  const outbound = { agent_id: env("ELEVENLABS_AGENT_ID"), agent_phone_number_id: env("ELEVENLABS_PHONE_NUMBER_ID"), to_number: env("LIDIA_PHONE_NUMBER") };

  const db = writeClient();
  const [plan, previous] = await Promise.all([
    db.from("care_plan").select("family_phrase, medications, watch_items").single(),
    // The latest Call with a summary: one nobody answered has none, and Laura should still remember the one before.
    // The Care plan's "From the last call:" uses the same rule.
    db.from("calls").select("summary, started_at").not("summary", "is", null).order("started_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (plan.error) throw new Error(`Could not read the care plan: ${plan.error.message}`);
  if (previous.error) throw new Error(`Could not read the previous call: ${previous.error.message}`);

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
    previous_call_summary: previous.data?.summary ?? "none",
    previous_call_when: previous.data ? howLongAgo(previous.data.started_at) : "none",
  };

  // If this request fails outright, the Call stays live: it may have been placed, and the next Call replaces it.
  const response = await fetch(`${apiUrl}/v1/convai/sip-trunk/outbound-call`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify({ ...outbound, conversation_initiation_client_data: { dynamic_variables } }),
  });
  const result = await response.json().catch(() => null);
  // ElevenLabs says in `success` whether it started the call. If it did not, the phone never rang, so no Call is kept.
  if (!response.ok || result?.success !== true) {
    const removed = await db.from("calls").delete().eq("id", call.id);
    if (removed.error) throw new Error(`Could not remove the call that was not placed: ${removed.error.message}`);
    const said = typeof result?.message === "string" && result.message ? ` ElevenLabs said: ${result.message}` : "";
    return refuse(`The call could not be placed.${said}`, 502);
  }
  return Response.json({ ok: true });
}
