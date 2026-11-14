import { DOSE_STATUSES, RATINGS } from "../../../../lib/dashboard";
import { env } from "../../../../lib/env";
import { writeClient } from "../../../../lib/supabase";

// The tool webhook. ElevenLabs posts each tool to /api/tools/<tool name> with only the tool's fields as the body.
type Body = Record<string, unknown>;

const refuse = (message: string, status = 400) => Response.json({ ok: false, message }, { status });

// Writes one Entry carrying her Quote against the Call named by call_id.
async function addEntry(body: Body, kind: string, details: object) {
  if (typeof body.quote !== "string" || !body.quote.trim()) return refuse("quote is required");
  const { error } = await writeClient().from("entries").insert({ call_id: body.call_id, kind, quote: body.quote, details });
  // 23503: no such Call; 22P02: not a Call id at all.
  if (error?.code === "23503" || error?.code === "22P02") return refuse("call_id does not name a call");
  if (error) throw new Error(`Could not record the entry: ${error.message}`);
  return Response.json({ ok: true });
}

// One handler per tool Laura can call.
const TOOLS: Record<string, (body: Body) => Promise<Response>> = {
  // The rating is optional: Laura leaves it out when her answer does not say.
  log_wellbeing: async (body) => {
    if (body.aspect !== "general" && body.aspect !== "sleep") return refuse("aspect must be general or sleep");
    if (body.rating === undefined) return addEntry(body, "wellbeing", { aspect: body.aspect });
    const allowed: readonly string[] = RATINGS[body.aspect];
    if (!allowed.includes(body.rating as string)) return refuse(`rating for ${body.aspect} must be one of: ${allowed.join(", ")}`);
    return addEntry(body, "wellbeing", { aspect: body.aspect, rating: body.rating });
  },
  // Every Remark is about the left leg, the only Watch item without a Reading, so there is no subject field.
  log_remark: async (body) => addEntry(body, "remark", {}),
  record_dose: async (body) => {
    if (!DOSE_STATUSES.some((status) => status === body.status)) return refuse(`status must be one of: ${DOSE_STATUSES.join(", ")}`);
    if (typeof body.medication !== "string") return refuse("medication is required");
    const plan = await writeClient().from("care_plan").select("medications").single();
    if (plan.error) throw new Error(`Could not read the care plan: ${plan.error.message}`);
    const named = body.medication.toLowerCase();
    const medication = plan.data.medications.find((m: { name: string }) => m.name.toLowerCase() === named);
    // 200, not 4xx, so the language model reads the message.
    if (!medication) return Response.json({ ok: false, message: `${body.medication} is not on the care plan. Nothing was recorded.` });
    return addEntry(body, "dose", { medication: medication.name, status: body.status });
  },
  log_reading: async (body) => {
    const { systolic, diastolic, pulse } = body;
    if (!Number.isInteger(systolic) || !Number.isInteger(diastolic)) return refuse("systolic and diastolic must be whole numbers");
    if (pulse != null && !Number.isInteger(pulse)) return refuse("pulse must be a whole number");
    // Pulse is stored only when she gave it.
    return addEntry(body, "reading", pulse == null ? { systolic, diastolic } : { systolic, diastolic, pulse });
  },
  // One Entry per item, with no duplicate detection.
  add_errand: async (body) =>
    typeof body.item === "string" && body.item.trim() ? addEntry(body, "errand", { item: body.item }) : refuse("item is required"),
  // Anything Laura promises to pass on to the Family carer: her words are the whole record.
  pass_on: async (body) => addEntry(body, "pass_on", {}),
  // Laura's words, not a Quote, so they go on the Call rather than in an Entry. Recording them makes the Call done.
  end_call_summary: async (body) => {
    if (typeof body.summary !== "string" || !body.summary.trim()) return refuse("summary is required");
    const { data, error } = await writeClient()
      .from("calls")
      .update({ summary: body.summary, status: "done" })
      .eq("id", body.call_id)
      .select("id");
    // 22P02: not a Call id at all; no row updated: no such Call.
    if (error?.code === "22P02") return refuse("call_id does not name a call");
    if (error) throw new Error(`Could not record the summary: ${error.message}`);
    if (!data.length) return refuse("call_id does not name a call");
    return Response.json({ ok: true });
  },
};

export async function POST(request: Request, { params }: { params: Promise<{ tool: string }> }) {
  if (request.headers.get("x-laura-secret") !== env("LAURA_WEBHOOK_SECRET")) return refuse("Unauthorised", 401);
  const { tool } = await params;
  if (!Object.hasOwn(TOOLS, tool)) return refuse(`There is no tool called ${tool}`, 404);
  const body = await request.json().catch(() => null);
  if (typeof body?.call_id !== "string") return refuse("call_id is required");
  return TOOLS[tool](body);
}
