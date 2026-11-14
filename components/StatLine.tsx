import type { CSSProperties } from "react";

// Ported from .claude/skills/laura-design/components/core/StatLine.jsx.
// One plain sentence with a single bold number: the only statistic on the page.
export function StatLine({ label, value, suffix, style }: { label?: string; value: string; suffix?: string; style?: CSSProperties }) {
  return (
    <span style={{ font: "var(--text-quote)", color: "var(--text-secondary)", ...style }}>
      {label}
      {label ? " " : ""}
      <b style={{ fontWeight: 700, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{value}</b>
      {suffix ? ` ${suffix}` : ""}
    </span>
  );
}
