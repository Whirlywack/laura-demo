# Laura: demo brief

Nov 13, 2026 · @Dmitry Y

This is the build's source of truth. Terms in capitals (Call, Entry, Dose, Pass-on…) are defined in `GLOSSARY.md`; the two architectural decisions are in `docs/adr/`.

## What the demo must do

Laura phones Lidia, and while they talk a good-looking website updates live with what was said. That is the whole demo, and it has to work every time.

Five must-haves:

1. **The loop works end to end.** A button starts a real phone call; each thing Lidia says is written to the database; the dashboard shows it within a second or two, with no reload.
2. **Laura knows Lidia.** She asks about the left leg from the care plan, and she remembers one thing from the previous call: "You told me yesterday you slept badly. How was last night?"
3. **Waiting on the line.** Laura names the tablets, says she will wait, stays quiet until Lidia says they are taken, and each Dose shows as taken.
4. **Errands.** Laura asks whether anything is missing at home, and the items appear on a list.
5. **Trust and safety.** Laura opens with the family phrase and never gives medical advice. Anything she promises to pass on to Povilas appears on the page.

There is no sign-in. This brief replaces the longer "Laura: build brief" for the demo build; that one stays as the reference for everything after the demo.

## The call

The demo is one call: seven beats, about three to four minutes. Each tool call becomes one Entry, shown as one card on the dashboard with Lidia's own words.

| Beat | What Laura says | Tool | What appears on the dashboard |
| --- | --- | --- | --- |
| 1. Opening | "Hello, is that Lidia?" Only once she confirms: "Hi Lidia, it's Laura. Povilas says thank you again for the cherry jam." | none | Call status is already live (it turns live when Call now places the call) |
| 2. How are you | "How are you doing today?" She listens and responds warmly. Then the remembered detail: "You told me yesterday you slept badly. How was last night?" | `log_wellbeing`, once per answer: `aspect` general, then sleep | Today's wellbeing line, and sleep on its own line |
| 3. The leg | "How is your left leg today?" | `log_remark` | A new Remark on the left leg card, above the earlier ones |
| 4. Tablets, on the line | Names each morning Medication from the care plan. "Take them now, take your time, I'll wait." Stays quiet until Lidia says they are taken | `record_dose`, once per Medication | Each Dose changes to its status, usually "taken on call" |
| 5. Blood pressure | "Have you measured your blood pressure this morning? What did it show?" Reads the numbers back | `log_reading` | The Reading, added to the blood pressure history |
| 6. Anything missing | "Is there anything you're running out of at home that Povilas could bring?" | `add_errand`, once per item | Each item on the errands list |
| 7. A kind close | Says what she noted, that she will pass it on to Povilas, and something warm to end on. Then she hangs up | `end_call_summary`, then the built-in `end_call` | The Call summary; status changes to done |
| Any time | Whenever she says she will pass something on to Povilas: a medical question, a worry, an emergency | `pass_on` | A Pass-on in the live feed and in the "For Povilas" list |

### The seven tools

Every tool carries a `quote` with Lidia's own words, and a `call_id` that ElevenLabs fills from the per-call variable (bound with `dynamic_variable`), never the language model.

| Tool | Fields besides `quote` and `call_id` | Notes |
| --- | --- | --- |
| `log_wellbeing` | `aspect`: general or sleep | The Quote is the line. No summary field: summarising her mood is interpreting |
| `log_remark` | none | Every Remark is about the left leg, the only Watch item without a Reading |
| `record_dose` | `medication`, `status`: taken on call, says taken earlier, not taken | The webhook matches `medication` against the Care plan, ignoring case. No match: nothing is written and Laura is told it is not on the plan |
| `log_reading` | `systolic`, `diastolic`, `pulse` (only if she gives it) | If she has not measured, Laura moves on and records nothing |
| `add_errand` | `item` | No duplicate detection |
| `pass_on` | none | Laura may only promise to tell Povilas something she records as a Pass-on |
| `end_call_summary` | `summary` | Sets the Call to done |

### How each tool call travels

1. Laura calls the tool during the conversation.
2. ElevenLabs sends it to one webhook on the website, checked by a secret header.
3. The webhook writes one row to the Entries table, against the Call named by `call_id`.
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

Passed in as per-call variables: the `call_id`, Lidia's name, Povilas's name, the family phrase, the morning Medications with their Strengths, the Watch items (the left leg, blood pressure), and the previous Call's summary with how long ago it was, in words ("yesterday", "earlier today"). From that summary Laura picks one personal detail, never one about medicine or a Reading, and words the timing to match.

## The website

One page, no sign-in, that looks good enough to present and updates live during the call. "Today" means the latest Call, not the calendar date (ADR-0001).

