import type { SupabaseClient } from "@supabase/supabase-js";

export type CallStatus = "not called yet" | "live" | "done";

export type Medication = { name: string; strength: string; timeOfDay: string };

export type FeedCard = { id: string; title: string; quote: string; at: string };

export type DoseStatus = "not confirmed" | "taken on call" | "says taken earlier" | "not taken";

/** One Medication on Today's Call: what she last said about it, if anything. */
export type Dose = Medication & { status: DoseStatus; quote: string | null };

/** What she said about her left leg, and when. */
export type Remark = { quote: string; at: string };

/** A blood pressure Reading as she read it out. Pulse only when she gave it. */
export type Reading = { systolic: number; diastolic: number; pulse: number | null; quote: string; at: string };

/** Something she is running out of, from any Call. Done once the Family carer has ticked it. */
export type Errand = { id: string; item: string; quote: string; at: string; done: boolean };

/** Something Laura promised to pass on to the Family carer, in her words. */
export type PassOn = { quote: string; at: string };

/** A Call before Today, as the History shows it: when it started, her Wellbeing, her Reading and the Doses. */
export type HistoryCall = {
  at: string;
  wellbeing: { general: string | null; sleep: string | null };
  reading: Reading | null;
  doses: Dose[];
};

export type DashboardState = {
  callStatus: CallStatus;
  /** Laura's summary of Today's Call, in her words. Recorded as she closes the Call; null until then. */
  summary: string | null;
  /** Today's Wellbeing in her own words: the latest Quote for each aspect. */
  wellbeing: { general: string | null; sleep: string | null };
  /** One per Medication on the Care plan, in Care plan order. */
  doses: Dose[];
  /** The latest Remark on Today's Call, and every other Remark beneath it, newest first. */
  leftLeg: { today: Remark | null; earlier: Remark[] };
  /** The latest Reading on Today's Call, and every other Reading beneath it, newest first. */
  bloodPressure: { today: Reading | null; earlier: Reading[] };
  /** Every Errand from every Call, open and done, newest first. */
  errands: Errand[];
  /** The "For Povilas" list: every Pass-on on Today's Call, newest first. */
  passOns: PassOn[];
  /** Every Entry on Today's Call, newest first. */
  feed: FeedCard[];
  carePlan: { medications: Medication[]; watchItems: string[]; familyPhrase: string };
  /** "From the last call:": Laura's summary of the latest Call before Today, where her remembered detail comes from. */
  previousSummary: string | null;
  /** Every Call before Today, newest first. */
  history: HistoryCall[];
  /** Doses taken on call, out of every Dose (Medication × Call) on every Call in the last 14 days, Today included. */
  tabletCount: { confirmed: number; total: number };
};

// `details` holds the kind's own fields, e.g. a Dose's medication and status, or a Reading's numbers.
type Entry = { id: string; call_id: string; kind: string; quote: string; details: Record<string, any>; created_at: string; done_at: string | null };
type Call = { id: string; status: "live" | "done"; summary: string | null; started_at: string; sample: boolean; entries: Entry[] };

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const reading = (e: Entry): Reading => ({
  systolic: e.details.systolic,
  diastolic: e.details.diastolic,
  pulse: e.details.pulse ?? null,
  quote: e.quote,
  at: e.created_at,
});

/** A Reading as recorded, e.g. "138/82, pulse 71". */
export const readingValue = (r: Reading) => `${r.systolic}/${r.diastolic}${r.pulse === null ? "" : `, pulse ${r.pulse}`}`;

// What a feed card says the Entry is.
function feedTitle(entry: Entry) {
  if (entry.kind === "wellbeing") return entry.details.aspect === "sleep" ? "Sleep" : "Today";
  if (entry.kind === "dose") return `${entry.details.medication} · ${sentence(entry.details.status)}`;
  if (entry.kind === "remark") return "Left leg";
  if (entry.kind === "reading") return `Blood pressure · ${readingValue(reading(entry))}`;
  if (entry.kind === "errand") return `Errand added · ${entry.details.item}`;
  if (entry.kind === "pass_on") return "For Povilas";
  return entry.kind;
}

