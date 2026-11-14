// Resets the sample data: removes every Call and Entry, rehearsals included, writes the Care plan
// and a year of History, dated back from the day it runs: the last 13 days written by hand, the rest made up
// from a fixed seed, so every reset writes the same year.
// Fictional data for the demo. Run with `npm run sample-data` (reads .env.local).
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { DoseStatus, Felt, Slept } from "../lib/dashboard.ts";
import { env } from "../lib/env.ts";

const db = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false },
});

const carePlan = {
  family_phrase: "Paul says the blue teapot is still his favourite.",
  medications: [
    { name: "Concor", strength: "5 mg, one tablet", time_of_day: "morning" },
    { name: "Sanoral HCT", strength: "40/10/12.5 mg, one tablet", time_of_day: "morning" },
    { name: "Eliquis", strength: "2.5 mg, one tablet", time_of_day: "morning" },
  ],
  watch_items: ["blood pressure", "left leg swelling"],
};

// A status Laura can record.
type Status = Exclude<DoseStatus, "not confirmed">;

// One earlier Call a day, yesterday first. Every Dose is taken on call unless `doses` says otherwise.
// `felt` and `slept` are the ratings Laura notes from her words.
type Day = {
  general: string;
  felt: Felt;
  sleep: string;
  slept: Slept;
  leg: string;
  reading?: { systolic: number; diastolic: number; pulse?: number; quote: string };
  doses?: Record<string, { status: Status; quote: string }>;
  errand?: { item: string; quote: string };
  summary: string;
};

const history: Day[] = [
  {
    general: "Not too bad. Tired, but I'm up and dressed.",
    felt: "okay",
    sleep: "Badly. I kept waking up.",
    slept: "not well",
    leg: "Swollen again by evening. I kept it up on the stool.",
    reading: { systolic: 142, diastolic: 85, pulse: 70, quote: "One forty-two over eighty-five. Pulse seventy." },
    // Sleep is the only personal detail, so the detail Laura remembers is predictable.
    summary: "Lidia slept badly. Her left leg was swollen by the evening. She took all three tablets on the call.",
  },
  {
    general: "Quite well, thank you. Ona came round with the newspaper.",
    felt: "good",
    sleep: "Like a log. I didn't hear a thing.",
    slept: "well",
    leg: "Heavy. The sock leaves a mark.",
    reading: { systolic: 136, diastolic: 80, quote: "A hundred and thirty-six over eighty." },
    errand: { item: "Tea", quote: "I'm nearly out of tea. Two bags left." },
    summary: "Lidia was in good spirits after Ona brought the newspaper round. She slept well. Her left leg felt heavy. She took all three tablets on the call.",
  },
  {
    general: "A bit stiff this morning, but fine.",
    felt: "okay",
    sleep: "I woke at four and couldn't get back off.",
    slept: "not well",
    leg: "About the same as yesterday.",
    reading: { systolic: 145, diastolic: 88, pulse: 74, quote: "One forty-five over eighty-eight, and seventy-four." },
    summary: "Lidia woke at four and could not get back to sleep. She felt a little stiff. Her leg was about the same. She took all three tablets on the call.",
  },
  {
    general: "Good. The sun is out, so I sat by the window.",
    felt: "good",
    sleep: "Not bad. I was up once.",
    slept: "well",
    leg: "Better. I can see my ankle bone today.",
    reading: { systolic: 138, diastolic: 82, pulse: 71, quote: "One thirty-eight over eighty-two. Seventy-one." },
    doses: { Eliquis: { status: "says taken earlier", quote: "That one I took with breakfast already." } },
    summary:
      "Lidia enjoyed sitting by the window in the sun. She slept fairly well. Her leg was less swollen. She took two tablets on the call and says she took the Eliquis earlier.",
  },
  {
    general: "All right. A quiet day, I'm doing the crossword.",
    felt: "okay",
    sleep: "Well enough. I went to bed early.",
    slept: "well",
    leg: "A little puffy round the ankle.",
    errand: { item: "Bread", quote: "And bread, a small loaf." },
    summary:
      "Lidia was having a quiet day with the crossword. She slept well after an early night. Her ankle was a little puffy. She had not measured her blood pressure. She took all three tablets on the call.",
  },
  {
    general: "Fine. The neighbour's cat came to visit again.",
    felt: "good",
    sleep: "Restless. My leg ached when I lay down.",
    slept: "not well",
    leg: "It ached last night, but it's easier now.",
    reading: { systolic: 140, diastolic: 84, pulse: 72, quote: "A hundred and forty over eighty-four. Pulse seventy-two." },
    summary:
      "Lidia was cheerful; the neighbour's cat came to visit again. She slept restlessly. Her leg ached in the night but was easier in the morning. She took all three tablets on the call.",
  },
  {
    general: "Very well. I baked a small cake for Sunday.",
    felt: "good",
    sleep: "Lovely, right through to seven.",
    slept: "well",
    leg: "Not so swollen. I've had it up most of the day.",
    reading: { systolic: 134, diastolic: 79, pulse: 68, quote: "One thirty-four over seventy-nine. Sixty-eight." },
    summary: "Lidia baked a small cake for Sunday. She slept right through to seven. Her leg was less swollen after keeping it up. She took all three tablets on the call.",
  },
  {
    general: "So-so. It's grey out and I don't feel like doing much.",
    felt: "okay",
    sleep: "I dozed in the chair more than in bed.",
    slept: "not well",
    leg: "Swollen. The shoe was tight on that side.",
    reading: { systolic: 147, diastolic: 90, pulse: 76, quote: "One forty-seven over ninety. The pulse is seventy-six." },
    errand: { item: "Hearing-aid batteries", quote: "The little round ones for my hearing aid." },
    summary: "Lidia felt low with the grey weather. She dozed in the chair more than in bed. Her left shoe felt tight. She took all three tablets on the call.",
  },
  {
    general: "Fine, thank you. I'm going down to the shop with Ona later.",
    felt: "good",
    sleep: "Quite well.",
    slept: "well",
    leg: "Much the same.",
    reading: { systolic: 139, diastolic: 83, quote: "One thirty-nine over eighty-three." },
    doses: { "Sanoral HCT": { status: "not taken", quote: "I can't find that box. I'll look for it after lunch." } },
    summary:
      "Lidia was going to the shop with Ona later. She slept quite well. Her leg was much the same. She took two tablets on the call; she could not find the Sanoral HCT.",
  },
  {
    general: "Good. I've been sorting old photographs.",
    felt: "good",
    sleep: "Not well. Too warm under the big blanket.",
    slept: "not well",
    leg: "A bit better than yesterday.",
    reading: { systolic: 141, diastolic: 86, pulse: 73, quote: "A hundred and forty-one over eighty-six, pulse seventy-three." },
    summary: "Lidia had been sorting old photographs. She did not sleep well because she was too warm. Her leg was a bit better. She took all three tablets on the call.",
  },
  {
    general: "Not bad. My knees are complaining, that's all.",
    felt: "okay",
    sleep: "Well. I had a warm milk before bed.",
    slept: "well",
    leg: "Swollen by the evening, fine in the morning.",
    reading: { systolic: 137, diastolic: 81, pulse: 69, quote: "One thirty-seven over eighty-one. Sixty-nine." },
    doses: { Concor: { status: "says taken earlier", quote: "I had that one at eight, with my porridge." } },
    summary:
      "Lidia's knees were sore but she was otherwise fine. She slept well after a warm milk. Her leg was swollen by the evening. She took two tablets on the call and says she took the Concor earlier.",
  },
  {
    general: "Happy. The radio played my old waltz.",
    felt: "good",
    sleep: "Up twice, but I got back off.",
    slept: "well",
    leg: "Heavy again. I'll keep it up today.",
    reading: { systolic: 143, diastolic: 87, quote: "One forty-three over eighty-seven." },
    summary: "Lidia was happy after hearing an old waltz on the radio. She woke twice but got back to sleep. Her leg felt heavy. She took all three tablets on the call.",
  },
  {
    general: "I'm well. It's nice to have a call.",
    felt: "good",
    sleep: "Fine, thank you.",
    slept: "well",
    leg: "It's a little swollen, nothing new.",
    reading: { systolic: 144, diastolic: 86, pulse: 72, quote: "One forty-four over eighty-six, and seventy-two." },
    summary: "Lidia said it was nice to have a call. She slept fine. Her leg was a little swollen. She took all three tablets on the call.",
  },
];

