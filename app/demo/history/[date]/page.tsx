import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { Card } from "../../../../components/Card";
import { HistoryCalendar } from "../../../../components/history/HistoryCalendar";
import { columns, narrow, PageTitle, pill, wide } from "../../../../components/history/HistoryHeader";
import { QuoteFact } from "../../../../components/QuoteFact";
import { StatusLabel } from "../../../../components/StatusLabel";
import { addDays, calendarDay } from "../../../../lib/dashboard";
import { longDate, sentence, time } from "../../../../lib/format";
import { getHistoryDay, RANGES, rangeOf, type Range } from "../../../../lib/history";
import { readClient } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

// The dashboard's card type (components/Dashboard.tsx): a 30px title with one plain line under it.
const title: CSSProperties = { font: "700 30px/1.1 var(--font-sans)", letterSpacing: "-.03em" };
const line: CSSProperties = { marginTop: 4, color: "var(--text-secondary)" };
const big: CSSProperties = { marginTop: 14, font: "700 var(--size-reading)/1 var(--font-sans)", letterSpacing: "var(--tracking-reading)" };
const words: CSSProperties = { marginTop: 10, font: "var(--text-quote)", color: "var(--text-secondary)" };
// Every card in a row is as tall as the row, and the top row keeps a height that fits her longest day (a wrapped
// title and a three-line quote), so going from day to day moves nothing above the last row.
const card: CSSProperties = { flex: "1 1 240px", minWidth: 0, padding: "28px 30px 26px" };
const row: CSSProperties = { display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", alignItems: "stretch", minHeight: 292 };

// One answer of hers: the rating Laura noted, large, and her words under it. Before ratings, only her words.
function Answer({ heading, rating, quote }: { heading: string; rating: string | null; quote: string | null }) {
  return (
    <Card style={card}>
      <div style={title}>{heading}</div>
      {quote ? null : <div style={line}>Not asked on this call.</div>}
      {rating ? <div style={big}>{sentence(rating)}</div> : null}
      {quote ? <div style={words}>“{quote}”</div> : null}
    </Card>
  );
}

// A day's page, in the History page's frame: the same title row and the same two columns, with her answers, her
// Reading, her left leg and each Dose where the timeline was. The calendar is in the same place, on this day's month
// with the day marked, so any other day is one press away; Laura's summary is under it. What she asked to pass on to
// Paul is not shown here. The range she came from rides along, so All days (the filled pill) returns to it, or to the first range that holds this day.
export default async function Page({ params, searchParams }: { params: Promise<{ date: string }>; searchParams: Promise<{ range?: string | string[] }> }) {
  const [{ date }, query] = await Promise.all([params, searchParams]);
  const asked = rangeOf(query.range);
  const page = await getHistoryDay(readClient(), date);
  if (!page) notFound();
  const { day, before, after, called } = page;
  const today = calendarDay(Date.now());
  // The calendar reaches back a year whatever range she came from, so go back to the first range that holds this day.
  const holds = (r: Range) => day.date > addDays(today, -RANGES[r]);
  const range = holds(asked) ? asked : holds("3m") ? "3m" : "1y";
  const step = (to: string | null, label: ReactNode) =>
    to ? <Link href={`/demo/history/${to}?range=${range}`} className="laura-button" style={pill()}>{label}</Link> : <span role="link" aria-disabled="true" style={pill(false, true)}>{label}</span>;
  const onCall = day.doses.filter((d) => d.status === "taken on call").length;

  return (
    <>
      <PageTitle title={longDate(day.at)} line={`Called at ${time(day.at)}. ${onCall} of ${day.doses.length} tablets taken on the call.`} pills="Days">
        <Link href={`/demo/history?range=${range}`} className="laura-button" style={pill(true)}>All days</Link>
        {step(before, "Day before")}
        {step(after, "Day after")}
      </PageTitle>
      <div style={{ ...columns, alignItems: "stretch" }}>
        <div style={{ ...wide, display: "flex", flexDirection: "column", gap: "var(--gap-cards)" }}>
          <div style={row}>
            <Answer heading="How she felt" rating={day.felt.rating} quote={day.felt.quote} />
            <Answer heading="How she slept" rating={day.slept.rating} quote={day.slept.quote} />
            {/* As she read it out, in plain ink: never coloured, ranked or commented on. */}
            <Card tone="quiet" style={card}>
              <div style={title}>Blood pressure</div>
              {day.reading ? (
                <>
                  <div style={{ ...big, fontVariantNumeric: "tabular-nums" }}>{day.reading.systolic}/{day.reading.diastolic}</div>
                  <div style={words}>{day.reading.pulse === null ? "" : `Pulse ${day.reading.pulse} · `}“{day.reading.quote}”</div>
                </>
              ) : (
                <div style={line}>Not read on this call.</div>
              )}
            </Card>
          </div>
          {/* The last row is as tall as its content: nothing is under it to move. */}
          <div style={{ ...row, flex: 1, minHeight: 0 }}>
            <Card style={card}>
              <div style={title}>Left leg</div>
              {day.remark ? <div style={{ marginTop: 14, font: "700 var(--size-lead)/var(--leading-lead) var(--font-sans)", letterSpacing: "var(--tracking-lead)", textWrap: "balance" }}>“{day.remark}”</div> : <div style={line}>Not asked on this call.</div>}
            </Card>
            <Card style={{ ...card, flex: "2.1 1 400px" }}>
              <div style={title}>Tablets</div>
              <div style={{ marginTop: 14 }}>
                {day.doses.map((d) => (
                  <QuoteFact key={d.name} fact={d.name} detail={d.strength} quote={d.quote} muted={d.status === "not confirmed"} status={<StatusLabel status={d.status} />} />
                ))}
              </div>
            </Card>
          </div>
        </div>
        <div style={{ ...narrow, display: "flex", flexDirection: "column", gap: "var(--gap-cards)" }}>
          {/* The year's calendar, whatever range she came from, so the day shown is always in it. */}
          <Card style={{ padding: "24px 20px" }}>
            <HistoryCalendar first={addDays(today, -364)} last={today} called={called} range={range} selected={day.date} />
          </Card>
          {/* Laura's own words as she closed the Call, so no quotation marks. */}
          <Card tone="quiet" style={{ flex: 1, padding: "28px 30px 26px" }}>
            <div style={title}>Laura&apos;s summary</div>
            <div style={line}>{day.summary ? "Laura's own words at the end of the call." : "No summary on this call."}</div>
            {day.summary ? <div style={{ marginTop: 14 }}>{day.summary}</div> : null}
          </Card>
        </div>
      </div>
    </>
  );
}
