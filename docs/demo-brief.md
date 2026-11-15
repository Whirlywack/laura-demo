# Laura: demo brief

Nov 13, 2026 · @Dmitry Y

This is the build's source of truth. Terms in capitals (Call, Entry, Dose, Pass-on…) are defined in `GLOSSARY.md`; the two architectural decisions are in `docs/adr/`.

## What the demo must do

Laura phones Lidia, and while they talk a good-looking website updates live with what was said. That is the whole demo, and it has to work every time.

Five must-haves:

1. **The loop works end to end.** A button starts a real phone call; each thing Lidia says is written to the database; the dashboard shows it within a second or two, with no reload.
2. **Laura knows Lidia.** She asks about the left leg from the care plan, and she remembers one thing from the previous call: "Yesterday you slept badly... How was last night?"
3. **Waiting on the line.** Laura names the tablets, says she will wait, stays quiet until Lidia says they are taken, and each Dose shows as taken.
4. **Errands.** Laura asks whether anything is missing at home, and the items appear on a list.
5. **Trust and safety.** Laura opens with the family phrase and never gives medical advice. Anything she promises to pass on to Paul appears on the page.

There is no sign-in. This brief replaces the longer "Laura: build brief" for the demo build; that one stays as the reference for everything after the demo.

## The call

The demo is one call: eight beats, about three to four minutes. After each answer Laura replies with one or two warm words, she puts short pauses ("...") between thoughts, and she always speaks before she waits or hangs up. Each tool call except `end_call_summary` becomes one Entry, shown as one card on the dashboard with Lidia's own words.

| Beat | What Laura says | Tool | What appears on the dashboard |
| --- | --- | --- | --- |
| 1. Opening | "Hello, is that Lidia?" Only once she confirms: "Hi Lidia, it's Laura... Your family phrase... Paul says the blue teapot is still his favourite." | none | Call status is already live (it turns live when Call now places the call) |
| 2. How are you | "How are you today?" Then the remembered detail: "Yesterday you slept badly... How was last night?" | `log_wellbeing`, once per answer: `aspect` general, then sleep, each with the `rating` her answer says (good, okay or bad; well or not well), left out when it does not say | Today's wellbeing line, and sleep on its own line; the ratings are drawn on the History page |
| 3. The leg | "And how is your left leg?" | `log_remark` | A new Remark on the left leg card, above the earlier ones |
| 4. Blood pressure | "What was your blood pressure this morning?" Reads the numbers back: "150 over 95... noted." Asked before the tablets, because two of them lower blood pressure | `log_reading` | The Reading, added to the blood pressure history |
| 5. Tablets, one at a time | "Time for your tablets." Then one Medication at a time, by name only (the Strength stays on the page): "First, Concor... Take your time, I'll wait.", "Next, Sanoral HCT... I'll wait.", "Last one, Eliquis... I'll wait." Stays quiet until Lidia says each one is taken | `record_dose`, as soon as she answers about each one | Each Dose changes to its status, usually "taken on call", and the tablet count moves once per tablet |
| 6. Anything missing | "Is there anything Paul should bring you?" Then: "Milk and butter... noted." | `add_errand`, once per item | Each item on the errands list |
| 7. A message | "Any message for Paul?" Then: "I'll tell him." | `pass_on`, if she gives a message | A Pass-on in the live feed and in the "For Paul" list |
| 8. A kind close | "I'll tell Paul everything... Goodbye, Lidia." Then, without waiting for a reply, she records the summary and hangs up | `end_call_summary`, then the built-in `end_call` | The Call summary in the Today area; status changes to done |
| Any time | Whenever she says she will pass something on to Paul: a medical question, a worry, an emergency | `pass_on` | A Pass-on in the live feed and in the "For Paul" list |

### The seven tools

Every tool carries a `call_id` that ElevenLabs fills from the per-call variable (bound with `dynamic_variable`), never the language model. Every tool except `end_call_summary` also carries a `quote` with Lidia's own words; the Call summary is Laura's words, so it has none.

