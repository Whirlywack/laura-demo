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

const DOSE_STATUSES = ["taken on call", "says taken earlier", "not taken"];

// One handler per tool Laura can call.
const TOOLS: Record<string, (body: Body) => Promise<Response>> = {
  log_wellbeing: async (body) =>
    body.aspect === "general" || body.aspect === "sleep"
      ? addEntry(body, "wellbeing", { aspect: body.aspect })
      : refuse("aspect must be general or sleep"),
  // Every Remark is about the left leg, the only Watch item without a Reading, so there is no subject field.
  log_remark: async (body) => addEntry(body, "remark", {}),
  record_dose: async (body) => {
    if (!DOSE_STATUSES.includes(body.status as string)) return refuse(`status must be one of: ${DOSE_STATUSES.join(", ")}`);
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
};

export async function POST(request: Request, { params }: { params: Promise<{ tool: string }> }) {
  if (request.headers.get("x-laura-secret") !== env("LAURA_WEBHOOK_SECRET")) return refuse("Unauthorised", 401);
  const { tool } = await params;
  if (!Object.hasOwn(TOOLS, tool)) return refuse(`There is no tool called ${tool}`, 404);
  const body = await request.json().catch(() => null);
  if (typeof body?.call_id !== "string") return refuse("call_id is required");
  return TOOLS[tool](body);
}
