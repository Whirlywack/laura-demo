// Builds the Laura agent's ElevenLabs definitions from the files in `agent/`.
// No network here: scripts/laura-agent.ts sends what these return.
import { readFileSync } from "node:fs";

const read = (file: string) => readFileSync(new URL(`../agent/${file}`, import.meta.url), "utf8");

type Field = { type: string; description?: string; enum?: string[]; dynamic_variable?: string };
type Tool = { name: string; description: string; properties: Record<string, Field>; required: string[] };

// One webhook tool per entry in agent/tools.json, posting to /api/tools/<name> with the secret header.
// `call_id` is filled from the per-call variable, so the language model never sees it.
export function lauraTools({ appUrl, secretId }: { appUrl: string; secretId: string }) {
  return (JSON.parse(read("tools.json")) as Tool[]).map((tool) => ({
    type: "webhook",
    name: tool.name,
    description: tool.description,
    api_schema: {
      url: `${appUrl}/api/tools/${tool.name}`,
      method: "POST",
      request_headers: { "x-laura-secret": { secret_id: secretId } },
      request_body_schema: {
        type: "object",
        required: ["call_id", ...tool.required],
        properties: { call_id: { type: "string", dynamic_variable: "call_id" }, ...tool.properties } as Record<string, Field>,
      },
    },
  }));
}

// The agent from agent/agent.json, with agent/instructions.md as its prompt.
// The script passes the ids of the tools it created.
export function lauraAgent({ toolIds }: { toolIds: string[] }) {
  const agent = JSON.parse(read("agent.json"));
  agent.conversation_config.agent.prompt.prompt = read("instructions.md");
  agent.conversation_config.agent.prompt.tool_ids = toolIds;
  return agent;
}
