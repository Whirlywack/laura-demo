// Creates or updates the Laura agent in ElevenLabs from the files in agent/, assigns her to the
// Peoplefone number and prints her id. Run with `npm run laura-agent` (reads .env.local).
// Safe to re-run: the secret, the tools and the agent are found by exact name and updated in place.
// It never changes the "Ivy test" agent and never places a call.
import { env } from "../lib/env.ts";
import { lauraAgent, lauraTools } from "../lib/laura-agent.ts";

const secretName = "laura_webhook_secret";

// The deployment the seven tools post to, reachable without Vercel's login.
const appUrl = env("LAURA_APP_URL");
const apiKey = env("ELEVENLABS_API_KEY");
const webhookSecret = env("LAURA_WEBHOOK_SECRET");
const phoneNumberId = env("ELEVENLABS_PHONE_NUMBER_ID");

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(`https://api.elevenlabs.io${path}`, {
    method,
    headers: { "xi-api-key": apiKey, "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${path} failed with ${res.status}: ${await res.text()}`);
  return res.json();
}

// ElevenLabs search is not an exact match, so match the name here; two of a name is an error.
function byName(records: any[], name: string, nameOf = (record: any) => record.name) {
  const found = records.filter((record) => nameOf(record) === name);
  if (found.length > 1) throw new Error(`Found ${found.length} records named ${name} in ElevenLabs; expected at most one.`);
  return found[0];
}

// The webhook secret, stored in ElevenLabs; the tools reference it by id in the x-laura-secret header.
const { secrets } = await api("GET", `/v1/convai/secrets?search=${secretName}`);
const secret = byName(secrets, secretName);
const secretBody = { name: secretName, value: webhookSecret };
const secretId: string = secret
  ? (await api("PATCH", `/v1/convai/secrets/${secret.secret_id}`, { type: "update", ...secretBody }), secret.secret_id)
  : (await api("POST", "/v1/convai/secrets", { type: "new", ...secretBody })).secret_id;

// The seven webhook tools.
const { tools } = await api("GET", "/v1/convai/tools?types=webhook&page_size=100");
const toolIds: string[] = [];
for (const tool_config of lauraTools({ appUrl, secretId })) {
  const tool = byName(tools, tool_config.name, (t) => t.tool_config.name);
  const saved = tool
    ? await api("PATCH", `/v1/convai/tools/${tool.id}`, { tool_config })
    : await api("POST", "/v1/convai/tools", { tool_config });
  toolIds.push(saved.id);
}

// The agent.
const { agents } = await api("GET", "/v1/convai/agents?page_size=100");
const agent = lauraAgent({ toolIds });
const laura = byName(agents, agent.name);
const agentId: string = laura
  ? (await api("PATCH", `/v1/convai/agents/${laura.agent_id}`, agent), laura.agent_id)
  : (await api("POST", "/v1/convai/agents/create", agent)).agent_id;

// Assign the agent to the Peoplefone number, changing nothing else on it.
await api("PATCH", `/v1/convai/phone-numbers/${phoneNumberId}`, { agent_id: agentId });

console.log(`${laura ? "Updated" : "Created"} the Laura agent: ${agentId}`);
