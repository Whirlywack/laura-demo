import { beforeEach, expect, test } from "vitest";
import { getDashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";
import { resetSampleData, sendTool, startCall } from "./helpers";

beforeEach(() => {
  resetSampleData();
});

const tabletCount = async () => (await getDashboardState(readClient())).tabletCount;

test("before the first Call, the count comes from the sample History: 36 of its 39 Doses were taken on call", async () => {
  expect(await tabletCount()).toEqual({ confirmed: 36, total: 39 });
});

test("Today's Doses count from the moment the Call starts, and only taken on call counts as confirmed", async () => {
  const call_id = await startCall();
  expect(await tabletCount()).toEqual({ confirmed: 36, total: 42 });

  await sendTool("record_dose", { call_id, quote: "There. I've swallowed it.", medication: "Metoprolol", status: "taken on call" });
  expect(await tabletCount()).toEqual({ confirmed: 37, total: 42 });

  await sendTool("record_dose", { call_id, quote: "That one I took with breakfast already.", medication: "Sanoral HCT", status: "says taken earlier" });
  await sendTool("record_dose", { call_id, quote: "I can't find the Eliquis.", medication: "Eliquis", status: "not taken" });
  expect(await tabletCount()).toEqual({ confirmed: 37, total: 42 });
});

test("when she corrects herself, the later Entry is the one counted, so all three taken on call make 39 of 42", async () => {
  const call_id = await startCall();

  await sendTool("record_dose", { call_id, quote: "There. I've swallowed it.", medication: "Metoprolol", status: "taken on call" });
  await sendTool("record_dose", { call_id, quote: "I took that one earlier.", medication: "Sanoral HCT", status: "says taken earlier" });
  await sendTool("record_dose", { call_id, quote: "No, I haven't. Here, I'm taking it now.", medication: "Sanoral HCT", status: "taken on call" });
  await sendTool("record_dose", { call_id, quote: "I can't find the Eliquis.", medication: "Eliquis", status: "not taken" });
  await sendTool("record_dose", { call_id, quote: "Found it. Taken.", medication: "Eliquis", status: "taken on call" });

  expect(await tabletCount()).toEqual({ confirmed: 39, total: 42 });
});

test("a Call more than 14 days ago is not counted", async () => {
  const fortnightAgo = await startCall(14);
  await sendTool("record_dose", { call_id: fortnightAgo, quote: "There. I've swallowed it.", medication: "Metoprolol", status: "taken on call" });
  await startCall();

  expect(await tabletCount()).toEqual({ confirmed: 36, total: 42 });
});
