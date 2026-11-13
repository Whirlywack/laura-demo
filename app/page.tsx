import { CallStatus } from "../components/CallStatus";
import { KeyValueRows, QuietRow } from "../components/QuietRow";
import { getDashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";

export const dynamic = "force-dynamic";

const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function Page() {
  const { callStatus, carePlan } = await getDashboardState(readClient());

  return (
    <main style={{ padding: "0 24px 28px", maxWidth: 1760, margin: "0 auto", boxSizing: "border-box" }}>
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 40px", padding: "22px 20px" }}>
        <div style={{ font: "700 var(--size-wordmark)/1 var(--font-sans)", letterSpacing: "-.04em" }}>Laura</div>
        <div style={{ flex: 1 }} />
        <CallStatus status={callStatus} />
      </header>

      <QuietRow title="Care plan" note="What Laura knows about her · read-only">
        <KeyValueRows
          rows={[
            ...carePlan.medications.map((m) => ({ label: m.name, value: `${m.strength} · ${m.timeOfDay}` })),
            { label: "Asks about", value: sentence(carePlan.watchItems.join(", ")) },
            { label: "Family phrase", value: carePlan.familyPhrase },
          ]}
        />
      </QuietRow>
    </main>
  );
}
