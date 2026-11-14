import { AnswerCard } from "../../components/AnswerCard";
import { CallNow } from "../../components/CallNow";
import { Card } from "../../components/Card";
import { DatedList } from "../../components/DatedList";
import { DoseBars } from "../../components/DoseBars";
import { Errands } from "../../components/Errands";
import { FoldedRow } from "../../components/FoldedRow";
import { LiveFeed } from "../../components/LiveFeed";
import { LiveUpdates } from "../../components/LiveUpdates";
import { KeyValueRows, QuietRow } from "../../components/QuietRow";
import { QuoteFact } from "../../components/QuoteFact";
import { SiteHeader } from "../../components/SiteHeader";
import { StatLine } from "../../components/StatLine";
import { StatusLabel } from "../../components/StatusLabel";
import { DOSE_STATUSES, getDashboardState, readingValue, type CallStatus, type Dose } from "../../lib/dashboard";
import { readClient } from "../../lib/supabase";

export const dynamic = "force-dynamic";

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Times as they are on her clock, in Lithuania.
const time = (at: string) =>
  new Date(at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Vilnius" });

// Dates as on her calendar, e.g. "Thu 12 Nov".
const day = (at: string) =>
  new Date(at).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Vilnius" });

// The Doses on an earlier Call: how many were taken on call, and the status of each one that was not.
const tablets = (doses: Dose[]) => {
  const onCall = doses.filter((d) => d.status === "taken on call").length;
  const others = doses.filter((d) => d.status !== "taken on call").map((d) => `${d.name} ${d.status}`);
  return [`${onCall} of ${doses.length} tablets taken on call`, ...others].join(" · ");
};

// Today's Doses in words, under the bars that show them: e.g. "2 taken on call, 1 says taken earlier."
const dosesInWords = (doses: Dose[], callStatus: CallStatus) => {
  const said = DOSE_STATUSES.map((status) => ({ status, n: doses.filter((d) => d.status === status).length }))
    .filter(({ n }) => n)
    .map(({ status, n }) => `${n} ${status}`);
  if (said.length) return `${sentence(said.join(", "))}.`;
  return callStatus === "done" ? "Not asked on this call." : "Laura will ask on the call.";
};

const waiting = { color: "var(--text-meta)" };
const noWellbeing = { "not called yet": "Not called yet today", live: "Laura is asking…", done: "Not asked on this call" };

export default async function Page() {
  const { callStatus, summary, wellbeing, doses, bloodPressure, leftLeg, errands, passOns, feed, carePlan, previousSummary, history, tabletCount } =
    await getDashboardState(readClient());
  const reading = bloodPressure.today;

  return (
    <main style={{ padding: "0 24px 28px", boxSizing: "border-box" }}>
      <LiveUpdates />
      <SiteHeader>
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
                <div
                  key={i}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, padding: "var(--pad-row)", borderTop: "1px solid var(--rule)", font: "var(--text-quote)" }}
                >
                  <span>“{p.quote}”</span>
                  <span style={{ font: "var(--text-meta-font)", color: "var(--text-meta)", whiteSpace: "nowrap" }}>{time(p.at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ ...waiting, marginTop: 8 }}>For Paul · nothing to pass on</div>
          )}
        </AnswerCard>
        {/* The tablet count sits in the top row, so it can be seen moving as each Dose is recorded. */}
        <AnswerCard
          style={{ flex: "1 1 300px" }}
          question="Did she take her tablets?"
          answer={`${doses.filter((d) => d.status === "taken on call").length} of ${doses.length}`}
        >
          <DoseBars doses={doses} style={{ marginBottom: 20 }} />
          <div style={{ color: "var(--text-secondary)" }}>{dosesInWords(doses, callStatus)}</div>
          <div style={{ marginTop: 12 }}>
            {tabletCount.total ? (
              <StatLine label="Tablets confirmed on the call:" value={`${tabletCount.confirmed} of ${tabletCount.total}`} suffix="in the last two weeks" />
            ) : (
              <span style={{ font: "var(--text-quote)", color: "var(--text-secondary)" }}>No calls in the last two weeks</span>
            )}
          </div>
        </AnswerCard>
        <Errands
          style={{ flex: "1 1 400px", paddingBottom: 26 }}
          errands={errands.map((e) => ({ id: e.id, label: e.item, quote: e.quote, meta: day(e.at), done: e.done }))}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", marginTop: "var(--gap-cards)", alignItems: "flex-start" }}>
        <div style={{ flex: "3 1 640px", minWidth: 0 }}>
          <Card style={{ padding: "32px 40px 36px" }}>
            <div style={{ font: "var(--text-meta-font)", fontWeight: 700, color: "var(--text-secondary)" }}>Details from today's call</div>
            {/* Tablets, then Blood pressure and Left leg side by side beneath; all three in a row once there is room. */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "32px 56px", marginTop: 20 }}>
              <div style={{ flex: "1 1 320px", minWidth: 0 }}>
                <div style={{ font: "var(--text-label)", marginBottom: 12 }}>Tablets</div>
                {doses.map((d) => (
                  <QuoteFact
                    key={d.name}
                    fact={d.name}
                    detail={`${d.strength} · ${d.timeOfDay}`}
                    quote={d.quote}
                    muted={d.status === "not confirmed"}
                    status={<StatusLabel status={d.status} />}
                  />
                ))}
              </div>
              <div style={{ flex: "2 1 656px", minWidth: 0, display: "flex", flexWrap: "wrap", gap: "32px 56px" }}>
                <div style={{ flex: "1 1 300px", minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ font: "var(--text-label)" }}>Blood pressure</span>
                    <span style={{ font: "var(--text-meta-font)", color: "var(--text-meta)" }}>{reading ? time(reading.at) : ""}</span>
                  </div>
                  {/* Shown as she read it out, in plain ink: never coloured, ranked or commented on. */}
                  <div
                    style={{
                      font: "700 var(--size-reading)/1 var(--font-sans)",
                      letterSpacing: "var(--tracking-reading)",
                      fontVariantNumeric: "tabular-nums",
                      marginTop: 14,
                      ...(reading ? {} : waiting),
                    }}
                  >
                    {reading ? `${reading.systolic}/${reading.diastolic}` : callStatus === "done" ? "No reading on this call" : "Not read yet"}
                  </div>
                  {reading && reading.pulse !== null ? (
                    <div style={{ font: "var(--text-quote)", marginTop: 10, fontVariantNumeric: "tabular-nums" }}>Pulse {reading.pulse}</div>
                  ) : null}
                  {reading ? <div style={{ font: "var(--text-quote)", marginTop: 10, color: "var(--text-secondary)" }}>“{reading.quote}”</div> : null}
                  <DatedList
                    style={{ marginTop: 16 }}
                    items={bloodPressure.earlier.map((r) => ({ date: day(r.at), value: readingValue(r) }))}
                  />
                </div>
                <div style={{ flex: "1 1 300px", minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ font: "var(--text-label)" }}>Left leg</span>
                    <span style={{ font: "var(--text-meta-font)", color: "var(--text-meta)" }}>{leftLeg.today ? time(leftLeg.today.at) : ""}</span>
                  </div>
                  <div
                    style={{
                      font: "700 var(--size-lead)/var(--leading-lead) var(--font-sans)",
                      letterSpacing: "var(--tracking-lead)",
                      marginTop: 14,
                      ...(leftLeg.today ? {} : waiting),
                    }}
                  >
                    {leftLeg.today ? `“${leftLeg.today.quote}”` : callStatus === "done" ? "Not asked on this call" : "Not asked yet"}
                  </div>
                  <DatedList style={{ marginTop: 16 }} items={leftLeg.earlier.map((r) => ({ date: day(r.at), quote: r.quote }))} />
                </div>
              </div>
            </div>
          </Card>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", marginTop: "var(--gap-cards)", alignItems: "flex-start" }}>
            <QuietRow style={{ flex: "1 1 360px", minWidth: 0 }} title="Care plan" note="What Laura knows about her · read-only">
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
            <FoldedRow style={{ flex: "1 1 360px", minWidth: 0 }} title="History" note="Every call before today">
              {history.length ? (
                <KeyValueRows
                  rows={history.map((c) => ({
                    label: day(c.at),
                    value: (
                      <>
                        <div style={{ color: "var(--text-primary)" }}>{c.wellbeing.general ? `“${c.wellbeing.general}”` : "Not asked how she was"}</div>
                        <div>Sleep · {c.wellbeing.sleep ? `“${c.wellbeing.sleep}”` : "not asked"}</div>
                        <div style={{ fontVariantNumeric: "tabular-nums" }}>
                          {c.reading ? readingValue(c.reading) : "No reading"} · {tablets(c.doses)}
                        </div>
                      </>
                    ),
                  }))}
                />
              ) : null}
            </FoldedRow>
          </div>
        </div>

        <Card tone="quiet" style={{ flex: "1 1 340px", minWidth: 0, padding: "32px 32px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", font: "var(--text-meta-font)", color: "var(--text-secondary)" }}>
            <b>Live from the call</b>
            <span>Newest first</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <LiveFeed cards={feed.map((c) => ({ id: c.id, title: c.title, quote: c.quote, time: time(c.at) }))} />
          </div>
        </Card>
      </div>
    </main>
  );
}
