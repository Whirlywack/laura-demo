import { beforeEach, expect, test } from "vitest";
import { getDashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";
import { clearCalls, resetSampleData, sendTool, startCall } from "./helpers";

// Every test starts with the Care plan and no Remarks, so the earlier ones are only those it makes.
beforeEach(async () => {
  resetSampleData();
  await clearCalls();
});

const dated = { at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/) };

test("what she says about her left leg becomes Today's Remark and a card on the live feed", async () => {
  const call_id = await startCall();

  const response = await sendTool("log_remark", { call_id, quote: "It's a little better today, less swollen than yesterday." });

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
  const state = await getDashboardState(readClient());
  expect(state.leftLeg).toEqual({
    today: { quote: "It's a little better today, less swollen than yesterday.", ...dated },
    earlier: [],
  });
  expect(state.feed).toMatchObject([{ title: "Left leg", quote: "It's a little better today, less swollen than yesterday." }]);
});

test("Remarks from earlier Calls sit beneath Today's, newest first, each dated", async () => {
  for (const quote of ["Heavy. The sock leaves a mark.", "Swollen again by evening. I kept it up on the stool."]) {
    await sendTool("log_remark", { call_id: await startCall(), quote });
  }
  const call_id = await startCall();

  await sendTool("log_remark", { call_id, quote: "Less swollen today." });

  expect((await getDashboardState(readClient())).leftLeg).toEqual({
    today: { quote: "Less swollen today.", ...dated },
    earlier: [
      { quote: "Swollen again by evening. I kept it up on the stool.", ...dated },
      { quote: "Heavy. The sock leaves a mark.", ...dated },
    ],
  });
});

test("until she is asked on Today's Call there is no Remark for today, and the earlier ones still show", async () => {
  await sendTool("log_remark", { call_id: await startCall(), quote: "Heavy. The sock leaves a mark." });

  await startCall();

  expect((await getDashboardState(readClient())).leftLeg).toEqual({
    today: null,
    earlier: [{ quote: "Heavy. The sock leaves a mark.", ...dated }],
  });
});

// On a real call she spoke over Laura, ElevenLabs abandoned the tool call, and Laura sent it again.
test("the same Remark sent twice on one Call is recorded once, and the same words about a tablet are still one per tablet", async () => {
  const call_id = await startCall();

  for (let i = 0; i < 2; i++) expect((await sendTool("log_remark", { call_id, quote: "Not that special. No." })).status).toBe(200);
  for (const medication of ["Concor", "Sanoral HCT", "Eliquis"]) await sendTool("record_dose", { call_id, quote: "Taken.", medication, status: "taken on call" });

  const state = await getDashboardState(readClient());
  expect(state.feed.filter((c) => c.title === "Left leg")).toHaveLength(1);
  expect(state.doses.map((d) => d.status)).toEqual(["taken on call", "taken on call", "taken on call"]);
});

test("when she says more about her leg on the same Call, the latest is Today's Remark and the first goes beneath", async () => {
  const call_id = await startCall();

  await sendTool("log_remark", { call_id, quote: "Fine, I think." });
  await sendTool("log_remark", { call_id, quote: "Actually it's a bit puffy by the ankle." });

  expect((await getDashboardState(readClient())).leftLeg).toEqual({
    today: { quote: "Actually it's a bit puffy by the ankle.", ...dated },
    earlier: [{ quote: "Fine, I think.", ...dated }],
  });
});

test.each([
  ["no quote", {}],
  ["an empty quote", { quote: " " }],
])("a Remark with %s is refused and writes nothing", async (_, fields) => {
  const call_id = await startCall();

  const response = await sendTool("log_remark", { call_id, ...fields });

  expect(response.status).toBe(400);
  expect(await getDashboardState(readClient())).toMatchObject({ leftLeg: { today: null, earlier: [] }, feed: [] });
});
