import Link from "next/link";
import type { CSSProperties } from "react";
import { menuItem, SiteHeader } from "../SiteHeader";

// The header on the History page and a day's page: the dashboard's menu, as links back to it.
export function HistoryHeader() {
  return (
    <SiteHeader
      menu={
        <>
          <Link href="/demo" style={menuItem(false)}>Today</Link>
          <Link href="/demo?plan=1" style={menuItem(false)}>Care plan</Link>
          <Link href="/demo/history" aria-current="page" style={menuItem(true)}>History</Link>
        </>
      }
    >
      <div>Lidia, 94</div>
    </SiteHeader>
  );
}

/** A pill-shaped link: the ranges, All days, Day before and Day after. `on` fills it; `off` is a pill with nowhere to go. */
export const pill = (on = false, off = false): CSSProperties => ({
  display: "inline-flex", alignItems: "center", boxSizing: "border-box", minHeight: "var(--hit-min)", padding: "8px 20px",
  border: "2px solid var(--ink)", borderRadius: "var(--radius-pill)", font: "var(--text-label)", textDecoration: "none", whiteSpace: "nowrap",
  color: on ? "var(--text-on-accent)" : "var(--ink)", background: on ? "var(--ink)" : "none", opacity: off ? 0.3 : 1,
});
