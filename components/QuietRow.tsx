import { Fragment, type CSSProperties, type ReactNode } from "react";
import { Card } from "./Card";

// Ported from .claude/skills/laura-design/components/core/QuietRow.jsx.
// With `onToggle` it is folded until opened; without it, it is always open.
type Props = {
  title: string;
  note?: ReactNode;
  open?: boolean;
  onToggle?: () => void;
  children?: ReactNode;
  style?: CSSProperties;
};

export function QuietRow({ title, note, open = true, onToggle, children, style }: Props) {
  return (
    <Card compact style={style}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div>
          <div style={{ font: "var(--text-label)" }}>{title}</div>
          {note ? <div style={{ font: "var(--text-quote)", color: "var(--text-secondary)" }}>{note}</div> : null}
        </div>
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            style={{ border: 0, background: "none", padding: "10px 0", minHeight: "var(--hit-min)", font: "var(--text-quote)", fontWeight: 700, color: "var(--accent)", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            {open ? "Hide" : "Show"}
          </button>
        ) : null}
      </div>
      {open && children ? <div style={{ marginTop: 14, font: "var(--text-quote)", color: "var(--text-secondary)" }}>{children}</div> : null}
    </Card>
  );
}

export function KeyValueRows({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "150px minmax(0,1fr)" }}>
      {rows.map((r, i) => (
        <Fragment key={i}>
          <span style={{ padding: "11px 0", borderTop: "1px solid var(--rule)" }}>{r.label}</span>
          <span style={{ padding: "11px 0", borderTop: "1px solid var(--rule)" }}>{r.value}</span>
        </Fragment>
      ))}
    </div>
  );
}
