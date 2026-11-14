import type { SupabaseClient } from "@supabase/supabase-js";
import { calendarDay, callsWithEntries, dosesOn, medicationsOf, reading, type Call, type Dose, type Entry, type Felt, type Medication, type Reading, type Slept } from "./dashboard";

// The History page: one day per date on her calendar that has a Call that recorded something, Today's included.

/** How far back each range on the History page goes, in days on her calendar, today included. */
export const RANGES = { "1m": 30, "3m": 91, "1y": 365 } as const;
export type Range = keyof typeof RANGES;

/** The range in the address (`?range=3m`); 1 month when it is missing or anything else. */
export const rangeOf = (value: unknown): Range => (value === "3m" || value === "1y" ? value : "1m");

/** One day as the History page shows it: her answers with the rating Laura noted (none on Calls before ratings), her
 * Reading, her words about her left leg, each Dose, and Laura's summary. */
export type HistoryDay = {
  date: string;
  at: string;
  felt: { rating: Felt | null; quote: string | null };
  slept: { rating: Slept | null; quote: string | null };
  reading: Reading | null;
  remark: string | null;
  doses: Dose[];
  summary: string | null;
};

/** "2026-11-14" plus `n` days (or minus), on the calendar, whatever the clocks do. */
export const addDays = (date: string, n: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

// Her answer on one aspect: the latest one on the Call. Entries are newest first.
const answer = <R>(entries: Entry[], aspect: string) => {
  const latest = entries.find((e) => e.kind === "wellbeing" && e.details.aspect === aspect);
  return { rating: (latest?.details.rating as R) ?? null, quote: latest?.quote ?? null };
};

const dayOf = (call: Call, medications: Medication[]): HistoryDay => {
  const latest = (kind: string) => call.entries.find((e) => e.kind === kind);
  const r = latest("reading");
  return {
    date: calendarDay(call.started_at),
    at: call.started_at,
    felt: answer<Felt>(call.entries, "general"),
    slept: answer<Slept>(call.entries, "sleep"),
    reading: r ? reading(r) : null,
    remark: latest("remark")?.quote ?? null,
    doses: dosesOn(call.entries, medications),
    summary: call.summary,
  };
};

/** The last `days` days on her calendar, today included, oldest first. On a day with several Calls (a retry after no
 * answer) it is the latest one that recorded something; a day with none is left out. */
export async function getHistory(db: SupabaseClient, days: number): Promise<HistoryDay[]> {
  const first = addDays(calendarDay(Date.now()), 1 - days);
  const [plan, calls] = await Promise.all([
    db.from("care_plan").select("medications").single(),
    callsWithEntries(db, `${addDays(first, -1)}T00:00:00Z`),
  ]);
  if (plan.error) throw new Error(`Could not read the care plan: ${plan.error.message}`);
  if (calls.error) throw new Error(`Could not read the calls: ${calls.error.message}`);

  const medications = medicationsOf(plan.data);
  const byDate = new Map<string, HistoryDay>();
  for (const call of calls.data) {
    const date = calendarDay(call.started_at);
    if (date >= first && !byDate.has(date) && (call.entries.length || call.summary)) byDate.set(date, dayOf(call, medications));
  }
  return [...byDate.values()].reverse();
}

/** One day's page, with the dates of the days either side that have one; null for a date with none (or not a date).
 * ponytail: reads the whole year to find the neighbours; ask the database by date if that ever gets slow. */
export async function getHistoryDay(db: SupabaseClient, date: string) {
  const days = await getHistory(db, RANGES["1y"]);
  const i = days.findIndex((d) => d.date === date);
  if (i < 0) return null;
  return { day: days[i], before: days[i - 1]?.date ?? null, after: days[i + 1]?.date ?? null };
}
