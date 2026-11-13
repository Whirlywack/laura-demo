import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
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

// A live Call, which becomes Today. Stands in for Call now until that exists.
export async function startCall(): Promise<string> {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const { data, error } = await db.from("calls").insert({}).select("id").single();
  if (error) throw new Error(`Could not start a call: ${error.message}`);
  return data.id;
}
