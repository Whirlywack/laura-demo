import { beforeAll, expect, test } from "vitest";
import { getDashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";
import { resetSampleData, sendTool, startCall } from "./helpers";

beforeAll(() => {
  resetSampleData();
});

test("how she says she is becomes Today's wellbeing line and a card on the live feed", async () => {
  const call_id = await startCall();

  const response = await sendTool("log_wellbeing", {
    call_id,
    quote: "I'm all right. A bit tired, but all right.",
    aspect: "general",
  });

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
  const state = await getDashboardState(readClient());
  expect(state.wellbeing).toEqual({ general: "I'm all right. A bit tired, but all right.", sleep: null });
  expect(state.feed).toMatchObject([{ title: "Today", quote: "I'm all right. A bit tired, but all right." }]);
});

test("sleep is its own line, and the feed shows the newest card first", async () => {
  const call_id = await startCall();

  await sendTool("log_wellbeing", { call_id, quote: "Not bad, thank you.", aspect: "general" });
  await sendTool("log_wellbeing", { call_id, quote: "I woke at four and couldn't get back off.", aspect: "sleep" });

  const state = await getDashboardState(readClient());
  expect(state.wellbeing).toEqual({ general: "Not bad, thank you.", sleep: "I woke at four and couldn't get back off." });
  expect(state.feed).toMatchObject([
    { title: "Sleep", quote: "I woke at four and couldn't get back off." },
    { title: "Today", quote: "Not bad, thank you." },
  ]);
});

// What she said, and which answer it was: good, okay or bad for how she is; well or not well for how she slept.
test("Laura records the rating of each answer as she heard it, and an answer with no rating keeps only her words", async () => {
  const call_id = await startCall();

  await sendTool("log_wellbeing", { call_id, quote: "Good, thank you. The sun is out.", aspect: "general", rating: "good" });
  await sendTool("log_wellbeing", { call_id, quote: "Badly. I kept waking up.", aspect: "sleep", rating: "not well" });
  await sendTool("log_wellbeing", { call_id, quote: "Hard to say, really.", aspect: "general" });

  const { data } = await readClient().from("entries").select("details").eq("call_id", call_id).order("created_at");
  expect(data!.map((e) => e.details)).toEqual([
    { aspect: "general", rating: "good" },
    { aspect: "sleep", rating: "not well" },
    { aspect: "general" },
  ]);
});

test.each([
  ["general", "well"],
  ["sleep", "good"],
  ["general", "fine"],
])("an answer about %s rated %s is refused, and nothing is recorded", async (aspect, rating) => {
  const call_id = await startCall();

  const response = await sendTool("log_wellbeing", { call_id, quote: "Fine.", aspect, rating });

  expect(response.status).toBe(400);
  expect((await getDashboardState(readClient())).wellbeing).toEqual({ general: null, sleep: null });
});

test.each([
  ["no secret header", {}],
  ["the wrong secret", { "x-laura-secret": "guessed" }],
])("a tool call with %s is rejected and writes nothing", async (_, headers) => {
  const call_id = await startCall();

  const response = await sendTool("log_wellbeing", { call_id, quote: "I'm fine.", aspect: "general" }, headers);

  expect(response.status).toBe(401);
  const state = await getDashboardState(readClient());
  expect(state.wellbeing).toEqual({ general: null, sleep: null });
  expect(state.feed).toEqual([]);
});

test("a tool Laura does not have is not found", async () => {
  const call_id = await startCall();

  const response = await sendTool("log_mood", { call_id, quote: "I'm fine." });

  expect(response.status).toBe(404);
});

test.each([
  ["an aspect other than general or sleep", { quote: "I'm fine.", aspect: "mood" }],
  ["no quote", { aspect: "general" }],
  ["an empty quote", { quote: " ", aspect: "general" }],
])("a wellbeing call with %s is refused and writes nothing", async (_, fields) => {
  const call_id = await startCall();

  const response = await sendTool("log_wellbeing", { call_id, ...fields });

  expect(response.status).toBe(400);
  expect(await getDashboardState(readClient())).toMatchObject({ wellbeing: { general: null, sleep: null }, feed: [] });
});

test.each([
  ["a Call that does not exist", "6f1c2a8e-3b4d-4e5f-8a9b-0c1d2e3f4a5b"],
  ["something that is not a Call id", "test-call"],
])("a tool call for %s is refused", async (_, call_id) => {
  const response = await sendTool("log_wellbeing", { call_id, quote: "I'm fine.", aspect: "general" });

  expect(response.status).toBe(400);
});

test("Today is the latest Call: what she said on an earlier Call is not on it", async () => {
  const earlier = await startCall();
  await sendTool("log_wellbeing", { call_id: earlier, quote: "Slept badly, the dog next door.", aspect: "sleep" });

  await startCall();

  const state = await getDashboardState(readClient());
  expect(state.wellbeing).toEqual({ general: null, sleep: null });
  expect(state.feed).toEqual([]);
});
