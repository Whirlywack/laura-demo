import type { CSSProperties } from "react";
import type { CallStatus, HistoryCall } from "../lib/dashboard";
import { dateNumber, fullDate, time, weekday } from "../lib/format";
import { Card } from "./Card";
import { StatLine } from "./StatLine";
import { StatusLabel } from "./StatusLabel";

// The History tab: every earlier Call as a date tile, and one day at a time. It replaces the left region of the
// dashboard; the feed stays on the right. No charts and no colours on readings: Laura records, she doesn't interpret.
const heading: CSSProperties = { font: "700 40px/1.05 var(--font-sans)", letterSpacing: "var(--tracking-display)", margin: 0 };
const big: CSSProperties = { font: "700 var(--size-answer)/1 var(--font-sans)", letterSpacing: "var(--tracking-display)" };
const title: CSSProperties = { font: "700 30px/1.1 var(--font-sans)", letterSpacing: "-.03em" };
const line: CSSProperties = { marginTop: 4, color: "var(--text-secondary)" };
const cardPad: CSSProperties = { flex: "1 1 260px", minWidth: 0, padding: "28px 30px 26px" };
const pill = (disabled = false): CSSProperties => ({
  border: "2px solid var(--ink)", borderRadius: "var(--radius-pill)", background: "none", padding: "9px 20px", minHeight: "var(--hit-min)",
  font: "var(--text-label)", color: "var(--ink)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1,
});

const onCall = (c: HistoryCall) => c.doses.filter((d) => d.status === "taken on call").length;

type Props = {
  calls: HistoryCall[];
  today: { status: CallStatus; at: string | null; now: string };
  tabletCount: { confirmed: number; total: number };
  open: number | null;
  onOpen: (index: number | null) => void;
  onToday: () => void;
};

export function HistoryView({ calls, today, tabletCount, open, onOpen, onToday }: Props) {
  const call = open === null ? undefined : calls[open];
  return call ? <Day call={call} index={open!} last={calls.length - 1} onOpen={onOpen} /> : <Grid calls={calls} today={today} tabletCount={tabletCount} onOpen={onOpen} onToday={onToday} />;
}

function Grid({ calls, today, tabletCount, onOpen, onToday }: Omit<Props, "open">) {
  const tile: CSSProperties = {
    display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, minHeight: 176, padding: "20px 22px", boxSizing: "border-box",
    border: 0, borderRadius: "var(--radius-card)", background: "var(--surface-card)", color: "var(--text-primary)", font: "var(--text-body)", textAlign: "left", cursor: "pointer",
  };
  const todayStatus = today.status === "live" ? "On the phone now" : today.status === "done" && today.at ? `Called at ${time(today.at)}` : "Not called yet";
  // 164px tiles, as many as fit; on a phone the minimum shrinks so two still fit side by side.
  return (
    <div>
      <h2 style={heading}>Earlier calls</h2>
      <div style={{ ...line, marginTop: 10 }}>Press a day to see how she was.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(164px, calc((100% - var(--gap-cards)) / 2)), 1fr))", gap: "var(--gap-cards)", marginTop: 24 }}>
        <button type="button" className="laura-button" onClick={onToday} style={{ ...tile, background: "var(--surface-quiet)" }}>
          <span style={{ font: "var(--text-label)" }}>Today</span>
          <span style={big}>{dateNumber(today.at ?? today.now)}</span>
          <span style={{ color: "var(--text-secondary)" }}>{todayStatus}</span>
        </button>
        {calls.map((c, i) => (
          <button key={c.at} type="button" className="laura-button" onClick={() => onOpen(i)} style={tile}>
            <span style={{ font: "var(--text-label)" }}>{weekday(c.at)}</span>
            <span style={big}>{dateNumber(c.at)}</span>
            <span style={{ color: "var(--text-secondary)" }}>
              {onCall(c)} of {c.doses.length} tablets
            </span>
            <span style={{ fontVariantNumeric: "tabular-nums", color: c.reading ? "var(--text-primary)" : "var(--text-meta)" }}>
              {c.reading ? `${c.reading.systolic}/${c.reading.diastolic}` : "No reading"}
            </span>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <StatLine label="Tablets confirmed on the call:" value={`${tabletCount.confirmed} of ${tabletCount.total}`} suffix="in the last two weeks" />
      </div>
    </div>
  );
}

function Day({ call, index, last, onOpen }: { call: HistoryCall; index: number; last: number; onOpen: (index: number | null) => void }) {
  const notTaken = call.doses.filter((d) => d.status === "not taken" && d.quote);
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
        <button type="button" className="laura-button" onClick={() => onOpen(null)} style={pill()}>
          All days
        </button>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" className="laura-button" disabled={index === last} onClick={() => onOpen(index + 1)} style={pill(index === last)}>
            Day before
          </button>
          <button type="button" className="laura-button" disabled={index === 0} onClick={() => onOpen(index - 1)} style={pill(index === 0)}>
            Day after
          </button>
        </div>
      </div>
      <h2 style={{ ...heading, marginTop: 28 }}>{fullDate(call.at)}</h2>
      <div style={{ ...line, marginTop: 10 }}>
        Called at {time(call.at)}. {onCall(call)} of {call.doses.length} tablets taken on the call.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", marginTop: 24, alignItems: "stretch" }}>
        <Card style={cardPad}>
          <div style={title}>In her words</div>
          <div style={{ font: "700 var(--size-lead)/var(--leading-lead) var(--font-sans)", letterSpacing: "var(--tracking-lead)", marginTop: 14 }}>
            {call.wellbeing.general ? `“${call.wellbeing.general}”` : <span style={{ color: "var(--text-meta)" }}>Not asked how she was</span>}
          </div>
          {call.remark ? (
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--rule)", font: "var(--text-quote)" }}>
              <div style={{ fontWeight: 700 }}>Left leg</div>
              <div style={{ color: "var(--text-secondary)" }}>“{call.remark.quote}”</div>
            </div>
          ) : null}
        </Card>
        <Card tone="quiet" style={cardPad}>
          <div style={title}>Tablets</div>
          <div style={{ marginTop: 14 }}>
            {call.doses.map((d) => (
              <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px 12px", padding: "11px 0", borderTop: "1px solid var(--rule)" }}>
                <b>{d.name}</b>
                <StatusLabel status={d.status} />
              </div>
            ))}
            {notTaken.map((d) => (
              <div key={d.name} style={{ paddingTop: 10, font: "var(--text-quote)", color: "var(--text-secondary)" }}>
                “{d.quote}”
              </div>
            ))}
          </div>
        </Card>
        <Card style={cardPad}>
          <div style={title}>Blood pressure</div>
          <div style={line}>As she read it out.</div>
          <div style={{ ...heading, marginTop: 14, fontVariantNumeric: "tabular-nums", ...(call.reading ? {} : { color: "var(--text-meta)" }) }}>
            {call.reading ? `${call.reading.systolic}/${call.reading.diastolic}` : "Not read"}
          </div>
          {call.reading?.pulse != null ? <div style={{ marginTop: 6, font: "var(--text-quote)" }}>Pulse {call.reading.pulse}</div> : null}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--rule)", font: "var(--text-quote)" }}>
            <div style={{ fontWeight: 700 }}>Asked for</div>
            <div style={{ color: "var(--text-secondary)" }}>{call.errands.length ? call.errands.join(", ") : "Nothing that day."}</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
