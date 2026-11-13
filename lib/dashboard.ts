import type { SupabaseClient } from "@supabase/supabase-js";

export type CallStatus = "not called yet" | "live" | "done";

export type Medication = { name: string; strength: string; timeOfDay: string };

export type DashboardState = {
  callStatus: CallStatus;
  carePlan: { medications: Medication[]; watchItems: string[]; familyPhrase: string };
};

// The one function that derives everything the page shows from the three tables.
export async function getDashboardState(db: SupabaseClient): Promise<DashboardState> {
  const [plan, today] = await Promise.all([
    db.from("care_plan").select("family_phrase, medications, watch_items").single(),
    db.from("calls").select("status").order("started_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (plan.error) throw new Error(`Could not read the care plan: ${plan.error.message}`);
  if (today.error) throw new Error(`Could not read the calls: ${today.error.message}`);

  return {
    callStatus: today.data?.status ?? "not called yet",
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
