import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { Card } from "../../../../components/Card";
import { HistoryHeader, pill } from "../../../../components/history/HistoryHeader";
import { StatusLabel } from "../../../../components/StatusLabel";
import { longDate, sentence, time } from "../../../../lib/format";
import { getHistoryDay, rangeOf } from "../../../../lib/history";
import { readClient } from "../../../../lib/supabase";

export const dynamic = "force-dynamic";

const title: CSSProperties = { font: "700 var(--size-lead)/1.1 var(--font-sans)", letterSpacing: "var(--tracking-lead)" };
const big: CSSProperties = { marginTop: 14, font: "700 var(--size-reading)/1 var(--font-sans)", letterSpacing: "var(--tracking-reading)" };
const words: CSSProperties = { marginTop: 10, font: "var(--text-quote)", color: "var(--text-secondary)" };
const quiet: CSSProperties = { ...words, color: "var(--text-meta)" };
const card: CSSProperties = { padding: "26px 28px", minWidth: 0 };

// One answer of hers: the rating Laura noted, large, and her words under it. Before ratings, only her words.
function Answer({ heading, rating, quote }: { heading: string; rating: string | null; quote: string | null }) {
  return (
    <Card style={card}>
      <div style={title}>{heading}</div>
      {rating ? <div style={big}>{sentence(rating)}</div> : null}
      {quote ? <div style={words}>“{quote}”</div> : <div style={quiet}>Not asked on this call.</div>}
    </Card>
  );
}

// A day's page: on the left her answers, her Reading, her left leg and each Dose; on the right Laura's summary. What she
// asked to pass on to Paul is not shown here. The range she came from rides along, so All days goes back to it.
export default async function Page({ params, searchParams }: { params: Promise<{ date: string }>; searchParams: Promise<{ range?: string | string[] }> }) {
  const [{ date }, query] = await Promise.all([params, searchParams]);
  const range = rangeOf(query.range);
  const page = await getHistoryDay(readClient(), date);
  if (!page) notFound();
  const { day, before, after } = page;
  const step = (to: string | null, label: ReactNode) =>
    to ? <Link href={`/demo/history/${to}?range=${range}`} className="laura-button" style={pill()}>{label}</Link> : <span aria-disabled="true" style={pill(false, true)}>{label}</span>;
  const onCall = day.doses.filter((d) => d.status === "taken on call").length;

  return (
    <main style={{ padding: "0 24px 40px", boxSizing: "border-box" }}>
      <HistoryHeader />
      <nav aria-label="Days" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10 }}>
        <Link href={`/demo/history?range=${range}`} className="laura-button" style={pill()}>All days</Link>
        <span style={{ display: "flex", gap: 10 }}>
          {step(before, "Day before")}
          {step(after, "Day after")}
        </span>
      </nav>
      <h1 style={{ margin: "24px 0 0", font: "700 var(--size-reading)/1.05 var(--font-sans)", letterSpacing: "var(--tracking-display)" }}>{longDate(day.at)}</h1>
      <p style={{ margin: "10px 0 0", color: "var(--text-secondary)" }}>
        Called at {time(day.at)}. {onCall} of {day.doses.length} tablets taken on the call.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", marginTop: 24, alignItems: "flex-start" }}>
        <div style={{ flex: "2 1 520px", minWidth: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "var(--gap-cards)" }}>
          <Answer heading="How she felt" rating={day.felt.rating} quote={day.felt.quote} />
          <Answer heading="How she slept" rating={day.slept.rating} quote={day.slept.quote} />
          {/* As she read it out, in plain ink: never coloured, ranked or commented on. */}
          <Card tone="quiet" style={card}>
            <div style={title}>Blood pressure</div>
            {day.reading ? (
              <>
                <div style={{ ...big, fontVariantNumeric: "tabular-nums" }}>{day.reading.systolic}/{day.reading.diastolic}</div>
                {day.reading.pulse === null ? null : <div style={{ marginTop: 8 }}>Pulse {day.reading.pulse}</div>}
                <div style={words}>“{day.reading.quote}”</div>
              </>
            ) : (
              <div style={quiet}>Not read on this call.</div>
            )}
          </Card>
          <Card style={card}>
            <div style={title}>Left leg</div>
            {day.remark ? <div style={{ ...words, color: "var(--text-primary)", fontWeight: 700 }}>“{day.remark}”</div> : <div style={quiet}>Not asked on this call.</div>}
          </Card>
          <Card style={card}>
            <div style={title}>Tablets</div>
            <div style={{ marginTop: 12 }}>
              {day.doses.map((d) => (
                <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "var(--pad-row)", borderTop: "1px solid var(--rule)" }}>
                  <b style={{ font: "var(--text-quote)", fontWeight: 700 }}>{d.name}</b>
                  <StatusLabel status={d.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
        {/* Laura's own words as she closed the Call, so no quotation marks. */}
        <Card tone="quiet" style={{ ...card, flex: "1 1 300px" }}>
          <div style={title}>Laura's summary</div>
          {day.summary ? (
            <>
              <div style={{ marginTop: 14, maxWidth: "60ch" }}>{day.summary}</div>
              <div style={{ ...quiet, marginTop: 16 }}>Laura's own words at the end of the call.</div>
            </>
          ) : (
            <div style={quiet}>No summary on this call.</div>
          )}
        </Card>
      </div>
    </main>
  );
}
