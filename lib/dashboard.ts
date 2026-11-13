import type { SupabaseClient } from "@supabase/supabase-js";

export type CallStatus = "not called yet" | "live" | "done";

export type Medication = { name: string; strength: string; timeOfDay: string };

export type FeedCard = { id: string; title: string; quote: string; at: string };

export type DashboardState = {
  callStatus: CallStatus;
  /** Today's Wellbeing in her own words: the latest Quote for each aspect. */
  wellbeing: { general: string | null; sleep: string | null };
  /** Every Entry on Today's Call, newest first. */
  feed: FeedCard[];
  carePlan: { medications: Medication[]; watchItems: string[]; familyPhrase: string };
};

type Entry = { id: string; kind: string; quote: string; details: Record<string, string>; created_at: string };

// What a feed card says the Entry is.
function feedTitle(entry: Entry) {
  if (entry.kind === "wellbeing") return entry.details.aspect === "sleep" ? "Sleep" : "Today";
  return entry.kind;
}

// The one function that derives everything the page shows from the three tables.
export async function getDashboardState(db: SupabaseClient): Promise<DashboardState> {
  const [plan, today] = await Promise.all([
    db.from("care_plan").select("family_phrase, medications, watch_items").single(),
    db
      .from("calls")
      .select("status, entries(id, kind, quote, details, created_at)")
      .order("started_at", { ascending: false })
      .order("created_at", { referencedTable: "entries", ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (plan.error) throw new Error(`Could not read the care plan: ${plan.error.message}`);
  if (today.error) throw new Error(`Could not read the calls: ${today.error.message}`);

  const entries: Entry[] = today.data?.entries ?? [];
  const wellbeing = (aspect: string) =>
    entries.find((e) => e.kind === "wellbeing" && e.details.aspect === aspect)?.quote ?? null;

  return {
    callStatus: today.data?.status ?? "not called yet",
    wellbeing: { general: wellbeing("general"), sleep: wellbeing("sleep") },
    feed: entries.map((e) => ({ id: e.id, title: feedTitle(e), quote: e.quote, at: e.created_at })),
    carePlan: {
      medications: plan.data.medications.map((m: { name: string; strength: string; time_of_day: string }) => ({
        name: m.name,
        strength: m.strength,
        timeOfDay: m.time_of_day,
      })),
      watchItems: plan.data.watch_items,
      familyPhrase: plan.data.family_phrase,
    },
  };
}
