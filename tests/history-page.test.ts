import { beforeEach, expect, test } from "vitest";
import { addDays, getDashboardState } from "../lib/dashboard";
import { getHistory, getHistoryDay } from "../lib/history";
import { readClient } from "../lib/supabase";
import { resetSampleData, sendTool, startCall, tickErrand } from "./helpers";

beforeEach(() => {
  resetSampleData(true);
});

const calendarDay = (at: string | number) => new Date(at).toLocaleDateString("en-CA", { timeZone: "Europe/Vilnius" });
const daysAgo = (n: number) => addDays(calendarDay(Date.now()), -n);

test("after a reset the History page has a year, oldest first, a few days without a Call, every answer with its rating", async () => {
  const year = await getHistory(readClient(), 365);

  expect(year.length).toBeGreaterThan(330);
  expect(year.length).toBeLessThan(364);
  expect(year[0].date >= daysAgo(364)).toBe(true);
  expect(year.at(-1)!.date).toBe(daysAgo(1));
  expect(year.map((d) => d.date)).toEqual([...new Set(year.map((d) => d.date))].sort());
  for (const day of year) {
    expect(["good", "okay", "bad"]).toContain(day.felt.rating);
    expect(["well", "not well"]).toContain(day.slept.rating);
    expect(day.felt.quote && day.slept.quote && day.remark && day.summary).toBeTruthy();
    expect(day.doses).toHaveLength(3);
  }
  expect(year.filter((d) => d.reading).length).toBeGreaterThan(year.length * 0.8);

  const month = await getHistory(readClient(), 30);
  expect(month.every((d) => d.date >= daysAgo(29))).toBe(true);
  expect(month.slice(-13).map((d) => d.date)).toEqual([13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(daysAgo));
});

test("yesterday's page has her words with their ratings, Laura's summary and the day before; nothing after it before Today's Call", async () => {
  const page = await getHistoryDay(readClient(), daysAgo(1));

  expect(page).toMatchObject({
    day: {
      felt: { rating: "okay", quote: "Not too bad. Tired, but I'm up and dressed." },
      slept: { rating: "not well", quote: "Badly. I kept waking up." },
      reading: { systolic: 142, diastolic: 85, pulse: 70 },
      remark: "Swollen again by evening. I kept it up on the stool.",
      summary: "Lidia slept badly. Her left leg was swollen by the evening. She took all three tablets on the call.",
    },
    before: daysAgo(2),
    after: null,
  });
});

test("Today's Call is a day once it records something; a retry nobody answered does not replace it", async () => {
  expect(await getHistoryDay(readClient(), daysAgo(0))).toBeNull();

  const call_id = await startCall();
  await sendTool("log_wellbeing", { call_id, quote: "Good, thank you.", aspect: "general", rating: "good" });
  await sendTool("log_wellbeing", { call_id, quote: "I slept, but I don't know how.", aspect: "sleep" });
  await startCall();

  const today = await getHistoryDay(readClient(), daysAgo(0));
  expect(today?.day).toMatchObject({ felt: { rating: "good", quote: "Good, thank you." }, slept: { rating: null, quote: "I slept, but I don't know how." }, reading: null, summary: null });
  expect(today?.before).toBe(daysAgo(1));
  expect((await getHistoryDay(readClient(), daysAgo(1)))?.after).toBe(daysAgo(0));
});

test("a date with no Call, a date that does not exist, and something that is not a date have no page", async () => {
  const dates = new Set((await getHistory(readClient(), 365)).map((d) => d.date));
  const missing = Array.from({ length: 350 }, (_, i) => daysAgo(i + 14)).find((d) => !dates.has(d))!;

  expect(missing).toBeDefined();
  for (const date of [missing, daysAgo(400), "2026-02-30", "yesterday"]) expect(await getHistoryDay(readClient(), date)).toBeNull();
});

test("the dashboard reads only the last two weeks, but an Errand stays until it is brought, and as done for two weeks after", async () => {
  const call_id = await startCall(20);
  await sendTool("add_errand", { call_id, quote: "Matches, for the stove.", item: "Matches" });
  await sendTool("add_errand", { call_id, quote: "And soap.", item: "Soap" });

  const state = await getDashboardState(readClient());
  expect(state.history.map((c) => calendarDay(c.at))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(daysAgo));
  expect(state.leftLeg.earlier).toHaveLength(13);
  expect(state.errands.filter((e) => !e.done).map((e) => e.item)).toEqual(["Soap", "Matches"]);
  // The sample Errands Paul ticked months ago are gone; the ones from the last two weeks are there.
  expect(state.errands.filter((e) => e.done).every((e) => calendarDay(e.at) >= daysAgo(15))).toBe(true);

  await tickErrand(state.errands.find((e) => e.item === "Matches")!.id);
  const ticked = (await getDashboardState(readClient())).errands.find((e) => e.item === "Matches");
  expect(ticked?.done).toBe(true);
});
