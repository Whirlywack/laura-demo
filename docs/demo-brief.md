# Laura: demo brief

Nov 13, 2026 · @Dmitry Y

## What the demo must do

Laura phones Lidia, and while they talk a good-looking website updates live with what was said. That is the whole demo, and it has to work every time.

Five must-haves:

1. **The loop works end to end.** A button starts a real phone call; each thing Lidia says is written to the database; the dashboard shows it within a second or two, with no reload.
2. **Laura knows Lidia.** She asks about the left leg from the care plan, and she remembers one thing from yesterday's call: "You told me yesterday you slept badly. How was last night?"
3. **Waiting on the line.** Laura names the tablets, says she will wait, stays quiet until Lidia says they are taken, and the dose shows as taken.
4. **Errands.** Laura asks whether anything is missing at home, and the items appear on a list.
5. **Trust and safety.** Laura opens with the family phrase and never gives medical advice.

There is no sign-in. This brief replaces the longer "Laura: build brief" for the demo build; that one stays as the reference for everything after the demo.

## The call

The demo is one call: seven beats, about three to four minutes. Each beat that records something fires one tool, and each tool call becomes one card on the dashboard with Lidia's own words.

| Beat | What Laura says | Tool | What appears on the dashboard |
| --- | --- | --- | --- |
| 1. Opening | "Hello, is that Lidia?" then "Hi Lidia, it's Laura. Povilas says thank you again for the cherry jam." | none | Call status changes to live |
| 2. How are you | "How are you doing today?" She listens and responds warmly. Then the remembered detail: "You told me yesterday you slept badly. How was last night?" | `log_wellbeing` | Today's wellbeing line, and sleep on its own line |
| 3. The leg | "How is your left leg today?" | `log_remark` | A new remark on the left leg card, above the earlier ones |
| 4. Tablets, on the line | Names each morning tablet from the care plan. "Take them now, take your time, I'll wait." Stays quiet until Lidia says they are taken | `record_dose`, once per tablet | Each dose changes to "taken on call" |
| 5. Blood pressure | "Have you measured your blood pressure this morning? What did it show?" Reads the numbers back | `log_reading` | The reading, added to the blood pressure history |
| 6. Anything missing | "Is there anything you're running out of at home that Povilas could bring?" | `add_errand`, once per item | Each item on the errands list |
| 7. A kind close | Says what she noted, that she will pass it on to Povilas, and something warm to end on | `end_call_summary` | The call's summary; status changes to done |

### How each tool call travels

1. Laura calls the tool during the conversation.
2. ElevenLabs sends it to one webhook on the website, checked by a secret header.
3. The webhook writes one row to the database.
4. The dashboard is subscribed to that table and shows the new row at once.

Every tool carries a `quote` field with Lidia's own words, and the card shows it.

### How Laura waits

ElevenLabs lets an agent stay silent for at most 30 seconds unless she calls the built-in `skip_turn` tool, which keeps her quiet until the other person speaks. Laura calls `skip_turn` after asking Lidia to take the tablets. If that does not hold for a full minute in the live test, she says "Take your time, I'm still here" about every 30 seconds and asks nothing new until the tablets are taken.

### What Laura is given before each call

Passed in as per-call variables: Lidia's name, Povilas's name, the family phrase, this call's tablets with their doses, the things to watch (the left leg, blood pressure), and one remembered detail from the previous call's summary (that Lidia said she slept badly).

## The website

One page, no sign-in, that looks good enough to present and updates live during the call.

| Area | Shows |
| --- | --- |
| Today | How Lidia is, in her own words, with sleep on its own line. Call status: not called yet, live, done |
| Medications | Each tablet with its dose and time of day, and today's state: not confirmed, taken on call, says taken earlier, not taken |
| Left leg | Today's remark in Lidia's words, with the earlier remarks beneath |
| Blood pressure | Today's reading and the earlier ones as a dated list |
| Errands | The items Lidia asked for, each with a tick box |
| Live call feed | A card for each thing Laura records, arriving as it is said, with Lidia's quoted words |
| Care plan | What Laura knows about Lidia, read-only: her tablets, the things to watch, the family phrase. This shows where Laura's questions come from |
| History | Earlier calls: wellbeing, sleep, readings and doses, from the sample data |
| The numbers | One line counted from the history, for example "Tablets confirmed on the call: 39 of 42 in the last two weeks" |
| Call now | The button that starts the call |

### How it should look

- Uses the full width of the screen. No narrow centred column with empty space on both sides.
- Calm and contemporary, with clear hierarchy, good typography and generous spacing.
- A neutral accent colour. No orange or red-orange anywhere, because that reads as machine-made; red is used only for an urgent alert.
- Lidia's quoted words are visible on every card, since they are the proof.
- Motion only where it carries meaning: a card arriving on the live feed, a dose changing to taken.
- English throughout.

## Trust and safety