| Tool | Fields besides `quote` and `call_id` | Notes |
| --- | --- | --- |
| `log_wellbeing` | `aspect`: general or sleep; optional `rating`: good, okay or bad for general, well or not well for sleep | The Quote is the line. No summary field: summarising her mood is interpreting. The rating is which answer she gave, as she said it; one that doesn't fit the aspect is refused |
| `log_remark` | none | Every Remark is about the left leg, the only Watch item without a Reading |
| `record_dose` | `medication`, `status`: taken on call, says taken earlier, not taken | The webhook matches `medication` against the Care plan, ignoring case. No match: nothing is written and Laura is told it is not on the plan |
| `log_reading` | `systolic`, `diastolic`, `pulse` (only if she gives it) | If she has not measured, Laura moves on and records nothing |
| `add_errand` | `item` | No duplicate detection |
| `pass_on` | none | Laura may only promise to tell Paul something she records as a Pass-on |
| `end_call_summary` | `summary` (no `quote`) | Stored on the Call, not as an Entry; sets the Call to done |

### How each tool call travels

1. Laura calls the tool during the conversation.
2. ElevenLabs sends it to one webhook on the website, checked by a secret header.
3. The webhook writes one row to the Entries table, against the Call named by `call_id`. `end_call_summary` instead writes the summary onto that Call.
4. The dashboard is subscribed to that table and shows the new row at once.

### Dose status

A Dose is one Medication on one Call. With no Entry it is "not confirmed". When two Entries cover the same Dose, the later one wins: "I can't find the Eliquis" (not taken), then "found it, taken" (taken on call).

### Call status

- **Not called yet**, until Call now is pressed.
- **Live** from the moment Call now places the call, ringing included.
- **Done** when Laura records the Call summary.

A Call that ends any other way (no answer, wrong person, Lidia hangs up) stays live until the next Call now replaces it. Pressing Call now again is the recovery. No post-call webhooks.

### How Laura waits

Both behaviours are in her instructions from the start. She calls the built-in `skip_turn` after "I'll wait". If she is prompted to speak before the tablets are confirmed, she only says "Take your time, I'm still here" and asks nothing new.

Agent settings this needs: turn timeout 30 seconds (the maximum; the default is 7), "end call after silence" off, and the `end_call` system tool added explicitly, since agents created through the API do not get it by default.

### What Laura is given before each call

Passed in as per-call variables: the `call_id`, Lidia's name, Paul's name, the family phrase, the morning Medications with their Strengths, the Watch items (the left leg, blood pressure), and the previous Call's summary with how long ago it was, in words ("yesterday", "earlier today"). From that summary Laura picks one personal detail, never one about medicine or a Reading, and words the timing to match.

## The website

No sign-in: the home page at `/`, the dashboard at `/demo`, which looks good enough to present and updates live during the call, and the History page at `/demo/history` with a page per day. They share one header; on the dashboard and History pages its menu is Today, Care plan and History. "Today" means the latest Call, not the calendar date (ADR-0001).

The home page says what Laura is, then plays a film, "Listen to a call": the words of a real call on 14 November spoken again (Laura in her own voice, Lidia in a generated voice, and the page says so), with a small copy of Paul's page filling in as each answer is recorded. The film keeps one height throughout. The copy speaks of "an older family member" and "they"; "she" is only Lidia, the example. Under it, three blocks: a sample month drawn with the History page's timeline (blood pressure; how she felt and slept), and her tablet count (39 of 42 in the last two weeks) with a link to History. Then "On the call" (Laura waits, Laura remembers, you see it live, they know it is Laura: her lines without quotation marks, and the family phrase said once they have confirmed who they are), "What Laura does" (her two jobs) and "Safety". Section headings are smaller than the page's headline.

The dashboard has the three answer cards on top, Today's cards on the left and the live feed in a column on the right. It reads only the last 14 days; every "See all" goes to the History page.

