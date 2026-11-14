import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { getDashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";
import { callNow, clearCalls, fakeOutboundCall, resetSampleData, sendTool, startCall, type OutboundCall } from "./helpers";

beforeEach(() => {
  resetSampleData();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("Call now makes Laura phone her: a live Call becomes Today, and every earlier Call stays in History", async () => {
  fakeOutboundCall();

  const response = await callNow();

  expect(response.status).toBe(200);
  const state = await getDashboardState(readClient());
  expect(state).toMatchObject({ callStatus: "live", summary: null, wellbeing: { general: null, sleep: null }, passOns: [], feed: [] });
  expect(state.history).toHaveLength(13);
});

test("it starts the outbound call over the SIP trunk with the agent, the phone number and her number from the environment", async () => {
  const sent = fakeOutboundCall();

  await callNow();

  expect(sent).toHaveLength(1);
  expect(sent[0].url).toBe("https://api.elevenlabs.invalid/v1/convai/sip-trunk/outbound-call");
  expect(sent[0].apiKey).toBe("test-elevenlabs-key");
  expect(sent[0].body).toMatchObject({ agent_id: "agent_test", agent_phone_number_id: "phnum_test", to_number: "+37000000000" });
});

const variablesSent = (sent: OutboundCall[]) => sent[0].body.conversation_initiation_client_data.dynamic_variables;

test("Laura is given every per-call variable as a string, with yesterday's summary, which the Care plan shows too", async () => {
  const sent = fakeOutboundCall();

  await callNow();

  expect(variablesSent(sent)).toEqual({
    call_id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
    care_recipient_name: "Lidia",
    family_carer_name: "Povilas",
    family_phrase: "Povilas says thank you again for the cherry jam.",
    morning_medications: "Metoprolol 47.5 mg, one tablet; Sanoral HCT 40/10/12.5 mg, one tablet; Eliquis 2.5 mg, one tablet",
    watch_items: "blood pressure; left leg swelling",
    previous_call_summary:
      "Lidia slept badly; the wind kept rattling the window. She was looking forward to Ona coming round for coffee. Her left leg was swollen by the evening. She took all three tablets on the call.",
    previous_call_when: "yesterday",
  });
  expect((await getDashboardState(readClient())).previousSummary).toBe(variablesSent(sent).previous_call_summary);
});

test("the call_id Laura is given names Today's Call, so what she records lands on the page", async () => {
  const sent = fakeOutboundCall();
  await callNow();

  await sendTool("log_wellbeing", { call_id: variablesSent(sent).call_id, quote: "I'm all right. A bit tired, but all right.", aspect: "general" });

  expect((await getDashboardState(readClient())).wellbeing.general).toBe("I'm all right. A bit tired, but all right.");
});

// startCall dates a Call in days.
const minutesAgo = (n: number) => n / (24 * 60);
const secondsAgo = (n: number) => n / (24 * 60 * 60);

test("a second Call within 60 seconds of the last one started is refused with a message, and the phone is not rung again", async () => {
  const sent = fakeOutboundCall();
  await callNow();

  const response = await callNow();

  expect(response.status).toBe(429);
  expect(await response.json()).toEqual({ ok: false, message: expect.stringMatching(/^Laura phoned her less than a minute ago\. You can call again in \d+ seconds?\.$/) });
  expect(sent).toHaveLength(1);
  // The first Call is still Today.
  await sendTool("log_wellbeing", { call_id: variablesSent(sent).call_id, quote: "Hello? Who is it?", aspect: "general" });
  expect((await getDashboardState(readClient())).wellbeing.general).toBe("Hello? Who is it?");
});

test("when the last Call was earlier today, Laura is told so, and that Call moves to History", async () => {
  const earlier = await startCall(minutesAgo(5));
  await sendTool("log_wellbeing", { call_id: earlier, quote: "Fine, thank you.", aspect: "general" });
  await sendTool("end_call_summary", { call_id: earlier, summary: "Lidia was baking a honey cake for Ona's visit." });
  const sent = fakeOutboundCall();

  await callNow();

  expect(variablesSent(sent)).toMatchObject({ previous_call_summary: "Lidia was baking a honey cake for Ona's visit.", previous_call_when: "earlier today" });
  const state = await getDashboardState(readClient());
  expect(state).toMatchObject({ callStatus: "live", wellbeing: { general: null } });
  expect(state.history[0].wellbeing.general).toBe("Fine, thank you.");
});

test("a minute after a Call nobody answered, Call now replaces it, and Laura still remembers yesterday, not the empty Call", async () => {
  await startCall(secondsAgo(90));
  const sent = fakeOutboundCall();

  const response = await callNow();

  expect(response.status).toBe(200);
  expect(variablesSent(sent)).toMatchObject({ previous_call_summary: expect.stringMatching(/slept badly/), previous_call_when: "yesterday" });
  expect((await getDashboardState(readClient())).previousSummary).toBe(variablesSent(sent).previous_call_summary);
});

test("if ElevenLabs does not start the call, the page says so, no Call is left behind, and Call now works again at once", async () => {
  fakeOutboundCall({ success: false, message: "The SIP trunk did not answer.", conversation_id: null, sip_call_id: null });

  const response = await callNow();

  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({ ok: false, message: "The call could not be placed. ElevenLabs said: The SIP trunk did not answer." });
  expect(await getDashboardState(readClient())).toMatchObject({ callStatus: "not called yet" });

  vi.restoreAllMocks();
  const sent = fakeOutboundCall();
  expect((await callNow()).status).toBe(200);
  expect(sent).toHaveLength(1);
});

test("with no earlier Call at all, the previous summary and when it was are both \"none\"", async () => {
  await clearCalls();
  const sent = fakeOutboundCall();

  await callNow();

  expect(variablesSent(sent)).toMatchObject({ previous_call_summary: "none", previous_call_when: "none" });
});
