// The film on the home page (components/home/Film.tsx plays it). Times are seconds from the start.
// A line is what is said; a record is something Laura noted, landing on Paul's page; a caption sets the scene.

// One thing landing on Paul's page. Her words (`quote`) on everything but Laura's summary (`text`); a reading has its
// `value`, a dose its Medication `name`, an errand its `item`.
type Recorded = { kind: "general" | "sleep" | "leg" | "passOn" | "reading" | "dose" | "errand" | "summary"; quote?: string; value?: string; name?: string; item?: string; text?: string };

export type FilmRecord = { at: number; clock: string } & Recorded;
export type FilmLine = { start: number; who: "laura" | "lidia"; text: string };

export type FilmData = {
  /** The poster before it plays. */
  poster: { title: string; note: string };
  /** When the call was, on Paul's page once it is done: "Called at 09:30". */
  calledAt: string;
  lines: FilmLine[];
  records: FilmRecord[];
  captions: { at: number; label: string; text: string }[];
  /** When the closing card shows, and when the film stops. */
  ending: { at: number; text: string };
  length: number;
  /** A sound file the film follows instead of its own clock. */
  audio?: string;
};

// The words of a real call on 14 November 2026 (ElevenLabs conversation conv_5401…ygsc6), spoken
// again by Laura's own voice and, for Lidia, a generated voice. `spoken` are the stitched file's line times.
const spoken: [start: number, end: number, who: "laura" | "lidia", text: string][] = [
  [0.6, 2.28, "laura", "Hello, is that Lidia?"],
  [3.18, 4.46, "lidia", "Yes, speaking."],
  [5.06, 15.15, "laura", "Hi Lidia, it's Laura... Your family phrase... Paul says the blue teapot is still his favourite. How are you today?"],
  [15.95, 17.54, "lidia", "I'm good, thank you."],
  [18.84, 23.92, "laura", "Good... Yesterday you slept badly... How was last night?"],
  [24.82, 26.28, "lidia", "Uh, it's much better."],
  [27.58, 30.79, "laura", "Thank you... And how is your left leg?"],
  [31.69, 35.65, "lidia", "Oh, it's, uh, it's all right. It's getting better. Thank you."],
  [36.95, 39.43, "laura", "Good... What was your blood pressure this morning?"],
  [40.43, 43.46, "lidia", "Uh, it was 140/80."],
  [44.76, 56.21, "laura", "One hundred and forty over eighty... noted. Time for your tablets... First, Concor... Take your time, I'll wait."],
  [59.41, 60.52, "lidia", "Taken."],
  [61.72, 69.5, "laura", "Thank you... Next, Sanoral HCT... I'll wait."],
  [72.3, 74.02, "lidia", "Taken."],
  [75.22, 82.97, "laura", "Thank you... Last one, Eliquis... I'll wait."],
  [85.77, 86.46, "lidia", "Taken."],
  [87.66, 91, "laura", "Thank you... Is there anything Paul should bring you?"],
  [92, 96.24, "lidia", "Uh, I would love to have some of those apples that I like."],
  [97.54, 101.54, "laura", "Apples... noted. Any message for Paul?"],
  [102.54, 104.72, "lidia", "Uh, tell Paul I love him."],
  [105.92, 111.05, "laura", "I'll tell him... I'll tell Paul everything... Goodbye, Lidia."],
];
// What Laura recorded after each of Lidia's answers, in the order of the call. The words are the call's; the clock is
// Laura's usual half past nine, as the page is about her morning call (the test call itself was made in the evening).
const recorded: [line: number, Recorded][] = [
  [3, { kind: "general", quote: "I'm good, thank you." }],
  [5, { kind: "sleep", quote: "Uh, it's much better." }],
  [7, { kind: "leg", quote: "Oh, it's, uh, it's all right. It's getting better. Thank you." }],
  [9, { kind: "reading", value: "140/80", quote: "Uh, it was 140/80." }],
  [11, { kind: "dose", name: "Concor", quote: "Taken." }],
  [13, { kind: "dose", name: "Sanoral HCT", quote: "Taken." }],
  [15, { kind: "dose", name: "Eliquis", quote: "Taken." }],
  [17, { kind: "errand", item: "Apples", quote: "Uh, I would love to have some of those apples that I like." }],
  [19, { kind: "passOn", quote: "Uh, tell Paul I love him." }],
  [20, { kind: "summary", text: "Lidia was in good spirits and said she was good today. She slept much better last night than the night before. She said her left leg is all right and getting better. She reported blood pressure of 140 over 80 and took all three morning tablets during the call. She would love some of her favourite apples, and asked me to tell Paul she loves him." }],
];
const clockAt = (s: number) => `09:${30 + Math.floor(s / 60)}`;

export const realCall: FilmData = {
  poster: { title: "Listen to a call. Turn the sound on.", note: "Just under two minutes." },
  calledAt: "09:30",
  lines: spoken.map(([start, , who, text]) => ({ start, who, text })),
  records: recorded.map(([line, e]) => ({ at: +(spoken[line][1] + 0.7).toFixed(2), clock: clockAt(spoken[line][1]), ...e })),
  captions: [{ at: 0, label: "A call on 14 November", text: "Laura phones Lidia. Everything on Paul's page arrives while they are still talking." }],
  ending: { at: 112, text: "Laura called." },
  length: 116,
  audio: "/film/call.mp3",
};