Laura reminds and records. She never interprets and never advises. These rules are in her instructions from the first call.

- **The family phrase.** After checking she is speaking with Lidia, she says "Povilas says thank you again for the cherry jam" as a full sentence. Lidia never has to prove anything, and Laura never asks for money, passwords or codes.
- **No medical advice.** Asked "is that bad?" or "should I take half a tablet?", she declines kindly and says she will pass the question to Povilas.
- **Readings are repeated, not judged.** "I've noted 150 over 95." Nothing about whether it is good or bad, and no reassurance either.
- **Only the care plan.** Tablet names and doses come from the stored care plan and nowhere else.
- **Never a person.** She does not claim to be human. Asked whether she is real, she says kindly that she is a computer assistant Povilas set up.
- **Warm about the person, silent about the medicine.** She can sympathise, thank, and chat about ordinary life.

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

- Per-call context is passed as `dynamic_variables` on the outbound SIP call.
- Tool webhooks are protected with a secret header that ElevenLabs stores.
- Silence is capped at 30 seconds; `skip_turn` is the built-in tool for waiting.
- Outbound calls are started through the API with the agent id, the phone number id and the number to dial.

### Keys

All keys, the webhook secret and the phone number Laura dials live in environment variables. None go in the repo or in chat.

## Sample people and data

Everything is fictional sample data, created by a script. The demo says so out loud.

- **Lidia**, 94, the person Laura phones. Her number is whichever phone should ring in the demo, read from an environment variable.
- **Povilas**, her family carer, who looks at the website.
- **Family phrase:** "Povilas says thank you again for the cherry jam."
- **Care plan:** stored as data, not typed in during the demo. Morning tablets, a blood pressure check, and left leg swelling to watch.
- **History:** about two weeks of earlier calls, so the page is not empty: wellbeing and sleep lines, blood pressure readings, doses taken, remarks about the leg, a few errands done. Yesterday's call includes Lidia saying she slept badly, which is the detail Laura remembers. The tablet count on the page is worked out from this history, not typed in.

### Morning tablets (proposed, see open points)

| Tablet | Dose |
| --- | --- |
| Metoprolol | 47.5 mg, one tablet |
| Sanoral HCT | 40/10/12.5 mg, one tablet |
| Eliquis | 2.5 mg, one tablet |

This is a made-up schedule for the demo, not a recommendation for anyone.

## Out of scope, order of work, and morning tests

### Not in the demo build

Sign-in, typing or dictating care-plan notes, prescriptions and reorder reminders, appointments, the evening call, follow-ups carried from one call to the next beyond the one remembered detail, the quote check against the transcript, call recordings on the page, the mock shopping-order card, Lithuanian, and everything on the longer brief's stretch list. These stay in "Laura: build brief" for after the demo.

### Order of work

1. Database tables, the sample-data script, and the one webhook with its secret.
2. The Laura agent in ElevenLabs, defined from files in the repo: instructions, the six tools, the per-call variables, voice and turn settings.
3. "Call now": starts the outbound call with Lidia's name, the family phrase and the morning tablets passed in.
4. The dashboard page, subscribed to live updates, with every area in the website section.
5. The look of the page, to the standard in "How it should look".
6. A run of the whole flow with simulated tool calls sent to the webhook, fixing what breaks.

Nothing in the loop is faked. Overnight, no real calls are placed; the webhook is tested by sending it the same requests ElevenLabs would send.

### Live tests in the morning, in this order

- [ ] Press Call now. The phone rings and Laura opens with the family phrase and Lidia's name.
- [ ] Say how you are. She asks about last night's sleep, mentioning that you slept badly yesterday. The wellbeing and sleep lines appear while you are still on the call.
- [ ] She asks about the left leg. Your answer appears on the leg card.
- [ ] Let her name the tablets, stay silent for a full minute, then say they are taken. She waits, and each dose changes to taken.
- [ ] Give a blood pressure reading. She reads it back, and it appears.
- [ ] Name two things you are out of. Both appear on the errands list.
- [ ] Ask "should I take half a tablet?" She declines.
- [ ] She closes warmly, and the call shows as done with a summary.

## Open points, yours to decide

None of these is settled. Each shows what the brief currently assumes so the build is not blocked, and each is quick to change.

- [ ] **The leg question.** Decided: in.
- [ ] **Typing a note to create the care plan.** Decided: out. The care plan is stored sample data, shown read-only on the page.
- [ ] **Urgent alert.** Decided: out of the demo. No urgent alert and no text messages.
- [ ] **No sign-in.** Decided: no sign-in and no password for the demo.
- [ ] **The morning tablets.** The three listed above are a proposal you have not confirmed.
- [ ] **Povilas's relation to Lidia.** Not stated. Laura only uses his name, so it can stay open.
- [ ] **Git flow overnight.** Your normal flow (an issue per piece, a branch each, code review, merge) is assumed.
