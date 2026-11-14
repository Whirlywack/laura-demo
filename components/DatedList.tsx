import type { CSSProperties } from "react";

// Ported from .claude/skills/laura-design/components/core/DatedList.jsx, remark form only so far: her words under the date, newest first.
export function DatedList({ items, style }: { items: { date: string; quote: string }[]; style?: CSSProperties }) {
  return (
    <div style={{ font: "var(--text-quote)", ...style }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "11px 0", borderTop: "1px solid var(--rule)" }}>
          <span style={{ font: "var(--text-meta-font)", color: "var(--text-meta)" }}>{it.date}</span>
          <span style={{ color: "var(--text-secondary)" }}>“{it.quote}”</span>
        </div>
      ))}
    </div>
  );
}