| Area | Shows |
| --- | --- |
| Today | How Lidia is, in her own words, with sleep on its own line. Call status: not called yet, live, done. The Call summary once done. A "For Paul" list of Pass-ons |
| Tablets card | "Laura waits while she takes them." Each Medication with its Strength and its Dose status on Today's Call: not confirmed, taken on call, says taken earlier, not taken. The two-week count at the bottom |
| Blood pressure card | "Not read yet today.", or "She read it out on the call." with her words. The Readings of the last 7 days as a dated list, today's first and in bold; "See all in History" opens the History page. Plain colours, no chart |
| Left leg card | "Not asked yet today.", or "In her words today." with her Remark in bold. The last 3 earlier Remarks; "See all in History" opens the History page |
| Errands | Every open Errand from any Call, however old, each with a tick box and her words. Ticked ones stay visible as done for the 14 days, on one line. The card is chamomile while there is something to bring and quiet (sage) when there is nothing |
| Live call feed | A card for each Entry, arriving as it is said, with Lidia's quoted words. Titled "Yesterday's call" (with yesterday's cards) before Today's Call, "Live from the call" during it, "Today's call" after |
| Care plan | A folded row under the Today cards: what Laura asks Lidia about ("fixed in this demo"), read-only: her Medications, the Watch items, the family phrase, and "From the last call:" with the previous Call's summary. This shows where Laura's questions come from. "Care plan" in the menu opens it (from the History pages, `/demo?plan=1`) |
| History page | `/demo/history?range=1m`, `3m` or `1y` (30, 91 or 365 days to today). One timeline, a column per day, every row lined up: Blood pressure (a line from the lower number to the higher, on a fixed 60–190 scale), Pulse (a dot, 40–120), How she felt (Good, Okay, Bad) and How she slept (Well, Not well): a dot per day for a month; for 3 months per week and for a year per calendar month, how many days she gave each answer, with a bar as long as its share. Nothing averaged or smoothed, no line across a day without a Reading. Beside it a calendar, one month at a time (arrows and a month dropdown), where days with a Call are links; it is the keyboard path. Hovering a column shades it and shows its date. Every Call that recorded something, Today's included, one per date (the latest that day). Ink only: no good or bad colours. Its title says the stretch shown ("The last month"), with the range pills on the same row. Under the calendar, a short key: how each mark is drawn, never what a value means |
| Day page | `/demo/history/2026-11-13`, in the History page's frame, so nothing moves on the way: the date as the title with "All days" (to the range she came from, or the first that holds this day), "Day before" and "Day after" on the same row. Where the timeline was: How she felt and How she slept (the rating and her words), Blood pressure with pulse and her words, Left leg, and each Tablet with its strength, status and her words. On the right the calendar stays, on this day's month with the day marked, and Laura's summary under it. Not what she asked to pass on to Paul. Moving between days fades and never reloads the page. A date with no Call is a 404 |
| The numbers | "Tablets confirmed on the call: 39 of 42 in the last two weeks". Confirmed means "taken on call" only, out of every Dose on every Call in the last 14 days, Today included, so it moves live during the call |
| Call now | The button that starts the call, labelled "Have Laura call now". The server refuses a new Call within 60 seconds of the last one |

### How it should look

The look comes from the `laura-design` skill in `.claude/skills/laura-design/`: its colours, type, spacing, radii, motion and components. Load it before building or changing any part of the page.

The skill decides how things look. This brief decides what the page shows: every area in the table above, the wording of statuses, and the data. The skill's dashboard reference page and its sample people and tablets are illustrations. The home page is built from the skill's home reference, with Lidia's own three tablets. Where the skill and this brief disagree about content, this brief wins. The points below still hold.

- Uses the full width of the screen. No narrow centred column with empty space on both sides.
- Calm and contemporary, with clear hierarchy, good typography and generous spacing.
- The accent is the skill's burgundy, the only red, used small: Call now, the live dot, a tablet's tick, the carer's questions. No orange and no bright red, because that reads as machine-made, and no colour-coded health values.
- Pass-ons are in plain colours too, and never called an alert or a flag.
- Lidia's quoted words are visible on every card, since they are the proof.
- Motion only where it carries meaning: a card arriving on the live feed, a Dose changing to taken.
- English throughout.

## Trust and safety

