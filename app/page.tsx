import { AnswerCard } from "../components/AnswerCard";
import { CallStatus } from "../components/CallStatus";
import { Card } from "../components/Card";
import { LiveFeed } from "../components/LiveFeed";
import { LiveUpdates } from "../components/LiveUpdates";
import { KeyValueRows, QuietRow } from "../components/QuietRow";
import { QuoteFact } from "../components/QuoteFact";
import { StatusLabel } from "../components/StatusLabel";
import { getDashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";

export const dynamic = "force-dynamic";

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Times as they are on her clock, in Lithuania.
const time = (at: string) =>
  new Date(at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Vilnius" });

const waiting = { color: "var(--text-meta)" };
const noWellbeing = { "not called yet": "Not called yet today", live: "Laura is asking…", done: "Not asked on this call" };

export default async function Page() {
  const { callStatus, wellbeing, doses, feed, carePlan } = await getDashboardState(readClient());

  return (
    <main style={{ padding: "0 24px 28px", maxWidth: 1760, margin: "0 auto", boxSizing: "border-box" }}>
      <LiveUpdates />
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 40px", padding: "22px 20px" }}>
        <div style={{ font: "700 var(--size-wordmark)/1 var(--font-sans)", letterSpacing: "-.04em" }}>Laura</div>
        <div style={{ flex: 1 }} />
        <CallStatus status={callStatus} />
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)" }}>
        <AnswerCard
          style={{ flex: "1.5 1 420px" }}
          question="Is she okay today?"
          answer={wellbeing.general ? `“${wellbeing.general}”` : <span style={waiting}>{noWellbeing[callStatus]}</span>}
        >
          {wellbeing.sleep ? <QuoteFact inline fact="Sleep" quote={wellbeing.sleep} /> : <div style={waiting}>Sleep · not asked yet</div>}
        </AnswerCard>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", marginTop: "var(--gap-cards)", alignItems: "flex-start" }}>
        <div style={{ flex: "3 1 640px", minWidth: 0 }}>
          <Card style={{ padding: "32px 40px 36px" }}>
            <div style={{ font: "var(--text-meta-font)", fontWeight: 700, color: "var(--text-secondary)" }}>Details from today's call</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "32px 56px", marginTop: 20 }}>
              <div style={{ flex: "1.35 1 320px", minWidth: 0 }}>
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
            </div>
          </Card>
          <QuietRow style={{ marginTop: "var(--gap-cards)" }} title="Care plan" note="What Laura knows about her · read-only">
            <KeyValueRows
              rows={[
                ...carePlan.medications.map((m) => ({ label: m.name, value: `${m.strength} · ${m.timeOfDay}` })),
                { label: "Asks about", value: sentence(carePlan.watchItems.join(", ")) },
                { label: "Family phrase", value: carePlan.familyPhrase },
              ]}
            />
          </QuietRow>
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
