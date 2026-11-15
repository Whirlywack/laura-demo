import { beforeEach, expect, test } from "vitest";
import { getDashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";
import { resetSampleData, sendTool, startCall } from "./helpers";

beforeEach(() => {
  resetSampleData();
});

const summary = "Lidia slept badly, the dog next door kept her up. Her leg is less swollen. She took all three tablets on the call.";

test("Laura's summary is shown for Today and the Call is done; what she said stays on the feed, and the summary is no card of its own", async () => {
  const call_id = await startCall();
  await sendTool("log_wellbeing", { call_id, quote: "I'm all right. A bit tired, but all right.", aspect: "general" });

  const response = await sendTool("end_call_summary", { call_id, summary });

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
  expect(await getDashboardState(readClient())).toMatchObject({
    callStatus: "done",
    summary,
    feed: [{ title: "How she felt", quote: "I'm all right. A bit tired, but all right." }],
  });
});

test("an earlier Call's summary is not Today's: a new Call is live with no summary", async () => {
  await sendTool("end_call_summary", { call_id: await startCall(), summary });

  await startCall();

  expect(await getDashboardState(readClient())).toMatchObject({ callStatus: "live", summary: null });
});

test.each([
  ["no summary", {}],
  ["an empty summary", { summary: " " }],
])("a Call summary with %s is refused and the Call stays live", async (_, fields) => {
  const call_id = await startCall();

  const response = await sendTool("end_call_summary", { call_id, ...fields });

  expect(response.status).toBe(400);
  expect(await getDashboardState(readClient())).toMatchObject({ callStatus: "live", summary: null });
});

test.each([
  ["a Call that does not exist", "6f1c2a8e-3b4d-4e5f-8a9b-0c1d2e3f4a5b"],
  ["something that is not a Call id", "test-call"],
])("a Call summary for %s is refused", async (_, call_id) => {
  const response = await sendTool("end_call_summary", { call_id, summary });

  expect(response.status).toBe(400);
});