// What she says as she takes each tablet on the call, varied a little from day to day.
const takenOnCall: Record<string, string[]> = {
  Concor: ["There. I've swallowed it.", "The first one, done.", "Yes, that one's down."],
  "Sanoral HCT": ["And the white one, yes.", "Done, with a sip of water.", "That's the second."],
  Eliquis: ["The little yellow one. Done.", "Eliquis, taken.", "All three now."],
};

// Days 14 to 365 before today, made up from a fixed seed: plausible for her, varied, and the same on every reset.
// About 3 days in 100 have no Call. Laura's summary is built from that day's facts, in her plain words.
let seed = 11;
const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = <T>(list: T[]) => list[Math.floor(random() * list.length)];
const between = (low: number, high: number) => Math.round(low + random() * (high - low));

const feltWords: Record<Felt, string[]> = {
  good: ["Good, thank you.", "Very well today.", "Quite well. I walked to the gate and back.", "Good. Ona phoned last night."],
  okay: ["I'm all right.", "Not too bad. Tired, but I'm up and dressed.", "So-so, but managing.", "All right. A slow start."],
  bad: ["Not good today.", "Poorly. I feel weak.", "Not so good. My back aches.", "Low. I didn't want to get up."],
};
const sleptWords: Record<Slept, string[]> = {
  well: ["Slept right through.", "Well, thank you.", "Quite well.", "Well. I didn't hear a thing."],
  "not well": ["Badly. I kept waking up.", "Not well. I was up three times.", "Restless. Too many thoughts.", "Hardly at all."],
};
const feltSummary: Record<Felt, string> = { good: "Lidia said she was well.", okay: "Lidia said she was all right.", bad: "Lidia said she was not feeling good." };
const sleptSummary: Record<Slept, string> = { well: "She slept well.", "not well": "She slept badly." };
const legs: [quote: string, summary: string][] = [
  ["A little swollen by the evening.", "Her left leg was a little swollen by the evening."],
  ["Better. I can see my ankle bone today.", "Her left leg was less swollen."],
  ["Heavy. The sock leaves a mark.", "Her left leg felt heavy."],
  ["About the same as yesterday.", "Her left leg was about the same."],
  ["Puffy round the ankle.", "Her ankle was puffy."],
];
const errandItems = ["Tea", "Bread", "Milk", "Honey", "Biscuits", "Soap", "Stamps"];

