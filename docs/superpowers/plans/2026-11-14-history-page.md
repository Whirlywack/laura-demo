# History page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A History page at `/demo/history` (1 month / 3 months / 1 year timeline plus a calendar) and a page per day at `/demo/history/[date]`, with Laura recording a rating for how Lidia felt and slept.

**Architecture:** Server components read a range of Calls from Supabase and draw the timeline as hand-written SVG (links per day column, CSS hover); the calendar and the day page are plain server components with links. Laura's `log_wellbeing` gains an optional `rating`; the webhook validates it per aspect. The sample data grows to a year from a fixed seed, keeping the last 13 days unchanged. The dashboard keeps reading only the last 14 days.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase, vitest (unit + local-db projects), ElevenLabs agent tests.

**Spec:** `docs/superpowers/specs/2026-11-14-history-page-design.md`

Execution: native, chosen by the user ("create that, push, do code review with Fable, fix, merge").

## Global Constraints

- Ratings: general → `good` | `okay` | `bad`; sleep → `well` | `not well`. Shown as "Good", "Okay", "Bad", "Well", "Not well".
- Ranges: `1m` = 30 days, `3m` = 91 days, `1y` = 365 days, ending today (her calendar, Europe/Vilnius). Default `1m`.
- Scales: Blood pressure 60–190, Pulse 40–120. Ink only; no good/bad colours, no averages, no line across a missing day.
- 3 months: felt/slept counted per 7-day block from the start of the range; 1 year: per calendar month.
- Day page never shows Pass-ons or Errands. Laura's summary has no quotation marks (her words); Lidia's words always do.
- Design tokens only (`app/globals.css`); every internal link must resolve (`tests/repo.test.ts`).

## Review Focus

1. A day with two Calls (an unanswered retry, then the real one) → the day page shows the one that recorded something.
2. A date in the address that is malformed or has no Call → 404, not a crash.
3. A range with long gaps (no Calls for days) → empty columns, no line drawn across them; the calendar shows those days as not pressable.
4. Real Calls from before ratings existed → no dot in the felt/slept lanes, the day page shows her words only.
5. Laura sends a rating that doesn't fit the aspect ("good" for sleep) → 400, nothing recorded.

---

### Task 1: Laura records a rating

**Files:** Modify `agent/tools.json`, `agent/instructions.md`, `app/api/tools/[tool]/route.ts`, `agent/tests.json`, `GLOSSARY.md`. Test `tests/wellbeing.test.ts`, `tests/laura-agent.test.ts`.

**Produces:** Entry `details.rating?: "good" | "okay" | "bad" | "well" | "not well"` on `wellbeing` Entries.

- [ ] Tests: `log_wellbeing` with `aspect: "general", rating: "good"` stores `details: { aspect: "general", rating: "good" }`; `aspect: "sleep", rating: "good"` → 400 and nothing recorded; no rating → stored without one. `laura-agent.test.ts` spec table: `log_wellbeing: ["quote", "aspect", "rating?"]`.
- [ ] Implement: optional enum property in `tools.json` (description: pick from what she said; leave out only if her answer does not say); webhook checks the rating against the aspect; one line in beat 2 of the instructions; Wellbeing glossary entry names its rating.
- [ ] ElevenLabs test "Laura call: how she is is recorded with a rating" in `agent/tests.json`; run `npm run laura-agent` and `npm run laura-agent:test -- 1 rating`.
- [ ] `npm run check`; commit.

### Task 2: A year of sample data

**Files:** Modify `scripts/sample-data.ts`. Test `tests/history.test.ts`, `tests/history-page.test.ts` (new).

- [ ] Add `felt` and `slept` ratings to the 13 hand-written days (from their words). Generate days 14–365 from a fixed-seed generator: ~3% no Call; ~88% with a Reading, pulse on ~60%; Doses mostly taken on call; an Errand on ~8% (done); a plain summary built from that day's facts; words drawn from small per-rating pools.
- [ ] Insert in chunks of 500 rows.
- [ ] Tests: after a reset, 365 earlier days minus the skipped ones; the 13 latest unchanged (existing tests stay green); every sample wellbeing Entry has a rating.

### Task 3: Read a range and a day

**Files:** Create `lib/history.ts`. Modify `lib/dashboard.ts` (dashboard reads only the last 14 days). Test `tests/history-page.test.ts`.

**Produces:**
- `type Felt = "good" | "okay" | "bad"`, `type Slept = "well" | "not well"`
- `type HistoryDay = { date: string; at: string; felt: { rating: Felt | null; quote: string | null }; slept: { rating: Slept | null; quote: string | null }; reading: Reading | null; remark: string | null; doses: Dose[]; summary: string | null }`
- `rangeDays: { "1m": 30, "3m": 91, "1y": 365 }`, `type Range = keyof typeof rangeDays`
- `getHistory(db, days: number): Promise<HistoryDay[]>` — oldest first, one per calendar day that has a Call that recorded something (the latest such Call that day).
- `getHistoryDay(db, date: string): Promise<{ day: HistoryDay; before: string | null; after: string | null } | null>`

- [ ] Tests: `getHistory(db, 30)` after a reset returns ≤ 30 days, oldest first, each with ratings and a date; two Calls on one day → the one with Entries wins; `getHistoryDay` for yesterday returns its summary ("Lidia slept badly…"), `after: null` before Today's Call, `before` the day before; an unknown date → null.

### Task 4: The History page and the day page

**Files:** Create `app/demo/history/page.tsx`, `app/demo/history/[date]/page.tsx`, `components/history/Timeline.tsx`, `components/history/HistoryCalendar.tsx`, `components/history/DayReport.tsx`. Modify `components/Dashboard.tsx` (History menu item, "See all", "Open" → `/demo/history`; `?plan=1` opens the care plan), `app/demo/page.tsx`, `docs/demo-brief.md`; delete `components/HistoryView.tsx`.

- [ ] Build to the final mockup (`.superpowers/brainstorm/…/history-page-v5.html`) with the design tokens.
- [ ] `/demo/history/2026-02-30` and a date with no Call → 404 (`notFound()`).
- [ ] Browser check at 1440 and 390 for all three ranges and a day page; `npm run check`; `npm run build`; commit.

### Task 5: Review and merge

- [ ] Push, open the PR, Fable code review (Standards + Spec), fix, merge when the check is green.
