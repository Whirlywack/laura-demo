"use client";

import { useRef, useState, type CSSProperties } from "react";
import { DOSE_STATUSES, calendarDay, type CallStatus, type DashboardState, type Dose } from "../lib/dashboard";
import { day, sentence, time } from "../lib/format";
import { AnswerCard } from "./AnswerCard";
import { CallNow } from "./CallNow";
import { Card } from "./Card";
import { DatedList } from "./DatedList";
import { DoseBars } from "./DoseBars";
import { Errands } from "./Errands";
import { HistoryView } from "./HistoryView";
import { LiveFeed } from "./LiveFeed";
import { KeyValueRows, QuietRow } from "./QuietRow";
import { QuoteFact } from "./QuoteFact";
import { SiteHeader } from "./SiteHeader";
import { StatLine } from "./StatLine";
import { StatusLabel } from "./StatusLabel";

// The dashboard at /demo, from .claude/skills/laura-design/ui_kits/dashboard/Dashboard.jsx: the three answer cards on
// top, then Today or History on the left and the feed on the right, on every tab. The server reads the state
// (app/demo/page.tsx) and live updates refresh it; which tab is open stays here.

// Today's Doses in words, under the bars that show them: e.g. "2 taken on call, 1 says taken earlier."
const dosesInWords = (doses: Dose[], callStatus: CallStatus) => {
  const said = DOSE_STATUSES.map((status) => ({ status, n: doses.filter((d) => d.status === status).length }))
    .filter(({ n }) => n)
    .map(({ status, n }) => `${n} ${status}`);
  if (said.length) return `${sentence(said.join(", "))}.`;
  return callStatus === "done" ? "Not asked on this call." : "Laura will ask on the call.";
};

const waiting: CSSProperties = { color: "var(--text-meta)" };
const noWellbeing = { "not called yet": "Not called yet today", live: "Laura is asking…", done: "Not asked on this call" };
const title: CSSProperties = { font: "700 30px/1.1 var(--font-sans)", letterSpacing: "-.03em" };
const line: CSSProperties = { marginTop: 4, color: "var(--text-secondary)" };
const detailCard: CSSProperties = { flex: "1 1 260px", minWidth: 0, padding: "28px 30px 26px", display: "flex", flexDirection: "column" };
const strongQuote: CSSProperties = { marginTop: 14, font: "var(--text-quote)", fontWeight: 700 };

