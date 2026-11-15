import Link from "next/link";
import type { CSSProperties } from "react";
import { addDays, type Dose } from "../../lib/dashboard";
import type { HistoryDay } from "../../lib/history";
import { Card } from "../Card";
import { DoseKey, Timeline } from "../history/Timeline";

// Under the film on the home page: a month of mornings on one timeline, the History page's own, so a day reads straight
// down (her blood pressure, how she felt, how she slept, her tablets), and where to read the rest. The month is sample
// data, the same on every visit; the page says so once, under Safety. It ends on the day of the film's call with that call's answers; the day
// before she slept badly, as Laura remembers; and in its last two weeks 39 of 42 tablets were taken on the call.
const title: CSSProperties = { font: "700 30px/1.1 var(--font-sans)", letterSpacing: "-.03em" };
const label: CSSProperties = { font: "var(--text-meta-font)", fontWeight: 700 };

const LAST = "2026-11-14";
const TABLETS = ["Concor", "Sanoral HCT", "Eliquis"];
// [day of the month's 30, tablet]: the three in the last two weeks not taken on the call.
const NOT_ON_CALL: Record<string, Dose["status"]> = { "19 Eliquis": "says taken earlier", "23 Sanoral HCT": "not taken", "27 Concor": "says taken earlier" };
const dates = Array.from({ length: 30 }, (_, i) => addDays(LAST, i - 29));
let seed = 7;
const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const between = (low: number, high: number) => Math.round(low + random() * (high - low));
const month: HistoryDay[] = dates.flatMap((date, i): HistoryDay[] => {
  const r = random(), lastTwoWeeks = i >= 16;
  // A missed call now and then, but none in the last two weeks: its 42 tablets are all there.
  if (!lastTwoWeeks && random() < 0.06) return [];
  const doses: Dose[] = TABLETS.map((name) => ({
    name, strength: "", timeOfDay: "morning", quote: null,
    status: NOT_ON_CALL[`${i} ${name}`] ?? (!lastTwoWeeks && random() < 0.05 ? "says taken earlier" : "taken on call"),
  }));
  const shared = { date, at: `${date}T07:30:00Z`, remark: null, doses, summary: null };
  if (i === 29) return [{ ...shared, felt: { rating: "good", quote: null }, slept: { rating: "well", quote: null }, reading: { systolic: 140, diastolic: 80, pulse: null, quote: "", at: date } }];
  if (i === 28) return [{ ...shared, felt: { rating: "okay", quote: null }, slept: { rating: "not well", quote: null }, reading: { systolic: 142, diastolic: 85, pulse: null, quote: "", at: date } }];
  return [{
    ...shared,
    felt: { rating: r < 0.55 ? "good" : r < 0.88 ? "okay" : "bad", quote: null },
    slept: { rating: random() < 0.7 ? "well" : "not well", quote: null },
    reading: random() < 0.9 ? { systolic: between(126, 158), diastolic: between(72, 92), pulse: null, quote: "", at: date } : null,
  }];
});

export function DataBlocks() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", marginTop: "var(--gap-cards)", alignItems: "stretch" }}>
      <Card style={{ flex: "3 1 600px", minWidth: 0, padding: "30px 32px 24px" }}>
        <div style={title}>A month of mornings with Lidia</div>
        <div style={{ marginTop: 8 }}>
          <Timeline
            dates={dates}
            days={month}
            range="1m"
            only={["Blood pressure", "How she felt", "How she slept", "Tablets"]}
            latest
            links={false}
            hint={false}
            label="A sample month, day by day: Lidia's blood pressure, how she felt, how she slept, and each morning tablet."
          />
        </div>
        <DoseKey style={{ marginTop: 6, paddingTop: 14, borderTop: "1px solid var(--rule)" }} />
      </Card>
      <Card tone="quiet" style={{ flex: "1 1 320px", minWidth: 0, padding: "30px 32px 28px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={label}>Day after day</div>
        <div style={{ ...title, marginTop: 6 }}>The days add up</div>
        <div style={{ marginTop: 14, color: "var(--text-secondary)" }}>
          The same questions every morning become a record you can read back: a month, three months or a year, and any single day in Lidia&apos;s own words.
        </div>
        <div style={{ marginTop: 14, color: "var(--text-secondary)" }}>
          <b style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>39 of 42</b> of Lidia&apos;s tablets confirmed on the call in the last two weeks.
        </div>
        <div style={{ flex: 1, minHeight: 24 }} />
        <Link href="/demo/history" className="laura-button" style={{ padding: "13px 26px", borderRadius: "var(--radius-pill)", background: "var(--accent)", color: "var(--text-on-accent)", font: "var(--text-label)", textDecoration: "none" }}>
          Open History
        </Link>
      </Card>
    </div>
  );
}
