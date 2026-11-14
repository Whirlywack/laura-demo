import Link from "next/link";
import type { CSSProperties } from "react";
import { addDays } from "../../lib/dashboard";
import type { HistoryDay } from "../../lib/history";
import { Card } from "../Card";
import { Timeline } from "../history/Timeline";

// Under the film on the home page: what a month of calls looks like, drawn with the History page's own timeline, and
// where to read the rest. The month is made up (the same on every visit) and ends on Friday 13 November.
const title: CSSProperties = { font: "700 30px/1.1 var(--font-sans)", letterSpacing: "-.03em" };
const line: CSSProperties = { marginTop: 6, color: "var(--text-secondary)" };
const block: CSSProperties = { flex: "1.3 1 440px", minWidth: 0, padding: "30px 32px 24px" };

const LAST = "2026-11-13";
const dates = Array.from({ length: 30 }, (_, i) => addDays(LAST, i - 29));
let seed = 7;
const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const between = (low: number, high: number) => Math.round(low + random() * (high - low));
const month: HistoryDay[] = dates.flatMap((date): HistoryDay[] => {
  const r = random();
  if (random() < 0.04) return [];
  return [{
    date, at: `${date}T07:30:00Z`, remark: null, doses: [], summary: null,
    felt: { rating: r < 0.55 ? "good" : r < 0.88 ? "okay" : "bad", quote: null },
    slept: { rating: random() < 0.7 ? "well" : "not well", quote: null },
    reading: random() < 0.9 ? { systolic: between(126, 158), diastolic: between(72, 92), pulse: null, quote: "", at: date } : null,
  }];
});

export function DataBlocks() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", marginTop: "var(--gap-cards)" }}>
      <Card style={block}>
        <div style={title}>Her blood pressure, every morning</div>
        <div style={line}>A month of readings, each drawn as she read it out. A gap is a day she did not measure.</div>
        {/* The History page's timeline as a picture: its day links are switched off here. */}
        <div style={{ marginTop: 18, pointerEvents: "none" }}>
          <Timeline dates={dates} days={month} range="1m" only={["Blood pressure"]} width={480} />
        </div>
      </Card>
      <Card style={block}>
        <div style={title}>How she felt, how she slept</div>
        <div style={line}>Her own answer to the same two questions, one dot a day.</div>
        <div style={{ marginTop: 18, pointerEvents: "none" }}>
          <Timeline dates={dates} days={month} range="1m" only={["How she felt", "How she slept"]} width={480} />
        </div>
      </Card>
      <Card tone="action" style={{ ...block, flex: "1 1 320px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={title}>The days add up to her story</div>
        <div style={{ ...line, color: "inherit" }}>
          Five questions every morning become a record the family can read back: a month, three months or a year, and any single day in her own words.
        </div>
        <div style={{ flex: 1, minHeight: 24 }} />
        <Link href="/demo/history" style={{ padding: "13px 26px", borderRadius: "var(--radius-pill)", background: "var(--ink)", color: "var(--text-on-accent)", font: "var(--text-label)", textDecoration: "none" }}>
          Open History
        </Link>
      </Card>
    </div>
  );
}
