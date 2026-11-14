import { beforeEach, expect, test } from "vitest";
import { getDashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";
import { clearCalls, resetSampleData, sendTool, startCall } from "./helpers";

// Every test starts with the Care plan and no Readings, so the earlier ones are only those it makes.
beforeEach(async () => {
  resetSampleData();
  await clearCalls();
});

const dated = { at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/) };

test("the numbers she reads out become Today's Reading and a card on the live feed", async () => {
  const call_id = await startCall();

  const response = await sendTool("log_reading", {
    call_id,
    quote: "One thirty-eight over eighty-two, and the pulse says seventy-one.",
    systolic: 138,
    diastolic: 82,
    pulse: 71,
  });

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
  const state = await getDashboardState(readClient());
  expect(state.bloodPressure).toEqual({
    today: { systolic: 138, diastolic: 82, pulse: 71, quote: "One thirty-eight over eighty-two, and the pulse says seventy-one.", ...dated },
    earlier: [],
  });
  expect(state.feed).toMatchObject([
    { title: "Blood pressure · 138/82, pulse 71", quote: "One thirty-eight over eighty-two, and the pulse says seventy-one." },
  ]);
});

test("when she gives no pulse, none is recorded", async () => {
  const call_id = await startCall();

  await sendTool("log_reading", { call_id, quote: "A hundred and fifty over ninety-five.", systolic: 150, diastolic: 95 });

  const state = await getDashboardState(readClient());
  expect(state.bloodPressure.today).toEqual({ systolic: 150, diastolic: 95, pulse: null, quote: "A hundred and fifty over ninety-five.", ...dated });
  expect(state.feed).toMatchObject([{ title: "Blood pressure · 150/95" }]);
});

test("Readings from earlier Calls sit beneath Today's, newest first, each dated", async () => {
  await sendTool("log_reading", { call_id: await startCall(), quote: "145 over 88.", systolic: 145, diastolic: 88 });
  await sendTool("log_reading", { call_id: await startCall(), quote: "142 over 85, pulse 70.", systolic: 142, diastolic: 85, pulse: 70 });
  const call_id = await startCall();

  await sendTool("log_reading", { call_id, quote: "138 over 82.", systolic: 138, diastolic: 82 });

  expect((await getDashboardState(readClient())).bloodPressure).toEqual({
    today: { systolic: 138, diastolic: 82, pulse: null, quote: "138 over 82.", ...dated },
    earlier: [
      { systolic: 142, diastolic: 85, pulse: 70, quote: "142 over 85, pulse 70.", ...dated },
      { systolic: 145, diastolic: 88, pulse: null, quote: "145 over 88.", ...dated },
    ],
  });
});

test("until she reads out her numbers on Today's Call there is no Reading for today, and the earlier ones still show", async () => {
  await sendTool("log_reading", { call_id: await startCall(), quote: "145 over 88.", systolic: 145, diastolic: 88 });

  await startCall();

  expect((await getDashboardState(readClient())).bloodPressure).toEqual({
    today: null,
    earlier: [{ systolic: 145, diastolic: 88, pulse: null, quote: "145 over 88.", ...dated }],
  });
});

test.each([
  ["no quote", { systolic: 138, diastolic: 82 }],
  ["no systolic", { quote: "Eighty-two.", diastolic: 82 }],
  ["no diastolic", { quote: "One thirty-eight.", systolic: 138 }],
  ["numbers in words", { quote: "One thirty-eight over eighty-two.", systolic: "one thirty-eight", diastolic: "eighty-two" }],
  ["a pulse that is not a whole number", { quote: "138 over 82, pulse about seventy.", systolic: 138, diastolic: 82, pulse: "about seventy" }],
])("a Reading with %s is refused and writes nothing", async (_, fields) => {
  const call_id = await startCall();

  const response = await sendTool("log_reading", { call_id, ...fields });

  expect(response.status).toBe(400);
  expect(await getDashboardState(readClient())).toMatchObject({ bloodPressure: { today: null, earlier: [] }, feed: [] });
});