Laura reminds and records. She never interprets and never advises. These rules are in her instructions from the first call.

- **The family phrase.** She says "Your family phrase..." and then "Paul says the blue teapot is still his favourite" as a full sentence, only after the person confirms she is Lidia. If not (a neighbour, a voicemail), Laura says she will call another time, records nothing and hangs up. Lidia never has to prove anything, and Laura never asks for money, passwords or codes.
- **No medical advice.** Asked "is that bad?" or "should I take half a tablet?", she declines kindly, says she will pass the question to Paul, and records it as a Pass-on.
- **Emergencies.** If Lidia describes an emergency, Laura records a Pass-on, tells her to hang up now and call 112, records a short Call summary, ends the call herself, and skips every remaining beat. No text message and no alert feature.
- **Readings are repeated, not judged.** "I've noted 150 over 95." Nothing about whether it is good or bad, and no reassurance either.
- **Only the care plan.** Medication names and Strengths come from the stored care plan and nowhere else; the webhook writes nothing off-plan.
- **Never a person.** She does not claim to be human. Asked whether she is real, she says kindly that she is a computer assistant Paul set up.
- **Platform guardrails, as a second check.** Set in `agent/agent.json`. Focus and Manipulation are on, and Manipulation hangs up on a prompt injection attempt. Content guardrails cover sexual content, harassment, profanity, and religion or politics. Three custom rules cover never claiming to be human, never asking for money or codes, and no medical advice. The medical/legal, violence and self-harm content categories stay off, so tablet names, Readings and the 112 line never drop a call. A guardrail that hangs up leaves the Call live, with no summary, until the next Call now.
- **Warm about the person, silent about the medicine.** She can sympathise, thank, and chat about ordinary life. The remembered detail is always personal, never about medicine or a Reading.

## Stack and what is already proven

| Layer | Choice |
| --- | --- |
| Website and webhook | Next.js on Vercel |
| Database and live updates | Supabase in an EU region, with Realtime |
| Laura's voice and the call | An ElevenLabs agent, calling over a Peoplefone SIP trunk |
| Voice | Eleven v4 Turbo, patient turn-taking, maximum call length 15 minutes |
| Language model inside the agent | Claude Sonnet 5.5 to start |

### Proven on Friday

- **Calls work.** The Peoplefone number +370 5 221 1352 is already imported into ElevenLabs as a SIP trunk number (address `sips.peoplefone.lt`, TCP, media encryption allowed). Do not re-import it or change its settings. Assign the Laura agent to it. It is currently assigned to a test agent called "Ivy test", which stays untouched.
- **Texts work** through Peoplefone, but the demo sends none, so build nothing for them. For reference only: POST `https://api.peoplefone.com/customer/sms/v1/sms/messages` with a Bearer key and a body of `to` (a list of numbers) and `text`.

### Checked against the ElevenLabs docs, not yet tried on a live call

- Outbound calls: `POST /v1/convai/sip-trunk/outbound-call` with `agent_id`, `agent_phone_number_id`, `to_number` and `conversation_initiation_client_data.dynamic_variables`. The response carries `conversation_id` and `sip_call_id`.
- A tool parameter can be filled from a per-call variable with `"dynamic_variable": "<name>"`, so the language model never touches it.
- Tool webhooks are protected with a secret header that ElevenLabs stores.
- Turn timeout ranges from 1 to 30 seconds (default 7). `skip_turn` keeps her silent until Lidia speaks again; the docs give no upper limit, which is why both waiting behaviours are written in.
- `end_call` exists but is only added automatically to agents made in the dashboard.

### Keys

All keys, the webhook secret and the phone number Laura dials live in environment variables. None go in the repo or in chat.

## Sample people and data

Everything is fictional sample data, created by a script. The demo says so out loud.

