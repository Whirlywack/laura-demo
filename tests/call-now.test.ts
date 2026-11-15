import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { getDashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";
import { callNow, clearCalls, fakeOutboundCall, resetSampleData, sendTool, startCall, type OutboundCall } from "./helpers";

beforeEach(() => {
  resetSampleData();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllEnvs();
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
    family_carer_name: "Paul",
    family_phrase: "Paul loves you a lot.",
    morning_medications: "Concor 5 mg, one tablet; Sanoral HCT 40/10/12.5 mg, one tablet; Eliquis 2.5 mg, one tablet",
    watch_items: "blood pressure; left leg swelling",
    previous_call_summary:
      "Lidia slept badly. Her left leg was swollen by the evening. She took all three tablets on the call.",
    previous_call_when: "yesterday",
  });
  expect((await getDashboardState(readClient())).previousSummary).toBe(variablesSent(sent).previous_call_summary);
});

// startCall dates a Call in days.
const minutesAgo = (n: number) => n / (24 * 60);
const secondsAgo = (n: number) => n / (24 * 60 * 60);

test("a second Call within 60 seconds of the last one started is refused with a message, and the phone is not rung again", async () => {
  const sent = fakeOutboundCall();
  await callNow();

  const response = await callNow();

  expect(response.status).toBe(429);
  expect(await response.json()).toEqual({ ok: false, message: expect.stringMatching(/call again in \d+ seconds?/) });
  expect(sent).toHaveLength(1);
  // The first Call is still Today.
  await sendTool("log_wellbeing", { call_id: variablesSent(sent).call_id, quote: "Hello? Who is it?", aspect: "general" });
  expect((await getDashboardState(readClient())).wellbeing.general).toBe("Hello? Who is it?");
});

// The site is public, so only someone with the password can ring her phone.
test.each([
  ["no password", null],
  ["a wrong password", "guess"],
])("Call now with %s is refused, and the phone is not rung", async (_, password) => {
  const sent = fakeOutboundCall();

  const response = await callNow(undefined, password);

  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({ ok: false, message: expect.stringContaining("password") });
  expect(sent).toHaveLength(0);
  expect(await getDashboardState(readClient())).toMatchObject({ callStatus: "not called yet" });
});

test("a site with no CALL_NOW_PASSWORD refuses every call with a clear message, and the phone is not rung", async () => {
  const sent = fakeOutboundCall();
  vi.stubEnv("CALL_NOW_PASSWORD", "");

  const response = await callNow(undefined, "");

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ ok: false, message: expect.stringContaining("switched off") });
  expect(sent).toHaveLength(0);
  expect(await getDashboardState(readClient())).toMatchObject({ callStatus: "not called yet" });
});

// There is no sign-in, so the page's own Call now is told apart from another site by what the browser says.
test.each([
  ["a page on another site", { "sec-fetch-site": "cross-site" }],
  ["a page with another origin", { origin: "https://elsewhere.example" }],
])("Call now sent from %s is refused, and the phone is not rung", async (_, headers) => {
  const sent = fakeOutboundCall();

  const response = await callNow(headers);

  expect(response.status).toBe(403);
  expect(sent).toHaveLength(0);
  expect(await getDashboardState(readClient())).toMatchObject({ callStatus: "not called yet" });
});

test("two presses of Call now at the same moment ring her phone once: one starts the Call, the other is refused", async () => {
  const sent = fakeOutboundCall();

  const responses = await Promise.all([callNow(), callNow()]);

  expect(responses.map((r) => r.status).sort()).toEqual([200, 429]);
  expect(sent).toHaveLength(1);
  // One Call is Today, and the 13 sample Calls are still the only History.
  expect((await getDashboardState(readClient())).history).toHaveLength(13);
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

test("a Call ten minutes before midnight is \"earlier today\" to Laura, not \"yesterday\"", async () => {
  // 00:05 on 11 November in Vilnius, so the Call ten minutes ago was at 23:55 on the 10th.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-10T22:05:00Z"));
  await clearCalls();
  const lastNight = await startCall(minutesAgo(10));
  await sendTool("end_call_summary", { call_id: lastNight, summary: "Lidia could not sleep and was listening to the radio." });
  const sent = fakeOutboundCall();

  await callNow();

  expect(variablesSent(sent)).toMatchObject({ previous_call_summary: "Lidia could not sleep and was listening to the radio.", previous_call_when: "earlier today" });
});

test("when the last Call was three days ago, Laura is told \"3 days ago\", with that Call's summary", async () => {
  await clearCalls();
  const call_id = await startCall(3);
  await sendTool("end_call_summary", { call_id, summary: "Lidia went to her neighbour's for lunch." });
  const sent = fakeOutboundCall();

  await callNow();

  expect(variablesSent(sent)).toMatchObject({ previous_call_summary: "Lidia went to her neighbour's for lunch.", previous_call_when: "3 days ago" });
});

test("a minute after a Call nobody answered, Call now replaces it, and Laura still remembers yesterday, not the empty Call", async () => {
  await startCall(secondsAgo(90));
  const sent = fakeOutboundCall();

  const response = await callNow();

  expect(response.status).toBe(200);
  expect(variablesSent(sent)).toMatchObject({ previous_call_summary: expect.stringMatching(/slept badly/), previous_call_when: "yesterday" });
  expect((await getDashboardState(readClient())).previousSummary).toBe(variablesSent(sent).previous_call_summary);
});

test.each([
  [
    "says it did not start the call",
    { success: false, message: "The SIP trunk did not answer.", conversation_id: null, sip_call_id: null },
    200,
    "ElevenLabs said: The SIP trunk did not answer.",
  ],
  ["refuses the request", { detail: { status: "invalid_request", message: "to_number is not a phone number" } }, 422, "could not be placed"],
])("if ElevenLabs %s, the page says so, no Call is left behind, and Call now works again at once", async (_, reply, status, message) => {
  fakeOutboundCall(reply, status);

  const response = await callNow();

  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({ ok: false, message: expect.stringContaining(message) });
  expect(await getDashboardState(readClient())).toMatchObject({ callStatus: "not called yet" });

  vi.restoreAllMocks();
  const sent = fakeOutboundCall();
  expect((await callNow()).status).toBe(200);
  expect(sent).toHaveLength(1);
});

test.each([
  ["answers with a server error", { detail: "Gateway Timeout" }, 504],
  ["cannot be reached", new TypeError("fetch failed"), 200],
])("if ElevenLabs %s, the call may have been placed: the page says so, and the Call stays live for what Laura records", async (_, reply, status) => {
  const sent = fakeOutboundCall(reply, status);

  const response = await callNow();

  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({ ok: false, message: expect.stringContaining("may have been placed") });
  expect(await getDashboardState(readClient())).toMatchObject({ callStatus: "live" });
  await sendTool("log_wellbeing", { call_id: variablesSent(sent).call_id, quote: "Hello? Who is it?", aspect: "general" });
  expect((await getDashboardState(readClient())).wellbeing.general).toBe("Hello? Who is it?");
});

test("with no earlier Call at all, the previous summary and when it was are both \"none\"", async () => {
  await clearCalls();
  const sent = fakeOutboundCall();

  await callNow();

  expect(variablesSent(sent)).toMatchObject({ previous_call_summary: "none", previous_call_when: "none" });
});
