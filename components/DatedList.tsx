import type { CSSProperties } from "react";

// Ported from .claude/skills/laura-design/components/core/DatedList.jsx, newest first.
// A Remark is her words under the date; a Reading is its value on the right, as recorded.
export function DatedList({ items, style }: { items: ({ date: string; quote: string } | { date: string; value: string })[]; style?: CSSProperties }) {
  return (
    <div style={{ font: "var(--text-quote)", ...style }}>
      {items.map((it, i) =>
        "quote" in it ? (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "11px 0", borderTop: "1px solid var(--rule)" }}>
            <span style={{ font: "var(--text-meta-font)", color: "var(--text-meta)" }}>{it.date}</span>
            <span style={{ color: "var(--text-secondary)" }}>“{it.quote}”</span>
          </div>
        ) : (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "11px 0", borderTop: "1px solid var(--rule)" }}>
            <span style={{ color: "var(--text-meta)" }}>{it.date}</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{it.value}</span>
          </div>
        ),
      )}
    </div>
  );
}
