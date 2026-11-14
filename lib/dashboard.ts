import type { SupabaseClient } from "@supabase/supabase-js";

export type CallStatus = "not called yet" | "live" | "done";

export type Medication = { name: string; strength: string; timeOfDay: string };

export type FeedCard = { id: string; title: string; quote: string; at: string };

export type DoseStatus = "not confirmed" | "taken on call" | "says taken earlier" | "not taken";

/** One Medication on Today's Call: what she last said about it, if anything. */
export type Dose = Medication & { status: DoseStatus; quote: string | null };

/** What she said about her left leg, and when. */
export type Remark = { quote: string; at: string };

export type DashboardState = {
  callStatus: CallStatus;
  /** Today's Wellbeing in her own words: the latest Quote for each aspect. */
  wellbeing: { general: string | null; sleep: string | null };
  /** One per Medication on the Care plan, in Care plan order. */
  doses: Dose[];
  /** The latest Remark on Today's Call, and every other Remark beneath it, newest first. */
  leftLeg: { today: Remark | null; earlier: Remark[] };
  /** Every Entry on Today's Call, newest first. */
  feed: FeedCard[];
  carePlan: { medications: Medication[]; watchItems: string[]; familyPhrase: string };
};

type Entry = { id: string; kind: string; quote: string; details: Record<string, string>; created_at: string };

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// What a feed card says the Entry is.
function feedTitle(entry: Entry) {
  if (entry.kind === "wellbeing") return entry.details.aspect === "sleep" ? "Sleep" : "Today";
  if (entry.kind === "dose") return `${entry.details.medication} · ${sentence(entry.details.status)}`;
  if (entry.kind === "remark") return "Left leg";
  return entry.kind;
}

// The one function that derives everything the page shows from the three tables.
export async function getDashboardState(db: SupabaseClient): Promise<DashboardState> {
  const [plan, today, remarks] = await Promise.all([
    db.from("care_plan").select("family_phrase, medications, watch_items").single(),
    db
      .from("calls")
      .select("id, status, entries(id, kind, quote, details, created_at)")
      .order("started_at", { ascending: false })
      .order("created_at", { referencedTable: "entries", ascending: false })
      .limit(1)
      .maybeSingle(),
    // Remarks from every Call, not only Today's.
    db.from("entries").select("call_id, quote, created_at").eq("kind", "remark").order("created_at", { ascending: false }),
  ]);
  if (plan.error) throw new Error(`Could not read the care plan: ${plan.error.message}`);
  if (today.error) throw new Error(`Could not read the calls: ${today.error.message}`);
  if (remarks.error) throw new Error(`Could not read the remarks: ${remarks.error.message}`);

  const entries: Entry[] = today.data?.entries ?? [];
  const wellbeing = (aspect: string) =>
    entries.find((e) => e.kind === "wellbeing" && e.details.aspect === aspect)?.quote ?? null;
  const medications: Medication[] = plan.data.medications.map((m: { name: string; strength: string; time_of_day: string }) => ({
    name: m.name,
    strength: m.strength,
    timeOfDay: m.time_of_day,
  }));
  const todaysRemark = remarks.data.find((r) => r.call_id === today.data?.id);
  const remark = (r: { quote: string; created_at: string }): Remark => ({ quote: r.quote, at: r.created_at });

  return {
    callStatus: today.data?.status ?? "not called yet",
    wellbeing: { general: wellbeing("general"), sleep: wellbeing("sleep") },
    doses: medications.map((m) => {
      // Entries are newest first, so the first one found is the latest: it wins.
      const latest = entries.find((e) => e.kind === "dose" && e.details.medication === m.name);
      return { ...m, status: (latest?.details.status as DoseStatus) ?? "not confirmed", quote: latest?.quote ?? null };
    }),
    leftLeg: {
      today: todaysRemark ? remark(todaysRemark) : null,
      earlier: remarks.data.filter((r) => r !== todaysRemark).map(remark),
    },
    feed: entries.map((e) => ({ id: e.id, title: feedTitle(e), quote: e.quote, at: e.created_at })),
    carePlan: { medications, watchItems: plan.data.watch_items, familyPhrase: plan.data.family_phrase },
  };
}