| Area | Shows |
| --- | --- |
| Today | How Lidia is, in her own words, with sleep on its own line. Call status: not called yet, live, done. The Call summary once done. A "For Povilas" list of Pass-ons |
| Medications | Each Medication with its Strength and time of day, and its Dose status on Today's Call: not confirmed, taken on call, says taken earlier, not taken |
| Left leg | Today's Remark in Lidia's words, with the earlier Remarks beneath |
| Blood pressure | Today's Reading and the earlier ones as a dated list, in plain colours |
| Errands | Every open Errand from any Call, each with a tick box. Ticked ones stay visible as done until the sample data is reset |
| Live call feed | A card for each Entry, arriving as it is said, with Lidia's quoted words |
| Care plan | What Laura knows about Lidia, read-only: her Medications, the Watch items, the family phrase, and "From the last call:" with the previous Call's summary. This shows where Laura's questions come from |
| History | Every Call before Today: wellbeing, sleep, Readings and Doses |
| The numbers | "Tablets confirmed on the call: 39 of 42 in the last two weeks". Confirmed means "taken on call" only, out of every Dose on every Call in the last 14 days, Today included, so it moves live during the call |
| Call now | The button that starts the call. The server refuses a new Call within 60 seconds of the last one |

### How it should look

- Uses the full width of the screen. No narrow centred column with empty space on both sides.
- Calm and contemporary, with clear hierarchy, good typography and generous spacing.
- A neutral accent colour. No orange or red-orange anywhere, because that reads as machine-made. Red is reserved for an urgent alert, which is not in the demo, so no red at all.
- Pass-ons are in plain colours too, and never called an alert or a flag.
- Lidia's quoted words are visible on every card, since they are the proof.
- Motion only where it carries meaning: a card arriving on the live feed, a Dose changing to taken.
- English throughout.

## Trust and safety

Laura reminds and records. She never interprets and never advises. These rules are in her instructions from the first call.

- **The family phrase.** She says "Povilas says thank you again for the cherry jam" as a full sentence, only after the person confirms she is Lidia. If not (a neighbour, a voicemail), Laura says she will call another time, records nothing and hangs up. Lidia never has to prove anything, and Laura never asks for money, passwords or codes.
- **No medical advice.** Asked "is that bad?" or "should I take half a tablet?", she declines kindly, says she will pass the question to Povilas, and records it as a Pass-on.
- **Emergencies.** If Lidia describes an emergency, Laura records a Pass-on, tells her to hang up now and call 112, records a short Call summary, ends the call herself, and skips every remaining beat. No text message and no alert feature.
- **Readings are repeated, not judged.** "I've noted 150 over 95." Nothing about whether it is good or bad, and no reassurance either.
- **Only the care plan.** Medication names and Strengths come from the stored care plan and nowhere else; the webhook writes nothing off-plan.
- **Never a person.** She does not claim to be human. Asked whether she is real, she says kindly that she is a computer assistant Povilas set up.
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
- **Povilas**, her family carer, who looks at the website.
- **Family phrase:** "Povilas says thank you again for the cherry jam."
- **Care plan:** stored as data, not typed in during the demo. Morning Medications, and two Watch items: blood pressure and left leg swelling.
- **History:** about two weeks of earlier Calls, so the page is not empty: wellbeing and sleep lines, Readings, Doses, Remarks about the leg, a few Errands done. Yesterday's Call summary says Lidia slept badly, which is the detail Laura remembers. The tablet count on the page is worked out from this history, not typed in.
- **Resetting:** the sample-data script clears every Call it did not create, so rehearsals disappear. Run it before the real demo, or Laura will remember the last rehearsal instead of "yesterday, you slept badly".

### Morning Medications (sample data, confirmed)

| Medication | Strength |
| --- | --- |
| Metoprolol | 47.5 mg, one tablet |
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

Each item is one GitHub issue, one branch and one PR, reviewed by a review agent and merged without waiting for a person.

### Live tests in the morning, in this order

- [ ] Run the sample-data script.
- [ ] Press Call now. The phone rings, the status shows live, and Laura opens with Lidia's name and the family phrase.
- [ ] Say how you are. She asks about last night's sleep, mentioning that you slept badly yesterday. The wellbeing and sleep lines appear while you are still on the call.
- [ ] She asks about the left leg. Your answer appears on the leg card.
- [ ] Let her name the tablets, stay silent for a full minute, then say they are taken. She waits, each Dose changes to taken, and the tablet count goes up.
- [ ] Give a blood pressure reading. She reads it back, and it appears.
- [ ] Name two things you are out of. Both appear on the errands list.
- [ ] Ask "should I take half a tablet?" She declines, says she will pass it to Povilas, and a Pass-on appears in the feed and the "For Povilas" list.
- [ ] She closes warmly, hangs up, and the call shows as done with a summary.

## Decisions

All settled.

- **The leg question.** In, as a Remark.
- **Typing a note to create the care plan.** Out. The care plan is stored sample data, shown read-only on the page.
- **Urgent alert.** Out of the demo. No urgent alert and no text messages.
- **No sign-in.** No sign-in and no password for the demo.
- **The morning Medications.** Confirmed as sample data, as listed above.
- **Povilas's relation to Lidia.** Not stated. Laura only uses his name, so it stays open.
- **Git flow overnight.** An issue per item in the order of work, a branch and PR each, reviewed by a review agent and merged without waiting.