// Her Wellbeing on one Call: the latest Quote for each aspect. Entries are newest first.
function wellbeingOn(entries: Entry[]) {
  const latest = (aspect: string) => entries.find((e) => e.kind === "wellbeing" && e.details.aspect === aspect)?.quote ?? null;
  return { general: latest("general"), sleep: latest("sleep") };
}

// Each Medication's Dose on one Call. Entries are newest first, so the first one found is the latest: it wins.
function dosesOn(entries: Entry[], medications: Medication[]): Dose[] {
  return medications.map((m) => {
    const latest = entries.find((e) => e.kind === "dose" && e.details.medication === m.name);
    return { ...m, status: (latest?.details.status as DoseStatus) ?? "not confirmed", quote: latest?.quote ?? null };
  });
}

// The one function that derives everything the page shows from the three tables.
export async function getDashboardState(db: SupabaseClient): Promise<DashboardState> {
  const [plan, calls] = await Promise.all([
    db.from("care_plan").select("family_phrase, medications, watch_items").single(),
    // Every Call with its Entries, newest first.
    db
      .from("calls")
      .select("id, status, summary, started_at, sample, entries(id, call_id, kind, quote, details, created_at, done_at)")
      .order("started_at", { ascending: false })
      .order("created_at", { referencedTable: "entries", ascending: false })
      .overrideTypes<Call[], { merge: false }>(),
  ]);
  if (plan.error) throw new Error(`Could not read the care plan: ${plan.error.message}`);
  if (calls.error) throw new Error(`Could not read the calls: ${calls.error.message}`);

  // Today is the latest Call (ADR-0001). The sample History is never Today, so before the first Call there is none.
  const today = calls.data.find((c) => !c.sample) ?? null;
  const history = calls.data.filter((c) => c !== today);
  const entries = today?.entries ?? [];
  const everyEntry = calls.data.flatMap((c) => c.entries).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  const medications: Medication[] = plan.data.medications.map((m: { name: string; strength: string; time_of_day: string }) => ({
    name: m.name,
    strength: m.strength,
    timeOfDay: m.time_of_day,
  }));
  // The latest Entry of a kind on Today's Call, and every other one of that kind beneath it.
  const todayAndEarlier = <T>(kind: string, shape: (e: Entry) => T) => {
    const all = everyEntry.filter((e) => e.kind === kind);
    const latest = all.find((e) => e.call_id === today?.id);
    return { today: latest ? shape(latest) : null, earlier: all.filter((e) => e !== latest).map(shape) };
  };

  // The last 14 days on her calendar in Lithuania: today and the 13 days before it. Dates compare as "2026-11-14".
  const calendarDay = (at: string | number) => new Date(at).toLocaleDateString("en-CA", { timeZone: "Europe/Vilnius" });
  const firstDay = calendarDay(Date.now() - 13 * 24 * 60 * 60 * 1000);
  const recentDoses = calls.data.filter((c) => calendarDay(c.started_at) >= firstDay).flatMap((c) => dosesOn(c.entries, medications));

  return {
    callStatus: today?.status ?? "not called yet",
    summary: today?.summary ?? null,
    wellbeing: wellbeingOn(entries),
    doses: dosesOn(entries, medications),
    leftLeg: todayAndEarlier("remark", (e): Remark => ({ quote: e.quote, at: e.created_at })),
    bloodPressure: todayAndEarlier("reading", reading),
    errands: everyEntry
      .filter((e) => e.kind === "errand")
      .map((e) => ({ id: e.id, item: e.details.item, quote: e.quote, at: e.created_at, done: e.done_at !== null })),
    passOns: entries.filter((e) => e.kind === "pass_on").map((e) => ({ quote: e.quote, at: e.created_at })),
    feed: entries.map((e) => ({ id: e.id, title: feedTitle(e), quote: e.quote, at: e.created_at })),
    carePlan: { medications, watchItems: plan.data.watch_items, familyPhrase: plan.data.family_phrase },
    previousSummary: history[0]?.summary ?? null,
    history: history.map((c) => {
      const latestReading = c.entries.find((e) => e.kind === "reading");
      return { at: c.started_at, wellbeing: wellbeingOn(c.entries), reading: latestReading ? reading(latestReading) : null, doses: dosesOn(c.entries, medications) };
    }),
    tabletCount: { confirmed: recentDoses.filter((d) => d.status === "taken on call").length, total: recentDoses.length },
  };
}
