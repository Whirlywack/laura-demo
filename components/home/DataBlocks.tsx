import Link from "next/link";
import type { CSSProperties } from "react";
import { addDays } from "../../lib/dashboard";
import type { HistoryDay } from "../../lib/history";
import { Card } from "../Card";
import { Timeline } from "../history/Timeline";

// Under the film on the home page: what a month of calls looks like, drawn with the History page's own timeline, and
// where to read the rest. The month is sample data (the same on every visit, and the blocks say so). It ends on the
// day of the film's call with that call's answers; the day before she slept badly, as Laura remembers.
const title: CSSProperties = { font: "700 30px/1.1 var(--font-sans)", letterSpacing: "-.03em" };
const line: CSSProperties = { marginTop: 6, color: "var(--text-secondary)" };
// 460px with 30px either side leaves the 400px the drawings need at full size.
const block: CSSProperties = { flex: "1.3 1 460px", minWidth: 0, padding: "30px 30px 24px" };

const LAST = "2026-11-14";
const dates = Array.from({ length: 30 }, (_, i) => addDays(LAST, i - 29));
let seed = 7;
const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const between = (low: number, high: number) => Math.round(low + random() * (high - low));
const month: HistoryDay[] = dates.flatMap((date, i): HistoryDay[] => {
  const r = random();
  const shared = { date, at: `${date}T07:30:00Z`, remark: null, doses: [], summary: null };
  if (i === 29) return [{ ...shared, felt: { rating: "good", quote: null }, slept: { rating: "well", quote: null }, reading: { systolic: 140, diastolic: 80, pulse: null, quote: "", at: date } }];
  if (i === 28) return [{ ...shared, felt: { rating: "okay", quote: null }, slept: { rating: "not well", quote: null }, reading: { systolic: 142, diastolic: 85, pulse: null, quote: "", at: date } }];
  if (random() < 0.04) return [];
  return [{
    ...shared,
    felt: { rating: r < 0.55 ? "good" : r < 0.88 ? "okay" : "bad", quote: null },
    slept: { rating: random() < 0.7 ? "well" : "not well", quote: null },
    reading: random() < 0.9 ? { systolic: between(126, 158), diastolic: between(72, 92), pulse: null, quote: "", at: date } : null,
  }];
});

export function DataBlocks() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", marginTop: "var(--gap-cards)" }}>
      <Card style={block}>
        <div style={title}>Lidia&apos;s blood pressure, every morning</div>
        <div style={line}>A sample month. Each line runs from the lower number to the higher. A gap means no reading that day.</div>
        {/* The History page's timeline as a picture: its day links are switched off here. */}
        <div style={{ marginTop: 18, pointerEvents: "none" }}>
          <Timeline dates={dates} days={month} range="1m" only={["Blood pressure"]} width={400} label="A month of blood pressure readings, one line a day from the lower number to the higher." />
        </div>
      </Card>
      <Card style={block}>
        <div style={title}>How Lidia felt, how she slept</div>
        <div style={line}>The same sample month. Two questions, one dot a day.</div>
        <div style={{ marginTop: 18, pointerEvents: "none" }}>
          <Timeline dates={dates} days={month} range="1m" only={["How she felt", "How she slept"]} width={400} label="A month of her answers: how she felt (good, okay or bad) and how she slept (well or not well), one dot a day." />
        </div>
      </Card>
      <Card tone="quiet" style={{ ...block, flex: "1 1 320px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={title}>The days add up</div>
        <div style={line}>The same questions every morning become a record you can read back: a month, three months or a year, and any single day in Lidia&apos;s own words.</div>
        <div role="img" aria-label="39 of 42 dots filled" style={{ alignSelf: "stretch", display: "grid", gridTemplateColumns: "repeat(14,1fr)", gap: 8, marginTop: 22 }}>
          {Array.from({ length: 42 }, (_, i) => (
            <span key={i} style={{ aspectRatio: "1", borderRadius: "50%", boxSizing: "border-box", ...(i < 39 ? { background: "var(--accent)" } : { border: "2px solid var(--accent)" }) }} />
          ))}
        </div>
        <div style={{ ...line, marginTop: 10 }}>39 of 42 of Lidia&apos;s tablets confirmed on the call in the last two weeks.</div>
        <div style={{ flex: 1, minHeight: 24 }} />
        <Link href="/demo/history" className="laura-button" style={{ padding: "13px 26px", borderRadius: "var(--radius-pill)", background: "var(--accent)", color: "var(--text-on-accent)", font: "var(--text-label)", textDecoration: "none" }}>
          Open History
        </Link>
      </Card>
    </div>
  );
}
