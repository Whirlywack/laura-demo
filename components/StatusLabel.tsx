import type { CSSProperties } from "react";
import type { DoseStatus } from "../lib/dashboard";

// Ported from .claude/skills/laura-design/components/core/StatusLabel.jsx, keyed by the brief's Dose status wording.
// Every marker has the same border box, so a Dose changing on an open page eases from one state to the next.
// Transitions only run on a change, so nothing moves when the page loads.
const STATES: Record<DoseStatus, { label: string; mark: CSSProperties; color: string }> = {
  "taken on call": { label: "Taken on call", mark: { borderStyle: "solid", borderColor: "var(--status-taken)", backgroundColor: "var(--status-taken)" }, color: "var(--text-primary)" },
  "says taken earlier": { label: "Says taken earlier", mark: { borderStyle: "solid", borderColor: "var(--status-taken)", backgroundColor: "transparent" }, color: "var(--text-primary)" },
  "not confirmed": { label: "Not confirmed", mark: { borderStyle: "dashed", borderColor: "var(--ink-3)", backgroundColor: "transparent" }, color: "var(--text-meta)" },
  "not taken": { label: "Not taken", mark: { borderStyle: "solid", borderColor: "var(--ink)", backgroundColor: "var(--ink)" }, color: "var(--text-primary)" },
};

const change = "background-color var(--motion-state), border-color var(--motion-state), color var(--motion-state)";

export function StatusLabel({ status }: { status: DoseStatus }) {
  // A status in none of these, written some other way than by Laura, shows as not confirmed, as in the reference.
  const s = STATES[status] ?? STATES["not confirmed"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, font: "var(--text-meta-font)", color: s.color, whiteSpace: "nowrap", transition: change }}>
      <span style={{ width: "var(--marker)", height: "var(--marker)", borderRadius: "50%", borderWidth: 2, boxSizing: "border-box", flex: "none", transition: change, ...s.mark }} />
      <span style={status === "not taken" ? { fontWeight: 700 } : undefined}>{s.label}</span>
    </span>
  );
}
