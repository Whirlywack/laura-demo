import { Dashboard } from "../../components/Dashboard";
import { LiveUpdates } from "../../components/LiveUpdates";
import { getDashboardState } from "../../lib/dashboard";
import { readClient } from "../../lib/supabase";

export const dynamic = "force-dynamic";

// Paul's dashboard. The server reads the state on every request and on every live update (LiveUpdates refreshes the
// page); components/Dashboard.tsx lays it out. `now` is passed down so the server and the browser agree on what "today"
// and "yesterday" are. ?plan=1 (Care plan in the History pages' menu) opens the Care plan.
export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string | string[] }> }) {
  const [state, { plan }] = await Promise.all([getDashboardState(readClient()), searchParams]);

  return (
    <main style={{ padding: "0 24px 28px", boxSizing: "border-box" }}>
      <LiveUpdates />
      <Dashboard state={state} now={new Date().toISOString()} openPlan={plan === "1"} />
    </main>
  );
}
