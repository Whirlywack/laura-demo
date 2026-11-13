# Laura design system

Laura is a phone companion for elderly people and a calm dashboard for the family member who looks after them. Every day Laura phones the older person on their ordinary phone, asks how they are, reminds them about their tablets and waits while they take them, notes their blood pressure, and asks if anything is missing at home. While they talk, a web page fills in for the family.

Laura reminds and records. She never gives medical advice and never interprets health information.

**Two surfaces**
- **Carer dashboard** — one page for the carer (sample: Povilas), opened for a minute at a time on a laptop or phone.
- **Home page** — marketing page.

The older person (sample: Lidia, 94) never sees a screen.

**Sources.** There is no codebase or Figma file. Everything here comes from the written product brief, the founder's paper sketch of the home page (`uploads/WhatsApp Image 2026-11-13 at 23.03.27.jpeg`), and the approved explorations in `Laura Directions.dc.html`: option **15a** (dashboard) and **14a** (home page). Earlier options in that file are superseded.

## Content fundamentals

- **Her words first.** Every item carries a short quote of what she actually said, in curly double quotes: “It's a little better today, less swollen than yesterday.” Laura's own lines have no quotation marks: Take them now, take your time, I'll wait.
- **The carer's questions as headings**, in their voice: "Is she okay today?", "Did she take her tablets?", "What do I need to do?"
- **Plain, short, warm.** Sentence case everywhere. No exclamation marks, no emoji, no jargon. "Tablets", not "medications"; "Bring 2 things", not "2 open tasks".
- **Record, never interpret.** Readings are shown as said ("138/82"). No "normal", "high", "improving", no colour-coding of health values, no advice.
- **She / her** for the older person, **you** for the carer on marketing pages. Laura is "Laura", never "the AI" or "the assistant".
- **Statuses in words:** Taken on call · Says taken earlier · Not confirmed · Not taken. Call: Not called yet · Call in progress · Called at 09:30.
- **Dates and times:** "Thu 12 Nov", "09:34", "Just now". One statistic per page, as a sentence: "Tablets confirmed on the call: 39 of 42 in the last two weeks".
- British spelling.

## Visual foundations

- **Colour.** Black ink plus one petrol and one straw yellow on warm off-white. Each has one job: *petrol* = the call is live, a tablet was taken, a carer's question; *straw* = the single thing the carer has to do (once per screen, or the newest arrival on the home page); *petrol tint* = background information. No orange or red, no gradients, no clinical blue-and-white.
- **Type.** Helvetica only, bold and regular. Seven sizes: 72 (home headline), 60 (answers), 40, 26, 20 (body and labels), 18 (quotes), 16 (dates, statuses). Large type is tracked tight (−0.05em) with line-height 1. No monospace, no italics, no uppercase labels.
- **Hierarchy.** Three levels per page. Level 1 is the only large type. Level 2 is one card at reading size. Level 3 is small and to the side or folded away.
- **Surfaces.** Flat rounded cards (radius 32; folded rows 24) on the paper background, 20px apart. No shadows, no borders on cards, no textures, no images behind text. Inside cards, rows are divided by 1px rules at 16% ink.
- **Shapes.** Pills for the call control and chips; 12px round markers for status; 28px tick boxes with 8px radius.
- **Layout.** Full width, never a narrow centred column. Laptop first; every row wraps so the page stacks on a phone. Hit targets 44px or more.
- **Motion.** Only when something arrives or changes state: a feed item slides down 10px and fades in (420ms ease-out); a dose bar or marker changes (240ms). No hover lifts, no loops, nothing decorative. Reduced-motion is respected.
- **Hover and press.** Links go from petrol to ink. Buttons have no hover decoration; there is no press shrink.
- **Transparency and blur.** Not used, apart from the rule colour.
- **Imagery.** One illustration, her phone (`assets/phone.svg`), flat, on petrol. No photography has been supplied.

## Iconography

No icon set is used. The only glyphs are a tick (✓) in a completed tick box and round status markers drawn in CSS. No emoji. If icons become necessary, pick one outline set and add it here; none has been chosen.

There is **no logo**. The wordmark is "Laura" in Helvetica Bold 32, tracking −0.04em.

## Fonts

Helvetica Neue is referenced as a system font with Helvetica and Arial as fallbacks; **no font files are shipped**. On machines without Helvetica (most Windows and Android devices) the pages fall back to Arial. Supply licensed webfont files to make this exact everywhere.

## Intentional additions

Not drawn in the approved mockups, built to complete the brief's component list:
- `CallStatus` idle ("Not called yet" + Call now) and done ("Called at …") states.
- `StatusLabel` "Not taken" marker (solid black, bold text).
- The dashboard's before-call and after-call content.
- `preview/ds-loader.js`, a helper so cards and kits render before the bundle exists.

## Index

- `styles.css` — entry point; imports `tokens/colors.css`, `typography.css`, `spacing.css`, `base.css`.
- `components/core/` — `Card`, `AnswerCard`, `QuoteFact`, `StatusLabel`, `DoseBars`, `CallStatus`, `DatedList`, `Checklist`, `FeedItem`, `QuietRow` (+ `KeyValueRows`), `StatLine`. Each has `.jsx`, `.d.ts`, `.prompt.md`; `core.card.html` shows them together.
- `ui_kits/dashboard/` — carer dashboard with a playable simulated call.
- `ui_kits/home/` — home page.
- `guidelines/` — specimen cards for colour, type, spacing and brand.
- `assets/phone.svg` — the handset illustration.
- `Laura Directions.dc.html` — the exploration history (options 1a–15a).
- `SKILL.md` — makes this folder usable as an agent skill.
