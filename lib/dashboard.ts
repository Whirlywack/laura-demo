import type { SupabaseClient } from "@supabase/supabase-js";

export type CallStatus = "not called yet" | "live" | "done";

export type Medication = { name: string; strength: string; timeOfDay: string };

export type FeedCard = { id: string; title: string; quote: string; at: string };

/** The statuses Laura can record for a Dose, in the order the page lists them. */
export const DOSE_STATUSES = ["taken on call", "says taken earlier", "not taken"] as const;

/** Which answer she gave, as Laura heard it: for how she is, good, okay or bad; for how she slept, well or not well. */
export const RATINGS = { general: ["good", "okay", "bad"], sleep: ["well", "not well"] } as const;
export type Felt = (typeof RATINGS.general)[number];
export type Slept = (typeof RATINGS.sleep)[number];

/** A Dose's status: the latest one Laura recorded, or "not confirmed" until she records one. */
export type DoseStatus = "not confirmed" | (typeof DOSE_STATUSES)[number];

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

/** A Call before Today, as the History shows it: when it started, her Wellbeing, her Reading, the Doses, her left leg
 * and what she asked for (Errand items, in the order she named them). */
export type HistoryCall = {
  at: string;
  wellbeing: { general: string | null; sleep: string | null };
  reading: Reading | null;
  doses: Dose[];
  remark: Remark | null;
  errands: string[];
};

export type DashboardState = {
  callStatus: CallStatus;
  /** When Today's Call started; null before the first Call. */
  todayAt: string | null;
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
  /** Every open Errand, and those ticked done in the last 14 days, newest first. */
  errands: Errand[];
  /** The "For Paul" list: every Pass-on on Today's Call, newest first. */
  passOns: PassOn[];
  /** Every Entry on Today's Call, newest first. */
  feed: FeedCard[];
  carePlan: { medications: Medication[]; watchItems: string[]; familyPhrase: string };
  /** "From the last call:": Laura's summary of the latest Call before Today that has one, where her remembered detail comes from. */
  previousSummary: string | null;
  /** Every Call before Today in the last 14 days, newest first. */
  history: HistoryCall[];
  /** The latest Call before Today and its Entries as feed cards, newest first: the feed before Today's Call starts. */
  lastCall: { at: string; feed: FeedCard[] } | null;
  /** Doses taken on call, out of every Dose (Medication × Call) on every Call in the last 14 days, Today included. */
  tabletCount: { confirmed: number; total: number };
};

// `details` holds the kind's own fields, e.g. a Dose's medication and status, or a Reading's numbers.
export type Entry = { id: string; call_id: string; kind: string; quote: string; details: Record<string, any>; created_at: string; done_at: string | null };
export type Call = { id: string; status: "live" | "done"; summary: string | null; started_at: string; sample: boolean; entries: Entry[] };

/** Every Call started since `since` (an ISO time) with its Entries, newest first, and newest first within each Call. */
export const callsWithEntries = (db: SupabaseClient, since: string) =>
  db
    .from("calls")
    .select("id, status, summary, started_at, sample, entries(id, call_id, kind, quote, details, created_at, done_at)")
    .gte("started_at", since)
    .order("started_at", { ascending: false })
    .order("created_at", { referencedTable: "entries", ascending: false })
    .overrideTypes<Call[], { merge: false }>();