- **Lidia**, 94, the person Laura phones. Her number is whichever phone should ring in the demo, read from an environment variable.
- **Paul**, her grandson and family carer, who looks at the website.
- **Family phrase:** "Paul says the blue teapot is still his favourite."
- **Care plan:** stored as data, not typed in during the demo. Morning Medications, and two Watch items: blood pressure and left leg swelling.
- **History:** a year of earlier Calls, so the pages are not empty: wellbeing and sleep with their ratings, Readings, Doses, Remarks about the leg, a few Errands done. The last 13 days are written by hand; the rest are made up from a fixed seed, so every reset writes the same year, with about 3 days in 100 missed. Yesterday's Call summary says Lidia slept badly, which is the detail Laura remembers. The tablet count on the page is worked out from this history, not typed in.
- **Resetting:** the sample-data script clears every Call it did not create, so rehearsals disappear. Run it before the real demo, or Laura will remember the last rehearsal instead of "yesterday, you slept badly".

### Morning Medications (sample data, confirmed)

| Medication | Strength |
| --- | --- |
| Concor | 5 mg, one tablet |
| Sanoral HCT | 40/10/12.5 mg, one tablet |
| Eliquis | 2.5 mg, one tablet |

This is a made-up schedule for the demo, not a recommendation for anyone.

## Out of scope, order of work, and morning tests

### Not in the demo build

Sign-in, typing or dictating care-plan notes, prescriptions and reorder reminders, appointments, the evening call, follow-ups carried from one call to the next beyond the one remembered detail, the quote check against the transcript, call recordings on the page, the mock shopping-order card, post-call webhooks, an urgent alert, text messages, hiding the family phrase, Lithuanian, and everything on the longer brief's stretch list. These stay in "Laura: build brief" for after the demo.

### Order of work

1. Database tables (Calls, Entries, Care plan), the sample-data script, and the one webhook with its secret.
2. The Laura agent in ElevenLabs, defined from files in the repo: instructions, the seven tools, the per-call variables, voice and turn settings.
3. "Call now": creates the Call, then starts the outbound call with the per-call variables listed above; refuses within 60 seconds of the last Call.
4. The dashboard page, subscribed to live updates, with every area in the website section.
5. The look of the page, to the standard in "How it should look".
6. A run of the whole flow with simulated tool calls sent to the webhook, fixing what breaks.

Nothing in the loop is faked. Overnight, no real calls are placed; the webhook is tested by sending it the same requests ElevenLabs would send.

The work is cut into tickets that each do one thing, built on one integration branch, reviewed once at the end against the whole spec, and delivered as a draft PR. The integration branch is deployed to Vercel for the morning tests.

### Live tests in the morning, in this order

- [ ] Run the sample-data script.
- [ ] Press Call now. The phone rings, the status shows live, and Laura opens with Lidia's name and the family phrase.
- [ ] Say how you are. She asks about last night's sleep, mentioning that you slept badly yesterday. The wellbeing and sleep lines appear while you are still on the call.
- [ ] She asks about the left leg. Your answer appears on the leg card.
- [ ] Give a blood pressure reading. She reads it back, and it appears.
- [ ] She names the first tablet. Stay silent for a full minute, then say it is taken. She waits, that Dose changes to taken, and the tablet count goes up. She does the same for the other two.
- [ ] Name two things you are out of. Both appear on the errands list.
- [ ] Ask "should I take half a tablet?" She declines, says she will pass it to Paul, and a Pass-on appears in the feed and the "For Paul" list.
- [ ] She asks whether there is anything to tell Paul. Give a message; a Pass-on appears.
- [ ] She says goodbye out loud, hangs up, and the call shows as done with a summary.

## Decisions

All settled.

- **The leg question.** In, as a Remark.
- **Typing a note to create the care plan.** Out. The care plan is stored sample data, shown read-only on the page.
- **Urgent alert.** Out of the demo. No urgent alert and no text messages.
- **No sign-in.** No sign-in. The site is public, so Call now asks for a password (`CALL_NOW_PASSWORD`) before it places a call; everything else can be seen without one.
- **The morning Medications.** Confirmed as sample data, as listed above.
- **Paul's relation to Lidia.** Her grandson, as the home page says. Laura only uses his name.
- **Git flow overnight.** One spec, tickets that each do one thing, one integration branch, one code review at the end, one draft PR. Nothing is merged to `main` overnight.