export function Dashboard({ state, now }: { state: DashboardState; now: string }) {
  const { callStatus, todayAt, summary, wellbeing, doses, bloodPressure, leftLeg, errands, passOns, feed, carePlan, previousSummary, history, lastCall, tabletCount } = state;
  const [tab, setTab] = useState<"today" | "history">("today");
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [planOpen, setPlanOpen] = useState(false);
  const plan = useRef<HTMLDivElement>(null);

  const showHistory = () => {
    setTab("history");
    setOpenDay(null);
  };
  const showCarePlan = () => {
    setTab("today");
    setPlanOpen(true);
    requestAnimationFrame(() => plan.current?.scrollIntoView({ block: "center" }));
  };

  const menuItem = (label: string, active: boolean, onClick: () => void) => (
    <button
      type="button"
      className="laura-button"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      style={{ border: 0, borderBottom: `3px solid ${active ? "var(--ink)" : "transparent"}`, background: "none", padding: "8px 0", minHeight: "var(--hit-min)", font: "inherit", fontWeight: active ? 700 : 400, color: "inherit", cursor: "pointer" }}
    >
      {label}
    </button>
  );

  const reading = bloodPressure.today;
  const sevenDaysAgo = calendarDay(Date.parse(now) - 6 * 24 * 60 * 60 * 1000);
  const readings = [...(reading ? [{ ...reading, strong: true }] : []), ...bloodPressure.earlier];
  const feedTitle = callStatus === "live" ? "Live from the call" : callStatus === "done" ? "Today's call" : lastCall && calendarDay(lastCall.at) === calendarDay(Date.parse(now) - 24 * 60 * 60 * 1000) ? "Yesterday's call" : lastCall ? `Last call · ${day(lastCall.at)}` : "Live from the call";
  const feedCards = callStatus === "not called yet" ? (lastCall?.feed ?? []) : feed;

  return (
    <>
      <SiteHeader
        menu={
          <>
            {menuItem("Today", tab === "today", () => setTab("today"))}
            {menuItem("Care plan", false, showCarePlan)}
            {menuItem("History", tab === "history", showHistory)}
          </>
        }
      >
        <div>Lidia, 94</div>
        <CallNow status={callStatus} />
      </SiteHeader>

      {/* The three questions the Family carer has, answered in the only large type on the page. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)" }}>
        <AnswerCard
          style={{ flex: "1.5 1 420px" }}
          question="Is she okay today?"
          answer={wellbeing.general ? `“${wellbeing.general}”` : <span style={waiting}>{noWellbeing[callStatus]}</span>}
        >
          {wellbeing.sleep ? <QuoteFact inline fact="Sleep" quote={wellbeing.sleep} /> : <div style={waiting}>Sleep · not asked yet</div>}
          {/* Laura's own words as she closed the Call, so no quotation marks. */}
          {summary ? (
            <div style={{ marginTop: 24 }}>
              <div style={{ font: "var(--text-label)", marginBottom: 8 }}>Laura's summary</div>
              <div style={{ font: "var(--text-body)", color: "var(--text-secondary)", maxWidth: "60ch" }}>{summary}</div>
            </div>
          ) : null}
          {/* What Laura promised to pass on, in her words and plain ink. */}
          {passOns.length ? (
            <div style={{ marginTop: 24 }}>
              <div style={{ font: "var(--text-label)", marginBottom: 12 }}>For Paul</div>
              {passOns.map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, padding: "var(--pad-row)", borderTop: "1px solid var(--rule)", font: "var(--text-quote)" }}>
                  <span>“{p.quote}”</span>
                  <span style={{ font: "var(--text-meta-font)", color: "var(--text-meta)", whiteSpace: "nowrap" }}>{time(p.at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ ...waiting, marginTop: 8 }}>For Paul · nothing to pass on</div>
          )}
        </AnswerCard>
        <AnswerCard style={{ flex: "1 1 300px" }} question="Did she take her tablets?" answer={`${doses.filter((d) => d.status === "taken on call").length} of ${doses.length}`}>
          <DoseBars doses={doses} style={{ marginBottom: 20 }} />
          <div style={{ color: "var(--text-secondary)" }}>{dosesInWords(doses, callStatus)}</div>
        </AnswerCard>
        <Errands style={{ flex: "1 1 400px", paddingBottom: 26 }} errands={errands.map((e) => ({ id: e.id, label: e.item, quote: e.quote, meta: day(e.at), done: e.done }))} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", marginTop: "var(--gap-cards)", alignItems: "flex-start" }}>
        <div style={{ flex: "3 1 640px", minWidth: 0 }}>
          {tab === "history" ? (
            <HistoryView
              calls={history}
              today={{ status: callStatus, at: todayAt, now }}
              tabletCount={tabletCount}
              open={openDay}
              onOpen={setOpenDay}
              onToday={() => setTab("today")}
            />
          ) : (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", alignItems: "stretch" }}>
                <Card style={detailCard}>
                  <div style={title}>Tablets</div>
                  <div style={line}>Laura waits while she takes them.</div>
                  <div style={{ marginTop: 14 }}>
                    {doses.map((d) => (
                      <QuoteFact key={d.name} fact={d.name} detail={d.strength} quote={d.quote} muted={d.status === "not confirmed"} status={<StatusLabel status={d.status} />} />
                    ))}
                  </div>
                  <div style={{ flex: 1, minHeight: 20 }} />
                  <div style={{ paddingTop: 12, borderTop: "1px solid var(--rule)" }}>
                    {tabletCount.total ? (
                      <StatLine label="Confirmed on the call:" value={`${tabletCount.confirmed} of ${tabletCount.total}`} suffix="in the last two weeks" />
                    ) : (
                      <span style={{ font: "var(--text-quote)", color: "var(--text-secondary)" }}>No calls in the last two weeks</span>
                    )}
                  </div>
                </Card>
                {/* Shown as she read it out, in plain ink: never coloured, ranked or commented on. */}
                <Card tone="quiet" style={detailCard}>
                  <div style={title}>Blood pressure</div>
                  <div style={line}>{reading ? "She read it out on the call." : callStatus === "done" ? "Not read on this call." : "Not read yet today."}</div>
                  {reading ? <div style={{ ...strongQuote, fontWeight: 400 }}>“{reading.quote}”</div> : null}
                  <DatedList
                    style={{ marginTop: 14 }}
                    items={readings.map((r) => ({ date: "strong" in r ? "Today" : day(r.at), value: `${r.systolic}/${r.diastolic}`, strong: "strong" in r }))}
                    limit={Math.max(1, readings.filter((r) => calendarDay(r.at) >= sevenDaysAgo).length)}
                    onShowAll={showHistory}
                  />
                </Card>
                <Card style={detailCard}>
                  <div style={title}>Left leg</div>
                  <div style={line}>{leftLeg.today ? "In her words today." : callStatus === "done" ? "Not asked on this call." : "Not asked yet today."}</div>
                  {leftLeg.today ? <div style={strongQuote}>“{leftLeg.today.quote}”</div> : null}
                  <DatedList style={{ marginTop: 14 }} items={leftLeg.earlier.map((r) => ({ date: day(r.at), quote: r.quote }))} onShowAll={showHistory} />
                </Card>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", marginTop: "var(--gap-cards)", alignItems: "flex-start" }}>
                <div ref={plan} style={{ flex: "1 1 360px", minWidth: 0 }}>
                  <QuietRow title="Care plan" note="What Laura knows about her · read-only" open={planOpen} onToggle={() => setPlanOpen((o) => !o)}>
                    <KeyValueRows
                      rows={[
                        ...carePlan.medications.map((m) => ({ label: m.name, value: `${m.strength} · ${m.timeOfDay}` })),
                        { label: "Asks about", value: sentence(carePlan.watchItems.join(", ")) },
                        { label: "Family phrase", value: carePlan.familyPhrase },
                      ]}
                    />
                    {/* Where Laura's remembered detail comes from. Her own words, so no quotation marks. */}
                    {previousSummary ? (
                      <div style={{ padding: "11px 0", borderTop: "1px solid var(--rule)" }}>
                        <span style={{ color: "var(--text-primary)" }}>From the last call:</span> {previousSummary}
                      </div>
                    ) : null}
                  </QuietRow>
                </div>
                <QuietRow style={{ flex: "1 1 360px", minWidth: 0 }} title="History" note="Every call before today" open={false} onToggle={showHistory} action="Open" />
              </div>
            </>
          )}
        </div>

        <Card tone="quiet" style={{ flex: "1 1 340px", minWidth: 0, padding: "32px 32px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, font: "var(--text-meta-font)", color: "var(--text-secondary)" }}>
            <b>{feedTitle}</b>
            <span>Newest first</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <LiveFeed cards={feedCards.map((c) => ({ id: c.id, title: c.title, quote: c.quote, time: time(c.at) }))} />
          </div>
        </Card>
      </div>
    </>
  );
}
