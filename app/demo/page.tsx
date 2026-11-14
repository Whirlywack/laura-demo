import { Dashboard } from "../../components/Dashboard";
import { LiveUpdates } from "../../components/LiveUpdates";
import { getDashboardState } from "../../lib/dashboard";
import { readClient } from "../../lib/supabase";

export const dynamic = "force-dynamic";

// Paul's dashboard. The server reads the state on every request and on every live update (LiveUpdates refreshes the
// page); components/Dashboard.tsx lays it out and keeps which tab is open. `now` is passed down so the server and the
// browser agree on what "today" and "yesterday" are.
export default async function Page() {
  const state = await getDashboardState(readClient());

  return (
    <main style={{ padding: "0 24px 28px", boxSizing: "border-box" }}>
      <LiveUpdates />
      <Dashboard state={state} now={new Date().toISOString()} />
    </main>
  );
}
