import Link from "next/link";
import type { CSSProperties } from "react";

// Ported from .claude/skills/laura-design/components/core/DatedList.jsx, newest first.
// A Remark is her words under the date; a Reading is its value on the right, as recorded. `strong` marks today's row.
// Shows the first `limit` rows; when there are more, a "See all in History" line links to `moreHref` (the History page).
type Item = ({ date: string; quote: string } | { date: string; value: string }) & { strong?: boolean };

export function DatedList({ items, limit = 3, moreHref, style }: { items: Item[]; limit?: number; moreHref?: string; style?: CSSProperties }) {
  return (
    <div style={{ font: "var(--text-quote)", ...style }}>
      {items.slice(0, limit).map((it, i) => {
        const strong = it.strong ? { fontWeight: 700, color: "var(--text-primary)" } : {};
        return "quote" in it ? (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "11px 0", borderTop: "1px solid var(--rule)" }}>
            <span style={{ font: "var(--text-meta-font)", color: "var(--text-meta)", ...strong }}>{it.date}</span>
            <span style={{ color: "var(--text-secondary)", ...strong }}>“{it.quote}”</span>
          </div>
        ) : (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "11px 0", borderTop: "1px solid var(--rule)" }}>
            <span style={{ color: "var(--text-meta)", whiteSpace: "nowrap", ...strong }}>{it.date}</span>
            <span style={{ fontVariantNumeric: "tabular-nums", textAlign: "right", ...strong }}>{it.value}</span>
          </div>
        );
      })}
      {moreHref && items.length > limit ? (
        <Link
          href={moreHref}
          className="laura-button"
          style={{ display: "flex", alignItems: "center", boxSizing: "border-box", borderTop: "1px solid var(--rule)", padding: "11px 0", minHeight: "var(--hit-min)", font: "var(--text-quote)", fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}
        >
          See all in History
        </Link>
      ) : null}
    </div>
  );
}
