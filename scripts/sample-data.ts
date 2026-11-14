// Resets the sample data: removes every Call and Entry, rehearsals included, writes the Care plan
// and about two weeks of History, dated back from the day it runs.
// Fictional data for the demo. Run with `npm run sample-data` (reads .env.local).
import { randomUUID } from "node:crypto";
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

type Status = "taken on call" | "says taken earlier" | "not taken";

// One earlier Call a day, yesterday first. Every Dose is taken on call unless `doses` says otherwise.
type Day = {
  general: string;
  sleep: string;
  leg: string;
  reading?: { systolic: number; diastolic: number; pulse?: number; quote: string };
  doses?: Record<string, { status: Status; quote: string }>;
  errand?: { item: string; quote: string };
  summary: string;
};

const history: Day[] = [
  {
    general: "Not too bad. Tired, but I'm up and dressed.",
    sleep: "Badly. The wind was rattling the window half the night.",
    leg: "Swollen again by evening. I kept it up on the stool.",
    reading: { systolic: 142, diastolic: 85, pulse: 70, quote: "One forty-two over eighty-five. Pulse seventy." },
    // Sleep is the only personal detail, so the detail Laura remembers is predictable.
    summary: "Lidia slept badly; the wind kept rattling the window. Her left leg was swollen by the evening. She took all three tablets on the call.",
  },
  {
    general: "Quite well, thank you. Ona came round with the newspaper.",
    sleep: "Like a log. I didn't hear a thing.",
    leg: "Heavy. The sock leaves a mark.",
    reading: { systolic: 136, diastolic: 80, quote: "A hundred and thirty-six over eighty." },
    errand: { item: "Tea", quote: "I'm nearly out of tea. Two bags left." },
    summary: "Lidia was in good spirits after Ona brought the newspaper round. She slept well. Her left leg felt heavy. She took all three tablets on the call.",
  },
  {
    general: "A bit stiff this morning, but fine.",
    sleep: "I woke at four and couldn't get back off.",
    leg: "About the same as yesterday.",
    reading: { systolic: 145, diastolic: 88, pulse: 74, quote: "One forty-five over eighty-eight, and seventy-four." },
    summary: "Lidia woke at four and could not get back to sleep. She felt a little stiff. Her leg was about the same. She took all three tablets on the call.",
  },
  {
    general: "Good. The sun is out, so I sat by the window.",
    sleep: "Not bad. I was up once.",
    leg: "Better. I can see my ankle bone today.",
    reading: { systolic: 138, diastolic: 82, pulse: 71, quote: "One thirty-eight over eighty-two. Seventy-one." },
    doses: { Eliquis: { status: "says taken earlier", quote: "That one I took with breakfast already." } },
    summary:
      "Lidia enjoyed sitting by the window in the sun. She slept fairly well. Her leg was less swollen. She took two tablets on the call and says she took the Eliquis earlier.",
  },
  {
    general: "All right. A quiet day, I'm doing the crossword.",
    sleep: "Well enough. I went to bed early.",
    leg: "A little puffy round the ankle.",
    errand: { item: "Bread", quote: "And bread, a small loaf." },
    summary:
      "Lidia was having a quiet day with the crossword. She slept well after an early night. Her ankle was a little puffy. She had not measured her blood pressure. She took all three tablets on the call.",
  },
  {
    general: "Fine. The neighbour's cat came to visit again.",
    sleep: "Restless. My leg ached when I lay down.",
    leg: "It ached last night, but it's easier now.",
    reading: { systolic: 140, diastolic: 84, pulse: 72, quote: "A hundred and forty over eighty-four. Pulse seventy-two." },
    summary:
      "Lidia was cheerful; the neighbour's cat came to visit again. She slept restlessly. Her leg ached in the night but was easier in the morning. She took all three tablets on the call.",
  },
  {
    general: "Very well. I baked a small cake for Sunday.",
    sleep: "Lovely, right through to seven.",
    leg: "Not so swollen. I've had it up most of the day.",
    reading: { systolic: 134, diastolic: 79, pulse: 68, quote: "One thirty-four over seventy-nine. Sixty-eight." },
    summary: "Lidia baked a small cake for Sunday. She slept right through to seven. Her leg was less swollen after keeping it up. She took all three tablets on the call.",
  },
  {
    general: "So-so. It's grey out and I don't feel like doing much.",
    sleep: "I dozed in the chair more than in bed.",
    leg: "Swollen. The shoe was tight on that side.",
    reading: { systolic: 147, diastolic: 90, pulse: 76, quote: "One forty-seven over ninety. The pulse is seventy-six." },
    errand: { item: "Hearing-aid batteries", quote: "The little round ones for my hearing aid." },
    summary: "Lidia felt low with the grey weather. She dozed in the chair more than in bed. Her left shoe felt tight. She took all three tablets on the call.",
  },
  {
    general: "Fine, thank you. I'm going down to the shop with Ona later.",
    sleep: "Quite well.",
    leg: "Much the same.",
    reading: { systolic: 139, diastolic: 83, quote: "One thirty-nine over eighty-three." },
    doses: { "Sanoral HCT": { status: "not taken", quote: "I can't find that box. I'll look for it after lunch." } },
    summary:
      "Lidia was going to the shop with Ona later. She slept quite well. Her leg was much the same. She took two tablets on the call; she could not find the Sanoral HCT.",
  },
  {
    general: "Good. I've been sorting old photographs.",
    sleep: "Not well. Too warm under the big blanket.",
    leg: "A bit better than yesterday.",
    reading: { systolic: 141, diastolic: 86, pulse: 73, quote: "A hundred and forty-one over eighty-six, pulse seventy-three." },
    summary: "Lidia had been sorting old photographs. She did not sleep well because she was too warm. Her leg was a bit better. She took all three tablets on the call.",
  },
  {
    general: "Not bad. My knees are complaining, that's all.",
    sleep: "Well. I had a warm milk before bed.",
    leg: "Swollen by the evening, fine in the morning.",
    reading: { systolic: 137, diastolic: 81, pulse: 69, quote: "One thirty-seven over eighty-one. Sixty-nine." },
    doses: { Metoprolol: { status: "says taken earlier", quote: "I had that one at eight, with my porridge." } },
    summary:
      "Lidia's knees were sore but she was otherwise fine. She slept well after a warm milk. Her leg was swollen by the evening. She took two tablets on the call and says she took the Metoprolol earlier.",
  },
  {
    general: "Happy. The radio played my old waltz.",
    sleep: "Up twice, but I got back off.",
    leg: "Heavy again. I'll keep it up today.",
    reading: { systolic: 143, diastolic: 87, quote: "One forty-three over eighty-seven." },
    summary: "Lidia was happy after hearing an old waltz on the radio. She woke twice but got back to sleep. Her leg felt heavy. She took all three tablets on the call.",
  },
  {
    general: "I'm well. It's nice to have a call.",
    sleep: "Fine, thank you.",
    leg: "It's a little swollen, nothing new.",
    reading: { systolic: 144, diastolic: 86, pulse: 72, quote: "One forty-four over eighty-six, and seventy-two." },
    summary: "Lidia said it was nice to have a call. She slept fine. Her leg was a little swollen. She took all three tablets on the call.",
  },
];

