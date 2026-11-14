import { beforeEach, expect, test } from "vitest";
import { getDashboardState, type DashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";
import { resetSampleData, sendTool, startCall } from "./helpers";

beforeEach(() => {
  resetSampleData();
});

// The date on her calendar in Lithuania, e.g. "2026-11-13".
const calendarDay = (at: string | number) => new Date(at).toLocaleDateString("en-CA", { timeZone: "Europe/Vilnius" });
const daysAgo = (n: number) => calendarDay(Date.now() - n * 24 * 60 * 60 * 1000);

test("before the first Call there is no Today, and History holds one Call a day for about two weeks, back from yesterday", async () => {
  const state = await getDashboardState(readClient());

  expect(state).toMatchObject({ callStatus: "not called yet", summary: null, feed: [] });
  expect(state.history.map((c) => calendarDay(c.at))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(daysAgo));
});

test("every sample Call in History has her Wellbeing, sleep and a status for each Dose, and a Reading on most days", async () => {
  const { history } = await getDashboardState(readClient());

  for (const call of history) {
    expect(call.wellbeing).toEqual({ general: expect.any(String), sleep: expect.any(String) });
    expect(call.doses.map((d) => d.name)).toEqual(["Concor", "Sanoral HCT", "Eliquis"]);
    expect(call.doses.map((d) => d.status)).not.toContain("not confirmed");
  }
  expect(history.filter((c) => c.reading).length).toBeGreaterThanOrEqual(10);
});

test("once the next Call starts, Today's Call moves to the top of History with its Wellbeing, sleep, Reading and Doses", async () => {
  const call_id = await startCall();
  await sendTool("log_wellbeing", { call_id, quote: "I'm all right. A bit tired, but all right.", aspect: "general" });
  await sendTool("log_wellbeing", { call_id, quote: "I woke at four and couldn't get back off.", aspect: "sleep" });
  await sendTool("record_dose", { call_id, quote: "I can't find the Eliquis.", medication: "Eliquis", status: "not taken" });
  await sendTool("record_dose", { call_id, quote: "Found it. Taken.", medication: "eliquis", status: "taken on call" });
  await sendTool("record_dose", { call_id, quote: "I took that one with breakfast.", medication: "Concor", status: "says taken earlier" });
  await sendTool("log_reading", { call_id, quote: "138 over 82, pulse 71.", systolic: 138, diastolic: 82, pulse: 71 });

  await startCall();

  const state = await getDashboardState(readClient());
  expect(state.history).toHaveLength(14);
  expect(state.history[0]).toEqual({
    at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/),
    wellbeing: { general: "I'm all right. A bit tired, but all right.", sleep: "I woke at four and couldn't get back off." },
    reading: { systolic: 138, diastolic: 82, pulse: 71, quote: "138 over 82, pulse 71.", at: expect.any(String) },
    doses: [
      { name: "Concor", strength: "5 mg, one tablet", timeOfDay: "morning", status: "says taken earlier", quote: "I took that one with breakfast." },
      { name: "Sanoral HCT", strength: "40/10/12.5 mg, one tablet", timeOfDay: "morning", status: "not confirmed", quote: null },
      { name: "Eliquis", strength: "2.5 mg, one tablet", timeOfDay: "morning", status: "taken on call", quote: "Found it. Taken." },
    ],
  });
  expect(calendarDay(state.history[0].at)).toBe(daysAgo(0));
  expect(calendarDay(state.history[1].at)).toBe(daysAgo(1));
});

test("before the first Call, the Left leg and Blood pressure areas hold the earlier Remarks and Readings, and a few Errands are done", async () => {
  const state = await getDashboardState(readClient());

  expect(state.leftLeg.today).toBeNull();
  expect(state.leftLeg.earlier.map((r) => calendarDay(r.at))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(daysAgo));
  expect(state.bloodPressure.today).toBeNull();
  expect(state.bloodPressure.earlier).toHaveLength(state.history.filter((c) => c.reading).length);
  expect(state.errands.filter((e) => e.done).length).toBeGreaterThanOrEqual(2);
});

test("re-running the script removes every Call and Entry, rehearsals included, and recreates the same data", async () => {
  const withoutIds = ({ errands, ...state }: DashboardState) => ({ ...state, errands: errands.map(({ id: _, ...e }) => e) });
  const first = withoutIds(await getDashboardState(readClient()));
  const call_id = await startCall();
  await sendTool("log_remark", { call_id, quote: "Rehearsal: the leg is fine." });
  await sendTool("add_errand", { call_id, quote: "Rehearsal: tea.", item: "Tea" });
  await sendTool("end_call_summary", { call_id, summary: "A rehearsal." });
  await startCall();

  resetSampleData();

  expect(withoutIds(await getDashboardState(readClient()))).toEqual(first);
});

test("during Today's Call the last-call summary is still the one before it, and once Today is History it is Today's", async () => {
  const before = (await getDashboardState(readClient())).previousSummary;
  const call_id = await startCall();
  await sendTool("end_call_summary", { call_id, summary: "Lidia slept well for once. She is expecting Ona for coffee." });

  expect((await getDashboardState(readClient())).previousSummary).toBe(before);

  await startCall();

  expect((await getDashboardState(readClient())).previousSummary).toBe("Lidia slept well for once. She is expecting Ona for coffee.");
});

test("Today's Call is not in History while it is Today", async () => {
  await startCall();

  const state = await getDashboardState(readClient());
  expect(state.callStatus).toBe("live");
  expect(state.history.map((c) => calendarDay(c.at))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(daysAgo));
});
