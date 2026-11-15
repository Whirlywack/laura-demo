# Laura design system

Laura is a phone companion for elderly people and a calm dashboard for the family member who looks after them. Every day Laura phones the older person on their ordinary phone, asks how they are, reminds them about their tablets and waits while they take them, notes their blood pressure, and asks if anything is missing at home. While they talk, a web page fills in for the family.

Laura reminds and records. She never gives medical advice and never interprets health information.

There are two surfaces:
- **Carer dashboard** (`ui_kits/dashboard`): one page for the carer, opened for a minute at a time on a laptop or phone.
- **Home page** (`ui_kits/home`): the marketing page.

The older person never sees a screen. Sample names: the older person is Lidia, 94; the carer is Paul, her grandson.

## Rules for copy

- Every item carries a short quote of what she actually said, in curly double quotes: “It's a little better today, less swollen than yesterday.” Laura's own lines have no quotation marks: Take them now, take your time, I'll wait.
- Headings on the dashboard are the carer's questions, in their voice: "Is she okay today?", "Did she take her tablets?", "What do I need to bring?"
- Plain, short, warm. Sentence case. No exclamation marks, no emoji, no jargon. Say "tablets", not "medications"; "Bring 2 things", not "2 open tasks".
- Record, never interpret. Show readings as said ("138/82"). Never write "normal", "high" or "improving", never colour-code a health value, never give advice.
- "She / her" for Lidia, the example; general copy on the home page says "an older family member" and "they". "You" for the carer on the home page. Laura is "Laura", never "the AI" or "the assistant".
- Tablet statuses, exactly: Taken on call · Says taken earlier · Not confirmed · Not taken.
- Call statuses, exactly: Not called yet · Call in progress · Called at 09:30.
- Dates and times: "Thu 12 Nov", "09:34", "Just now".
- One statistic per page, written as a sentence: "Tablets confirmed on the call: 39 of 42 in the last two weeks".
- British spelling.

## Rules for visuals

**Colour** (tokens in `tokens/colors.css`). Warm and a little vintage: brown-black ink on almond cream, with sage, burgundy and golden chamomile. Each colour has one job:
- Burgundy `#6e2233`: where the eye should go. The "Call now" button, the live dot, a tablet's tick, a carer's question, the dot on what just arrived. Never a large surface.
- Golden chamomile `#e4c463`: the single thing the carer has to do. Once per screen.
- Coastal sage `#a9bba6`: her side. The block that holds her phone, and the story block on the home page.
- Sage tint `#dde3d2`: background information (her words today, the live feed, folded rows).
- Warm ink `#2b211d`, with browns `#5a4a42` and `#6b5a50` for supporting text and dates. Never pure black.
- Almond cream `#f1e6d3` for the page, cream `#fbf6ec` for cards. Never pure white.
- Burgundy is the only red. Never orange or bright red, never gradients, never a clinical blue-and-white look.

**Type** (tokens in `tokens/typography.css`). Helvetica only (`"Helvetica Neue", Helvetica, Arial`), bold and regular. Sizes in px: 60 home headline and answers, 40, 30 card titles on the home page, 26, 20 body and labels, 18 quotes, 16 dates and statuses. Large type has letter-spacing −0.05em and line-height 1. No monospace, no italics, no uppercase labels. No font files are included.

**Hierarchy.** Three levels per page. Level 1 is the only large type (on the dashboard: the three answer cards). Level 2 is one card at reading size. Level 3 is small, to the side or folded away. On the home page every card is led by a 30px title with one plain line under it; a number never leads a card.

**Surfaces** (tokens in `tokens/spacing.css`). Flat rounded cards, radius 32 (folded rows 24), 20px apart, on the almond background. No shadows, no card borders, no textures. Rows inside cards are divided by 1px rules at 16% ink.

**Shapes.** Pills for the call control and chips. 12px round markers for status, always next to words. Tablet rows on the home page use a 30px round tick mark instead: filled burgundy with a cream tick = taken on call; outlined with a burgundy tick = says taken earlier; dashed and empty = not confirmed. 28px tick boxes with 8px radius.

**Layout.** Full width, never a narrow centred column. Laptop first; every row wraps so the page stacks on a phone. Hit targets at least 44px.

**Motion.** Only when something arrives or changes state: a new feed item slides down 10px and fades in over 420ms; a dose bar or marker changes over 240ms. Nothing decorative. Respect reduced motion.

**Imagery and icons.** One illustration: her cordless home phone standing in its charging stand, `assets/home-phone.svg`, drawn with a 3px ink outline and shown on sage. (In this repo the home page draws it in `components/home/Phone.tsx`, so its screen and handset can move.) No icon set and no emoji; the only glyph is a tick, in a completed tick box or a tablet's tick mark. There is no logo: the wordmark is Helvetica Bold: lowercase "laura" at 60px with letter-spacing −0.06em on the home page; "Laura" at 32px with −0.04em on the dashboard. In running text the name is always "Laura".

## Components (`components/core`)

Each has `Name.jsx`, `Name.d.ts` (props) and `Name.prompt.md` (usage).

- `Card` — the rounded surface; tones: card, quiet, action, live.
- `AnswerCard` — a carer's question with its answer in large type.
- `QuoteFact` — a fact plus her quotation.
- `StatusLabel` — tablet status as marker plus words.
- `DoseBars` — one bar per tablet.
- `CallStatus` — not called yet (with the "Call now" button), live, done.
- `DatedList` — earlier readings or remarks.
- `Checklist` — errands with tick boxes.
- `FeedItem` — one entry in the live call feed.
- `QuietRow` and `KeyValueRows` — folded read-only block (care plan, history).
- `StatLine` — the single-sentence statistic.

## Reference pages (`ui_kits`)

Open `ui_kits/dashboard/index.html` or `ui_kits/home/index.html` in a browser (needs internet for React). `preview/ds-loader.js` only exists to make those two pages run; it is not part of the system.

- **Dashboard**: press "Call now" (or → / Space) to play a simulated call; items arrive every 2.6 seconds.
- **Home page**: tells the story in three parts. The hero says what Laura is: her phone on sage on the left; on the right the headline, her words today, and three cards divided by colour: Tablets (cream, clickable ticks), Blood pressure (sage tint, her words and a dated list) and To bring her (chamomile). "Listen to a call" is a film with sound: press play and a two-minute call runs, the carer's page on the left filling in as Laura's and Lidia's speech bubbles appear on the right. It has play / pause and a scrubber. Under it, three blocks draw a sample month and the two-week tablet count; then "On the call", "What Laura does" (her two jobs) and "Safety". (In this repo the page has moved on from `ui_kits/home`; `docs/demo-brief.md` says what it shows.)
