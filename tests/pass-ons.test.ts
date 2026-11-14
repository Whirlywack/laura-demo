import { beforeEach, expect, test } from "vitest";
import { getDashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";
import { resetSampleData, sendTool, startCall } from "./helpers";

// Every test starts with no Pass-ons, so the ones listed are only those it makes.
beforeEach(() => {
  resetSampleData();
});

const dated = { at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/) };

test("what Laura promises to pass on is listed for Povilas and is a card on the live feed", async () => {
  const call_id = await startCall();

  const response = await sendTool("pass_on", { call_id, quote: "Should I take half a tablet?" });

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
  const state = await getDashboardState(readClient());
  expect(state.passOns).toEqual([{ quote: "Should I take half a tablet?", ...dated }]);
  expect(state.feed).toMatchObject([{ title: "For Povilas", quote: "Should I take half a tablet?" }]);
});

test("the list holds every Pass-on from Today's Call, newest first, and none from an earlier Call", async () => {
  await sendTool("pass_on", { call_id: await startCall(), quote: "Is it bad that my ankle is puffy?" });
  const call_id = await startCall();

  await sendTool("pass_on", { call_id, quote: "Should I take half a tablet?" });
  await sendTool("pass_on", { call_id, quote: "Tell him the boiler is making that noise again." });

  expect((await getDashboardState(readClient())).passOns).toEqual([
    { quote: "Tell him the boiler is making that noise again.", ...dated },
    { quote: "Should I take half a tablet?", ...dated },
  ]);
});

test.each([
  ["no quote", {}],
  ["an empty quote", { quote: " " }],
])("a Pass-on with %s is refused and writes nothing", async (_, fields) => {
  const call_id = await startCall();

  const response = await sendTool("pass_on", { call_id, ...fields });

  expect(response.status).toBe(400);
  expect(await getDashboardState(readClient())).toMatchObject({ passOns: [], feed: [] });
});
