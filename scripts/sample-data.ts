// Resets the sample data: removes every Call and Entry and writes the Care plan.
// Fictional data for the demo. Run with `npm run sample-data` (reads .env.local).
import { createClient } from "@supabase/supabase-js";
import { env } from "../lib/env.ts";

const db = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false },
});

const carePlan = {
  family_phrase: "Povilas says thank you again for the cherry jam.",
  medications: [
    { name: "Metoprolol", strength: "47.5 mg, one tablet", time_of_day: "morning" },
    { name: "Sanoral HCT", strength: "40/10/12.5 mg, one tablet", time_of_day: "morning" },
    { name: "Eliquis", strength: "2.5 mg, one tablet", time_of_day: "morning" },
  ],
  watch_items: ["blood pressure", "left leg swelling"],
};

const calls = await db.from("calls").delete().not("id", "is", null);
if (calls.error) throw new Error(`Could not clear the calls: ${calls.error.message}`);

const plan = await db.from("care_plan").upsert({ id: 1, ...carePlan });
if (plan.error) throw new Error(`Could not write the care plan: ${plan.error.message}`);

console.log("Sample data reset: no Calls, Care plan written.");
