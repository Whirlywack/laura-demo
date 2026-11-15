import Link from "next/link";
import { Card } from "../../../components/Card";
import { HistoryCalendar } from "../../../components/history/HistoryCalendar";
import { columns, narrow, PageTitle, pill, wide } from "../../../components/history/HistoryHeader";
import { DoseKey, Timeline } from "../../../components/history/Timeline";
import { addDays, calendarDay } from "../../../lib/dashboard";
import { getHistory, RANGES, rangeOf, type Range } from "../../../lib/history";
import { readClient } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

const LABELS: Record<Range, string> = { "1m": "1 month", "3m": "3 months", "1y": "1 year" };
// The title says which stretch is shown (the menu above already says History).
const TITLES: Record<Range, string> = { "1m": "The last month", "3m": "The last three months", "1y": "The last year" };

// The History page: a month, three months or a year of what Laura noted, on one timeline, with a calendar beside it.
// The range is in the address, so a view can be shared and the back button works. Pressing a day opens its page,
// which has the same frame (layout.tsx), title row and two columns, so nothing moves on the way.
export default async function Page({ searchParams }: { searchParams: Promise<{ range?: string | string[] }> }) {
  const range = rangeOf((await searchParams).range);
  const all = await getHistory(readClient(), RANGES[range]);
  // The timeline is drawn again in the browser, so it is sent only what it draws: no words of hers, no summaries.
  const days = all.map((d) => ({
    ...d, remark: null, summary: null,
    felt: { rating: d.felt.rating, quote: null }, slept: { rating: d.slept.rating, quote: null },
    reading: d.reading && { ...d.reading, quote: "" },
    doses: d.doses.map((dose) => ({ ...dose, strength: "", quote: null })),
  }));
  const today = calendarDay(Date.now());
  const dates = Array.from({ length: RANGES[range] }, (_, i) => addDays(today, i + 1 - RANGES[range]));

  return (
    <>
      <PageTitle title={TITLES[range]} line={range === "1y" ? "Everything Laura has noted, month by month, as Lidia said it. The calendar opens a day." : "Everything Laura has noted, day by day, as Lidia said it. Press a day to open it."} pills="Range">
        {(Object.keys(RANGES) as Range[]).map((r) => (
          <Link key={r} href={`/demo/history?range=${r}`} aria-current={r === range ? "page" : undefined} className="laura-button" style={pill(r === range)}>
            {LABELS[r]}
          </Link>
        ))}
      </PageTitle>
      <div style={columns}>
        <Card style={{ ...wide, padding: "28px 30px 22px" }}>
          {days.length ? <Timeline key={range} dates={dates} days={days} range={range} /> : <div style={{ color: "var(--text-secondary)" }}>No calls in this time yet.</div>}
        </Card>
        <div style={{ ...narrow, display: "flex", flexDirection: "column", gap: "var(--gap-cards)" }}>
          <Card className="laura-still" style={{ padding: "24px 20px" }}>
            <HistoryCalendar key={range} first={dates[0]} last={today} called={days.map((d) => d.date)} range={range} />
          </Card>
          {/* The timeline's key. It says how each mark is drawn, never what a value means. */}
          <Card tone="quiet" style={{ padding: "14px 24px 16px", font: "var(--text-meta-font)" }}>
            {[
              ["Blood pressure", range === "1y" ? "a bar from the lowest number she read out that month (of either of the two) to the highest." : "a line from the lower number to the higher, as she read it out."],
              ["Pulse", range === "1y" ? "the lowest and the highest she gave that month." : "a dot, on the days she gave it."],
              ["Felt and slept", range === "1m" ? "a dot on her answer that day." : `how many days she gave each answer, ${range === "3m" ? "week by week" : "month by month"}.`],
              ["Tablets", range === "1m" ? "a mark for each tablet, each morning." : `how many days each was taken on the call, ${range === "3m" ? "week by week" : "month by month"}.`],
              ["A gap", "a day without a call, or without that answer."],
            ].map(([what, how], i) => (
              <div key={what} style={{ padding: "8px 0", borderTop: i ? "1px solid var(--rule)" : undefined, color: "var(--text-secondary)" }}>
                <b style={{ color: "var(--text-primary)" }}>{what}:</b> {how}
                {what === "Tablets" && range === "1m" ? <DoseKey style={{ marginTop: 8, color: "var(--text-primary)" }} /> : null}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
