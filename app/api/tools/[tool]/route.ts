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
  log_wellbeing: async (body) =>
    body.aspect === "general" || body.aspect === "sleep"
      ? addEntry(body, "wellbeing", { aspect: body.aspect })
      : refuse("aspect must be general or sleep"),
};

export async function POST(request: Request, { params }: { params: Promise<{ tool: string }> }) {
  if (request.headers.get("x-laura-secret") !== env("LAURA_WEBHOOK_SECRET")) return refuse("Unauthorised", 401);
  const { tool } = await params;
  if (!Object.hasOwn(TOOLS, tool)) return refuse(`There is no tool called ${tool}`, 404);
  const body = await request.json().catch(() => null);
  if (typeof body?.call_id !== "string") return refuse("call_id is required");
  return TOOLS[tool](body);
}
