import type { CSSProperties } from "react";
import type { Dose, DoseStatus } from "../lib/dashboard";

// Ported from .claude/skills/laura-design/components/core/DoseBars.jsx: one bar per Dose on Today's Call.
// Like StatusLabel, every bar has the same border box, so a Dose changing on an open page eases into its new state.
const FILL: Record<DoseStatus, CSSProperties> = {
  "taken on call": { borderStyle: "solid", borderColor: "var(--status-taken)", backgroundColor: "var(--status-taken)" },
  "says taken earlier": { borderStyle: "solid", borderColor: "var(--status-taken)", backgroundColor: "transparent" },
  "not confirmed": { borderStyle: "dashed", borderColor: "var(--status-pending)", backgroundColor: "transparent" },
  "not taken": { borderStyle: "solid", borderColor: "var(--ink)", backgroundColor: "var(--ink)" },
};

export function DoseBars({ doses, style }: { doses: Dose[]; style?: CSSProperties }) {
  return (
    <div role="img" aria-label={doses.map((d) => `${d.name} ${d.status}`).join(", ")} style={{ display: "flex", gap: 8, ...style }}>
      {doses.map((d) => (
        <span
          key={d.name}
          style={{
            flex: 1, height: 14, borderRadius: 7, borderWidth: 2, boxSizing: "border-box",
            transition: "background-color var(--motion-state), border-color var(--motion-state)", ...FILL[d.status],
          }}
        />
      ))}
    </div>
  );
}
