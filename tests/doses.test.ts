import { beforeAll, expect, test } from "vitest";
import { getDashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";
import { resetSampleData, sendTool, startCall } from "./helpers";

beforeAll(() => {
  resetSampleData();
});

const doses = async () => (await getDashboardState(readClient())).doses;

test.each(["taken on call", "says taken earlier", "not taken"])(
  "a Dose recorded as %s shows that status with her words; the others are not confirmed",
  async (status) => {
    const call_id = await startCall();

    const response = await sendTool("record_dose", { call_id, quote: "The Metoprolol, yes.", medication: "Metoprolol", status });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(await doses()).toEqual([
      { name: "Metoprolol", strength: "47.5 mg, one tablet", timeOfDay: "morning", status, quote: "The Metoprolol, yes." },
      { name: "Sanoral HCT", strength: "40/10/12.5 mg, one tablet", timeOfDay: "morning", status: "not confirmed", quote: null },
      { name: "Eliquis", strength: "2.5 mg, one tablet", timeOfDay: "morning", status: "not confirmed", quote: null },
    ]);
  },
);

test("a Dose arrives on the live feed as a card naming the Medication and its status", async () => {
  const call_id = await startCall();

  await sendTool("record_dose", { call_id, quote: "That one I took with breakfast.", medication: "eliquis", status: "says taken earlier" });

  expect((await getDashboardState(readClient())).feed).toMatchObject([
    { title: "Eliquis · Says taken earlier", quote: "That one I took with breakfast." },
  ]);
});

test("when she corrects herself, the later Entry wins", async () => {
  const call_id = await startCall();

  await sendTool("record_dose", { call_id, quote: "I can't find the Eliquis.", medication: "Eliquis", status: "not taken" });
  await sendTool("record_dose", { call_id, quote: "Found it. Taken.", medication: "Eliquis", status: "taken on call" });

  expect((await doses())[2]).toMatchObject({ name: "Eliquis", status: "taken on call", quote: "Found it. Taken." });
});

test("the Medication is matched against the Care plan ignoring case", async () => {
  const call_id = await startCall();

  const response = await sendTool("record_dose", { call_id, quote: "The sanoral, done.", medication: "sanoral hct", status: "taken on call" });

  expect(await response.json()).toEqual({ ok: true });
  expect((await doses())[1]).toMatchObject({ name: "Sanoral HCT", status: "taken on call", quote: "The sanoral, done." });
});

test("a Medication not on the Care plan writes nothing, and Laura is told it is not on the plan", async () => {
  const call_id = await startCall();

  const response = await sendTool("record_dose", { call_id, quote: "And my aspirin.", medication: "Aspirin", status: "taken on call" });

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: false, message: "Aspirin is not on the care plan. Nothing was recorded." });
  const state = await getDashboardState(readClient());
  expect(state.doses.map((d) => d.status)).toEqual(["not confirmed", "not confirmed", "not confirmed"]);
  expect(state.feed).toEqual([]);
});

test.each([
  ["a status other than the three", { quote: "Yes.", medication: "Eliquis", status: "taken" }],
  ["no status", { quote: "Yes.", medication: "Eliquis" }],
  ["no medication", { quote: "Yes.", status: "taken on call" }],
  ["no quote", { medication: "Eliquis", status: "taken on call" }],
])("a Dose with %s is refused and writes nothing", async (_, fields) => {
  const call_id = await startCall();

  const response = await sendTool("record_dose", { call_id, ...fields });

  expect(response.status).toBe(400);
  const state = await getDashboardState(readClient());
  expect(state.doses.map((d) => d.status)).toEqual(["not confirmed", "not confirmed", "not confirmed"]);
  expect(state.feed).toEqual([]);
});

test("a Dose recorded on an earlier Call is not confirmed on Today's", async () => {
  const earlier = await startCall();
  await sendTool("record_dose", { call_id: earlier, quote: "Taken, yes.", medication: "Eliquis", status: "taken on call" });

  await startCall();

  expect((await doses()).map((d) => d.status)).toEqual(["not confirmed", "not confirmed", "not confirmed"]);
});
