# History page: design

14 Nov 2026. Agreed with the user over four rounds of mockups (`.superpowers/brainstorm/`, final: `history-page-v5.html`).

## Intent

Paul wants to understand how Lidia has been over a longer stretch, a month, three months, a year, and to open any single day as its own report, then go back. The page shows what Laura recorded and what Lidia said. It never judges: no "good" or "bad" colours, no trend arrows, no words like "high" or "improving", nothing written by a model about her health.

## What the user decided

- **A page of its own**, not a tab under today's cards: `/demo/history`, with the shared header.
- **Ranges: 1 month, 3 months, 1 year.**
- **One timeline, rows lined up by day:** Blood pressure, Pulse, How she felt (Good, Okay, Bad), How she slept (Well, Not well).
  - Blood pressure: one thin line per day from the lower number to the higher one, on a fixed scale, a gap where there was no reading. Pulse: one dot per day. Nothing averaged or smoothed.
  - How she felt and how she slept: for **1 month**, one dot per day in its lane. For **3 months**, per week, and for **1 year**, per calendar month: how many days she gave each answer, as a number with a bar as long as its share of that period's calls (one dots-per-day year was unreadable).
- **A calendar beside the timeline**, one month at a time, Monday to Sunday, so a date can be found; days with a call are shaded and pressable. Arrows and the month name (a dropdown) move between the months in the range (15 Nov: the user asked for this over a stack of twelve months; mockup `history-page-v6.html`). Hovering a timeline column highlights it and shows its date.
- **Pressing a day opens that day as its own page**, with All days, Day before and Day after.
- **The day page:** on the left How she felt (her answer as Good, Okay or Bad, with her words), How she slept (Well or Not well, with her words), Blood pressure with pulse (as she read it out), Left leg (her words), Tablets (each with its status). On the right, Laura's summary of the call. **Not shown:** what she asked to pass on to Paul.
- **Where Good / Okay / Bad and Well / Not well come from:** Laura already asks how Lidia is and how she slept. When she records each answer she also records which of those it was, from what Lidia said. No extra question. Lidia's words are always shown beside it.

## Calls made for the user (correct any)

- **Day addresses:** `/demo/history/2026-11-13`, the date on her calendar in Lithuania. The range is in the address too (`/demo/history?range=3m`), so a view can be shared and the back button works. All days returns to the range you came from.
- **A year of sample data.** Only two weeks of real calls exist, so the 3-month and 1-year views would be nearly empty. The sample-data script grows to 365 earlier days, generated from a fixed seed so every reset is identical. The last 13 days stay exactly as they are now, so yesterday's summary ("Lidia slept badly…") and the dashboard's "39 of 42" story are unchanged.
- **The dashboard:** its History menu item, every "See all N" and the History row's "Open" go to `/demo/history`. The History tab built in PR 23 (date tiles and a day view) is replaced by this page. PR 23 is merged first, as the user approved its look.
- **Today's Call is on the History page** once it records something: the user asked for "the history of everything that we have logged", and the rating Laura records on the demo call shows the same day. The glossary's History (every Call before the latest one) stays the dashboard's meaning.
- **The 13 hand-written days get ratings** read from their words; their words, readings and summaries are unchanged.
- **The dashboard reads the last 14 days**, so a year of sample data doesn't fill it; an Errand nobody has ticked stays on its list however old. ADR-0001 notes that a Call older than two weeks is no longer Today.
- **Several calls on one day** (a retry after no answer): the day page shows the latest call that day that recorded anything.
- **Old Entries without a rating** (the real calls before this change): the lane shows nothing for that day and the day page shows only her words.
- **Drawing:** inline SVG written by hand in our own components, in the design system's ink, on fixed scales: Blood pressure 60–190, Pulse 40–120. No chart library: they default to smoothing, colours and averages, and fighting those costs more than drawing four rows.
- **Accessibility:** the timeline columns are for pointing; the calendar is the keyboard and screen-reader path, a real link for every day with a call.

## Approaches considered

1. **Hand-drawn SVG in our components (chosen).** Full control over honesty (fixed scales, gaps, no smoothing) and the design system's look; a little more code.
2. A chart library (Recharts or similar). Faster to start, but defaults that interpolate across gaps, colour series and add hover cards; restyling it to the design system and turning those off is the bulk of the work.
3. Tables only. The user saw it (mockup C) and wants shapes.

## Goals, non-goals, anti-goals

- **Goals:** read a month, three months or a year at a glance; find any date; open one day as a report and come back.
- **Non-goals:** mobile polish beyond stacking (the user will do it later), printing or export, a model-written story, Lithuanian.
- **Anti-goals:** anything that judges her (colours, labels, arrows, "normal"); any drawing that invents data (a line across a missing day, an average shown as if read out); a rating Laura made up when Lidia's answer did not say.

## Changes this touches

- **Laura:** `agent/tools.json` (`log_wellbeing` gains `rating`: good, okay or bad for general; well or not well for sleep), `agent/instructions.md` (one line in beat 2), pushed with `npm run laura-agent`; an ElevenLabs check that the rating is recorded.
- **Webhook:** `app/api/tools/[tool]/route.ts` validates the rating against the aspect and stores it in the Entry's details.
- **Data:** a history read for a range (calls with their Wellbeing ratings and words, Reading with pulse, Remark, Doses, summary), and a day read by date. The dashboard keeps reading only what it shows.
- **Sample data:** 365 days, fixed seed, last 13 days unchanged.
- **Pages:** `app/demo/history/page.tsx`, `app/demo/history/[date]/page.tsx`, and the timeline, calendar and day components.
- **Docs:** the brief's website section, `GLOSSARY.md` (Wellbeing gains its rating), and the tests that pin 13 sample Calls.

## Left to the builder

Exact component split, query shape, test layout, the generator's numbers (plausible for a 94-year-old, varied, no patterns that read as a story), and how weeks are cut in the 3-month view (from the start of the range, as in the mockup, or calendar weeks).
