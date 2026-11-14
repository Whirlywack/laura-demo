import Link from "next/link";
import { Card } from "../../../components/Card";
import { HistoryCalendar } from "../../../components/history/HistoryCalendar";
import { HistoryHeader, pill } from "../../../components/history/HistoryHeader";
import { Timeline } from "../../../components/history/Timeline";
import { addDays, calendarDay } from "../../../lib/dashboard";
import { getHistory, RANGES, rangeOf, type Range } from "../../../lib/history";
import { readClient } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

const LABELS: Record<Range, string> = { "1m": "1 month", "3m": "3 months", "1y": "1 year" };

// The History page: a month, three months or a year of what Laura noted, on one timeline, with a calendar beside it.
// The range is in the address, so a view can be shared and the back button works. Pressing a day opens its page.
export default async function Page({ searchParams }: { searchParams: Promise<{ range?: string | string[] }> }) {
  const range = rangeOf((await searchParams).range);
  const days = await getHistory(readClient(), RANGES[range]);
  const today = calendarDay(Date.now());
  const dates = Array.from({ length: RANGES[range] }, (_, i) => addDays(today, i + 1 - RANGES[range]));

  return (
    <main style={{ padding: "0 24px 40px", boxSizing: "border-box" }}>
      <HistoryHeader />
      <h1 style={{ margin: "8px 0 0", font: "700 var(--size-reading)/1 var(--font-sans)", letterSpacing: "var(--tracking-display)" }}>History</h1>
      <p style={{ margin: "10px 0 0", color: "var(--text-secondary)" }}>Everything Laura has noted, day by day, as Lidia said it. Press a day to open it.</p>
      <nav aria-label="Range" style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "20px 0 22px" }}>
        {(Object.keys(RANGES) as Range[]).map((r) => (
          <Link key={r} href={`/demo/history?range=${r}`} aria-current={r === range ? "page" : undefined} className="laura-button" style={pill(r === range)}>
            {LABELS[r]}
          </Link>
        ))}
      </nav>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", alignItems: "flex-start" }}>
        <Card style={{ flex: "3 1 600px", minWidth: 0, padding: "28px 30px 22px" }}>
          {days.length ? <Timeline dates={dates} days={days} range={range} /> : <div style={{ color: "var(--text-secondary)" }}>No calls in this time yet.</div>}
        </Card>
        <Card style={{ flex: "1 1 350px", minWidth: 0, maxWidth: 440, padding: "24px 20px" }}>
          <HistoryCalendar key={range} first={dates[0]} last={today} called={days.map((d) => d.date)} range={range} />
        </Card>
      </div>
    </main>
  );
}