// What she says as she takes each tablet on the call, varied a little from day to day.
const takenOnCall: Record<string, string[]> = {
  Metoprolol: ["There. I've swallowed it.", "The first one, done.", "Yes, that one's down."],
  "Sanoral HCT": ["And the white one, yes.", "Done, with a sip of water.", "That's the second."],
  Eliquis: ["The little yellow one. Done.", "Eliquis, taken.", "All three now."],
};

// Each Call starts at 07:00 UTC (09:00 or 10:00 in Vilnius) on a day before today on her calendar.
const [year, month, date] = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Vilnius" }).split("-").map(Number);
const callStart = (daysAgo: number) => Date.UTC(year, month - 1, date - daysAgo, 7, 0);
const minutesAfter = (start: number, minutes: number) => new Date(start + minutes * 60_000).toISOString();

const calls = history.map((day, i) => ({
  id: randomUUID(),
  sample: true,
  status: "done",
  summary: day.summary,
  started_at: minutesAfter(callStart(i + 1), 0),
}));

// Her Entries on each Call, in the order Laura asks.
const entries = history.flatMap((day, i) => {
  const call_id = calls[i].id;
  const start = callStart(i + 1);
  return [
    { call_id, kind: "wellbeing", quote: day.general, details: { aspect: "general" }, created_at: minutesAfter(start, 1) },
    { call_id, kind: "wellbeing", quote: day.sleep, details: { aspect: "sleep" }, created_at: minutesAfter(start, 2) },
    { call_id, kind: "remark", quote: day.leg, details: {}, created_at: minutesAfter(start, 3) },
    ...carePlan.medications.map(({ name }, m) => {
      const dose = day.doses?.[name] ?? { status: "taken on call", quote: takenOnCall[name][i % 3] };
      return { call_id, kind: "dose", quote: dose.quote, details: { medication: name, status: dose.status }, created_at: minutesAfter(start, 4 + m) };
    }),
    ...(day.reading
      ? [
          {
            call_id,
            kind: "reading",
            quote: day.reading.quote,
            details: day.reading.pulse === undefined
              ? { systolic: day.reading.systolic, diastolic: day.reading.diastolic }
              : { systolic: day.reading.systolic, diastolic: day.reading.diastolic, pulse: day.reading.pulse },
            created_at: minutesAfter(start, 8),
          },
        ]
      : []),
    // Povilas brought each Errand the next afternoon and ticked it.
    ...(day.errand
      ? [{ call_id, kind: "errand", quote: day.errand.quote, details: { item: day.errand.item }, created_at: minutesAfter(start, 9), done_at: minutesAfter(start, 30 * 60) }]
      : []),
  ];
});

const cleared = await db.from("calls").delete().not("id", "is", null);
if (cleared.error) throw new Error(`Could not clear the calls: ${cleared.error.message}`);

const plan = await db.from("care_plan").upsert({ id: 1, ...carePlan });
if (plan.error) throw new Error(`Could not write the care plan: ${plan.error.message}`);

const written = await db.from("calls").insert(calls);
if (written.error) throw new Error(`Could not write the sample calls: ${written.error.message}`);

const recorded = await db.from("entries").insert(entries);
if (recorded.error) throw new Error(`Could not write the sample entries: ${recorded.error.message}`);

console.log(`Sample data reset: Care plan written, ${calls.length} earlier Calls in History, no Call today.`);