const madeUp: (Day & { daysAgo: number })[] = [];
for (let daysAgo = 14; daysAgo <= 365; daysAgo++) {
  if (random() < 0.03) continue;
  const r = random();
  const felt: Felt = r < 0.55 ? "good" : r < 0.88 ? "okay" : "bad";
  const slept: Slept = random() < 0.7 ? "well" : "not well";
  const [leg, legSummary] = pick(legs);
  let reading: Day["reading"];
  if (random() < 0.88) {
    const [systolic, diastolic, pulse] = [between(126, 158), between(72, 92), random() < 0.6 ? between(60, 82) : undefined];
    reading = { systolic, diastolic, pulse, quote: `${systolic} over ${diastolic}${pulse === undefined ? "" : `, pulse ${pulse}`}.` };
  }
  const doses: NonNullable<Day["doses"]> = {};
  for (const { name } of carePlan.medications) {
    const d = random();
    if (d < 0.06) doses[name] = { status: "says taken earlier", quote: "I took that one earlier, with breakfast." };
    else if (d < 0.08) doses[name] = { status: "not taken", quote: "I can't find that box. I'll look for it later." };
  }
  const notOnCall = Object.entries(doses).map(([name, d]) => (d.status === "says taken earlier" ? `says she took the ${name} earlier` : `did not take the ${name}`));
  const onCall = carePlan.medications.length - notOnCall.length;
  const tablets = `She took ${onCall === 3 ? "all three tablets" : `${["no", "one", "two"][onCall]} tablet${onCall === 1 ? "" : "s"}`} on the call${notOnCall.length ? ` and ${notOnCall.join(" and ")}` : ""}.`;
  const item = random() < 0.08 ? pick(errandItems) : undefined;
  madeUp.push({
    daysAgo,
    general: pick(feltWords[felt]),
    felt,
    sleep: pick(sleptWords[slept]),
    slept,
    leg,
    reading,
    doses,
    errand: item ? { item, quote: `I'm nearly out of ${item.toLowerCase()}.` } : undefined,
    summary: [feltSummary[felt], sleptSummary[slept], legSummary, reading ? "" : "She had not measured her blood pressure.", tablets].filter(Boolean).join(" "),
  });
}

// Each Call starts at 07:00 UTC (09:00 or 10:00 in Vilnius) on a day before today on her calendar.
const [year, month, date] = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Vilnius" }).split("-").map(Number);
const callStart = (daysAgo: number) => Date.UTC(year, month - 1, date - daysAgo, 7, 0);
const minutesAfter = (start: number, minutes: number) => new Date(start + minutes * 60_000).toISOString();

const days = [...history.map((day, i) => ({ ...day, daysAgo: i + 1 })), ...madeUp];

const calls = days.map((day) => ({
  id: randomUUID(),
  sample: true,
  status: "done",
  summary: day.summary,
  started_at: minutesAfter(callStart(day.daysAgo), 0),
}));

// Her Entries on each Call, in the order Laura asks.
const entries = days.flatMap((day, i) => {
  const call_id = calls[i].id;
  const start = callStart(day.daysAgo);
  return [
    { call_id, kind: "wellbeing", quote: day.general, details: { aspect: "general", rating: day.felt }, created_at: minutesAfter(start, 1) },
    { call_id, kind: "wellbeing", quote: day.sleep, details: { aspect: "sleep", rating: day.slept }, created_at: minutesAfter(start, 2) },
    { call_id, kind: "remark", quote: day.leg, details: {}, created_at: minutesAfter(start, 3) },
    ...carePlan.medications.map(({ name }, m) => {
      const dose = day.doses?.[name] ?? { status: "taken on call", quote: takenOnCall[name][(day.daysAgo - 1) % 3] };
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
    // Paul brought each Errand the next afternoon and ticked it.
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

// In slices, to keep each request small.
for (let i = 0; i < entries.length; i += 500) {
  const recorded = await db.from("entries").insert(entries.slice(i, i + 500));
  if (recorded.error) throw new Error(`Could not write the sample entries: ${recorded.error.message}`);
}

console.log(`Sample data reset: Care plan written, ${calls.length} earlier Calls in History (a year back from yesterday), no Call today.`);
