import { Fragment, type CSSProperties, type ReactNode } from "react";
import { Card } from "./Card";

// Ported from .claude/skills/laura-design/components/core/QuietRow.jsx, shown open (no fold yet).
export function QuietRow({ title, note, children, style }: { title: string; note?: ReactNode; children?: ReactNode; style?: CSSProperties }) {
  return (
    <Card compact style={style}>
      <div style={{ font: "var(--text-label)" }}>{title}</div>
      {note ? <div style={{ font: "var(--text-quote)", color: "var(--text-secondary)" }}>{note}</div> : null}
      {children ? <div style={{ marginTop: 14, font: "var(--text-quote)", color: "var(--text-secondary)" }}>{children}</div> : null}
    </Card>
  );
}

export function KeyValueRows({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr)" }}>
      {rows.map((r) => (
        <Fragment key={r.label}>
          <span style={{ padding: "11px 0", borderTop: "1px solid var(--rule)" }}>{r.label}</span>
          <span style={{ padding: "11px 0", borderTop: "1px solid var(--rule)" }}>{r.value}</span>
        </Fragment>
      ))}
    </div>
  );
}
