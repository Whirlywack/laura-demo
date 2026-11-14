import type { CSSProperties } from "react";
import type { CallStatus as Status } from "../lib/dashboard";

// Ported from .claude/skills/laura-design/components/core/CallStatus.jsx; wording from the brief.
const pill: CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 12, minHeight: "var(--hit-min)", padding: "12px 22px",
  borderRadius: "var(--radius-pill)", font: "var(--text-label)", whiteSpace: "nowrap", boxSizing: "border-box",
};

export function CallStatus({ status }: { status: Status }) {
  if (status === "live") {
    return (
      <span role="status" style={{ ...pill, background: "var(--surface-quiet)", color: "var(--text-primary)" }}>
        <span style={{ width: "var(--marker)", height: "var(--marker)", borderRadius: "50%", background: "var(--accent)" }} />
        Live
      </span>
    );
  }
  if (status === "done") {
    return <span role="status" style={{ ...pill, boxShadow: "inset 0 0 0 2px var(--ink)" }}>Done</span>;
  }
  return <span role="status" style={{ font: "var(--text-body)", color: "var(--text-secondary)" }}>Not called yet</span>;
}