/** The Care plan's Medications, as stored. */
export const medicationsOf = (plan: { medications: { name: string; strength: string; time_of_day: string }[] }): Medication[] =>
  plan.medications.map((m) => ({ name: m.name, strength: m.strength, timeOfDay: m.time_of_day }));

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const reading = (e: Entry): Reading => ({
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
  if (entry.kind === "wellbeing") return entry.details.aspect === "sleep" ? "Sleep" : "How she felt";
  if (entry.kind === "dose") return `${entry.details.medication} · ${sentence(entry.details.status)}`;
  if (entry.kind === "remark") return "Left leg";
  if (entry.kind === "reading") return `Blood pressure · ${readingValue(reading(entry))}`;
  if (entry.kind === "errand") return `Errand added · ${entry.details.item}`;
  if (entry.kind === "pass_on") return "For Paul";
  return entry.kind;
}

const feedCard = (e: Entry): FeedCard => ({ id: e.id, title: feedTitle(e), quote: e.quote, at: e.created_at });

// Her Wellbeing on one Call: the latest Quote for each aspect. Entries are newest first.
function wellbeingOn(entries: Entry[]) {
  const latest = (aspect: string) => entries.find((e) => e.kind === "wellbeing" && e.details.aspect === aspect)?.quote ?? null;
  return { general: latest("general"), sleep: latest("sleep") };
}

// Each Medication's Dose on one Call. Entries are newest first, so the first one found is the latest: it wins.
export function dosesOn(entries: Entry[], medications: Medication[]): Dose[] {
  return medications.map((m) => {
    const latest = entries.find((e) => e.kind === "dose" && e.details.medication === m.name);
    return { ...m, status: (latest?.details.status as DoseStatus) ?? "not confirmed", quote: latest?.quote ?? null };
  });
}

/** The date on her calendar in Lithuania, e.g. "2026-11-14". Dates compare as strings. */
export const calendarDay = (at: string | number) => new Date(at).toLocaleDateString("en-CA", { timeZone: "Europe/Vilnius" });

/** "2026-11-14" plus `n` days (or minus), on the calendar, whatever the clocks do. */
export const addDays = (date: string, n: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

/**
 * The Call Laura remembers: the latest Call with a summary, other than Today when its id is given.
 * A Call nobody answered has no summary, so Laura still remembers the one before it.
 * Call now gives Laura this summary, and the Care plan shows it as "From the last call:".
 */
export async function previousCall(db: SupabaseClient, today?: string): Promise<{ summary: string; started_at: string } | null> {
  let query = db.from("calls").select("summary, started_at").not("summary", "is", null);
  if (today) query = query.neq("id", today);
  const { data, error } = await query.order("started_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error(`Could not read the previous call: ${error.message}`);
  return data;
}

// The one function that derives everything the page shows from the three tables. It reads the last 14 days on her
// calendar in Lithuania, today and the 13 days before it: the History page (lib/history.ts) holds the rest.
export async function getDashboardState(db: SupabaseClient): Promise<DashboardState> {
  const firstDay = addDays(calendarDay(Date.now()), -13);
  // A day's margin either side of her midnight; the exact cut is by her calendar, below.
  const since = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
  const [plan, recent, errandEntries] = await Promise.all([
    db.from("care_plan").select("family_phrase, medications, watch_items").single(),
    callsWithEntries(db, since),
    // An Errand stays on the list until Paul ticks it, however old, and as done for 14 days after he ticks it.
    db.from("entries").select("id, quote, details, created_at, done_at").eq("kind", "errand").or(`done_at.is.null,done_at.gte.${since}`).order("created_at", { ascending: false }),
  ]);
  if (plan.error) throw new Error(`Could not read the care plan: ${plan.error.message}`);
  if (recent.error) throw new Error(`Could not read the calls: ${recent.error.message}`);
  if (errandEntries.error) throw new Error(`Could not read the errands: ${errandEntries.error.message}`);
  const calls = recent.data.filter((c) => calendarDay(c.started_at) >= firstDay);

  // Today is the latest Call (ADR-0001). The sample History is never Today, so before the first Call there is none.
  const today = calls.find((c) => !c.sample) ?? null;
  const history = calls.filter((c) => c !== today);
  const previous = await previousCall(db, today?.id);
  const entries = today?.entries ?? [];
  const everyEntry = calls.flatMap((c) => c.entries).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  const medications = medicationsOf(plan.data);
  // The latest Entry of a kind on Today's Call, and every other one of that kind beneath it.
  const todayAndEarlier = <T>(kind: string, shape: (e: Entry) => T) => {
    const all = everyEntry.filter((e) => e.kind === kind);
    const latest = all.find((e) => e.call_id === today?.id);
    return { today: latest ? shape(latest) : null, earlier: all.filter((e) => e !== latest).map(shape) };
  };

  const recentDoses = calls.flatMap((c) => dosesOn(c.entries, medications));

  return {
    callStatus: today?.status ?? "not called yet",
    todayAt: today?.started_at ?? null,
    summary: today?.summary ?? null,
    wellbeing: wellbeingOn(entries),
    doses: dosesOn(entries, medications),
    leftLeg: todayAndEarlier("remark", (e): Remark => ({ quote: e.quote, at: e.created_at })),
    bloodPressure: todayAndEarlier("reading", reading),
    errands: errandEntries.data
      .filter((e) => e.done_at === null || calendarDay(e.done_at) >= firstDay)
      .map((e) => ({ id: e.id, item: e.details.item, quote: e.quote, at: e.created_at, done: e.done_at !== null })),
    passOns: entries.filter((e) => e.kind === "pass_on").map((e) => ({ quote: e.quote, at: e.created_at })),
    feed: entries.map(feedCard),
    carePlan: { medications, watchItems: plan.data.watch_items, familyPhrase: plan.data.family_phrase },
    previousSummary: previous?.summary ?? null,
    history: history.map((c) => {
      const latestReading = c.entries.find((e) => e.kind === "reading");
      const latestRemark = c.entries.find((e) => e.kind === "remark");
      return {
        at: c.started_at,
        wellbeing: wellbeingOn(c.entries),
        reading: latestReading ? reading(latestReading) : null,
        doses: dosesOn(c.entries, medications),
        remark: latestRemark ? { quote: latestRemark.quote, at: latestRemark.created_at } : null,
        errands: c.entries.filter((e) => e.kind === "errand").reverse().map((e) => e.details.item),
      };
    }),
    lastCall: history[0] ? { at: history[0].started_at, feed: history[0].entries.map(feedCard) } : null,
    tabletCount: { confirmed: recentDoses.filter((d) => d.status === "taken on call").length, total: recentDoses.length },
  };
}
