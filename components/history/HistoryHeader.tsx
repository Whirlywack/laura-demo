import type { CSSProperties, ReactNode } from "react";
import { SiteHeader } from "../SiteHeader";

// The header on the History page and a day's page.
export function HistoryHeader() {
  return (
    <SiteHeader current="history">
      <div>Lidia, 94</div>
    </SiteHeader>
  );
}

/** The top of the History page and of a day's page, laid out the same on both so nothing moves between them: the
 * title with its pills (ranges, or All days and the days either side) on one row, and one plain line under it. */
export function PageTitle({ title, line, pills, children }: { title: string; line: ReactNode; pills: string; children: ReactNode }) {
  return (
    // Indented like the header above it, so the title sits under the wordmark and the pills under the menu.
    <div style={{ padding: "22px 20px 30px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px 24px" }}>
        <h1 style={{ margin: 0, font: "700 var(--size-reading)/1.05 var(--font-sans)", letterSpacing: "var(--tracking-display)" }}>{title}</h1>
        <nav aria-label={pills} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {children}
        </nav>
      </div>
      <p style={{ margin: "10px 0 0", color: "var(--text-secondary)" }}>{line}</p>
    </div>
  );
}

/** The two columns under the title on both pages: the wide one, and the narrow one on the right. */
export const columns: CSSProperties = { display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", alignItems: "flex-start" };
export const wide: CSSProperties = { flex: "3 1 600px", minWidth: 0 };
// No width cap: when the two no longer fit side by side, the narrow one takes the full width under the wide one.
export const narrow: CSSProperties = { flex: "1 1 350px", minWidth: 0 };

/** A pill-shaped link: the ranges, All days, Day before and Day after. `on` fills it; `off` is a pill with nowhere to go. */
export const pill = (on = false, off = false): CSSProperties => ({
  display: "inline-flex", alignItems: "center", boxSizing: "border-box", minHeight: "var(--hit-min)", padding: "8px 20px",
  border: "2px solid var(--ink)", borderRadius: "var(--radius-pill)", font: "var(--text-label)", textDecoration: "none", whiteSpace: "nowrap",
  color: on ? "var(--text-on-accent)" : "var(--ink)", background: on ? "var(--ink)" : "none", opacity: off ? 0.3 : 1,
});
