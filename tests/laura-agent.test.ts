import { expect, test } from "vitest";
import { lauraAgent, lauraTools } from "../lib/laura-agent";

const appUrl = "https://laura.example";
const secretId = "secret-1";

// The spec's tool table: the fields each tool carries besides `call_id`; `?` marks an optional field.
const specTable = {
  log_wellbeing: ["quote", "aspect"],
  log_remark: ["quote"],
  record_dose: ["quote", "medication", "status"],
  log_reading: ["quote", "systolic", "diastolic", "pulse?"],
  add_errand: ["quote", "item"],
  pass_on: ["quote"],
  end_call_summary: ["summary"],
};

test("the seven tools carry exactly the fields in the spec's table", () => {
  const tools = Object.fromEntries(
    lauraTools({ appUrl, secretId }).map((tool) => {
      const body = tool.api_schema.request_body_schema;
      const fields = Object.keys(body.properties)
        .filter((name) => name !== "call_id")
        .map((name) => (body.required.includes(name) ? name : `${name}?`));
      return [tool.name, fields];
    }),
  );

  expect(tools).toEqual(specTable);
});

test("each tool posts to its own webhook path with the secret header", () => {
  for (const tool of lauraTools({ appUrl, secretId })) {
    expect(tool.type).toBe("webhook");
    expect(tool.api_schema.url).toBe(`https://laura.example/api/tools/${tool.name}`);
    expect(tool.api_schema.method).toBe("POST");
    expect(tool.api_schema.request_headers).toEqual({ "x-laura-secret": { secret_id: "secret-1" } });
  }
});

test("call_id is bound to the per-call variable, never filled by the language model", () => {
  for (const tool of lauraTools({ appUrl, secretId })) {
    const body = tool.api_schema.request_body_schema;
    expect(body.properties.call_id).toEqual({ type: "string", dynamic_variable: "call_id" });
    expect(body.required).toContain("call_id");
  }
});

test("the language model is told the allowed values for aspect and Dose status", () => {
  const field = (tool: string, name: string) =>
    lauraTools({ appUrl, secretId }).find((t) => t.name === tool)!.api_schema.request_body_schema.properties[name];

  expect(field("log_wellbeing", "aspect").enum).toEqual(["general", "sleep"]);
  expect(field("record_dose", "status").enum).toEqual(["taken on call", "says taken earlier", "not taken"]);
});

test("the voice, language model and turn settings are the spec's", () => {
  const { name, conversation_config: config } = lauraAgent({ voiceId: "ivy-voice", toolIds: ["tool-1", "tool-2"] });

  expect(name).toBe("Laura");
  expect(config.tts).toEqual({ model_id: "eleven_v4_turbo", voice_id: "ivy-voice" });
  expect(config.agent.prompt.llm).toBe("claude-sonnet-5-5");
  expect(config.agent.prompt.tool_ids).toEqual(["tool-1", "tool-2"]);
  expect(Object.keys(config.agent.prompt.built_in_tools).sort()).toEqual(["end_call", "skip_turn"]);
  expect(config.turn).toMatchObject({ turn_timeout: 30, silence_end_call_timeout: -1 });
  expect(config.conversation.max_duration_seconds).toBe(15 * 60);
});

test("the per-call variables are the spec's list, and every one Laura uses has a placeholder", () => {
  const { agent } = lauraAgent({ voiceId: "ivy-voice", toolIds: [] }).conversation_config;
  const placeholders = Object.keys(agent.dynamic_variables.dynamic_variable_placeholders);
  const used = [...`${agent.first_message} ${agent.prompt.prompt}`.matchAll(/{{(\w+)}}/g)].map(([, name]) => name);

  expect(placeholders.sort()).toEqual([
    "call_id",
    "care_recipient_name",
    "family_carer_name",
    "family_phrase",
    "morning_medications",
    "previous_call_summary",
    "previous_call_when",
    "watch_items",
  ]);
  expect(used.length).toBeGreaterThan(0);
  for (const name of used) expect(placeholders).toContain(name);
});

test("the instructions name every tool Laura can call", () => {
  const { prompt } = lauraAgent({ voiceId: "ivy-voice", toolIds: [] }).conversation_config.agent.prompt;

  for (const tool of [...Object.keys(specTable), "skip_turn", "end_call"]) expect(prompt).toContain(tool);
});
