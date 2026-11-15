"use client";

import { useState, type CSSProperties } from "react";

// Ported from the Tablets card in .claude/skills/laura-design/ui_kits/home/Home.jsx: a 30px round tick per tablet,
// clickable on the home page so a visitor can see the three marks. Filled = taken on call; outlined = says taken
// earlier; dashed and empty = not confirmed.
type Mark = "taken" | "earlier" | "none";
const NEXT: Record<Mark, Mark> = { none: "taken", taken: "earlier", earlier: "none" };
const MARK: Record<Mark, { label: string; mark: CSSProperties; tick: string | null }> = {
  taken: { label: "Taken on call", mark: { background: "var(--accent)", border: "2px solid var(--accent)" }, tick: "var(--text-on-accent)" },
  earlier: { label: "Says taken earlier", mark: { border: "2px solid var(--accent)" }, tick: "var(--accent)" },
  none: { label: "Not confirmed", mark: { border: "2px dashed var(--ink-3)" }, tick: null },
};

export function TabletTicks({ tablets, initial }: { tablets: string[]; initial: Mark[] }) {
  const [marks, setMarks] = useState(initial);
  // Only "taken on call" counts as confirmed, as on the dashboard: "says taken earlier" is her word.
  const count = (mark: Mark) => marks.filter((m) => m === mark).length;
  const [taken, earlier] = [count("taken"), count("earlier")];

  return (
    <>
      <div style={{ marginTop: 4, color: "var(--text-secondary)" }}>
        {taken} confirmed on the call{earlier ? `, ${earlier} she says she took earlier` : ""}. Press a tablet to see each of its marks.
      </div>
      <div style={{ marginTop: 16 }}>
        {tablets.map((name, i) => {
          const m = MARK[marks[i]];
          return (
            <button
              key={name}
              type="button"
              className="laura-button"
              data-row
              onClick={() => setMarks((all) => all.map((v, j) => (j === i ? NEXT[v] : v)))}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 46, padding: 0, border: 0, borderTop: "1px solid var(--rule)", background: "none", font: "inherit", textAlign: "left", cursor: "pointer", color: m.tick ? "var(--text-primary)" : "var(--text-meta)" }}
            >
              <span style={{ width: 30, height: 30, borderRadius: "50%", flex: "none", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 240ms, border-color 240ms", ...m.mark }}>
                {m.tick ? (
                  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                    <path d="M3 8.5 L6.6 12 L13 4.5" style={{ fill: "none", stroke: m.tick, strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" }} />
                  </svg>
                ) : null}
              </span>
              <b style={{ flex: 1 }}>{name}</b>
              <span style={{ font: "var(--text-meta-font)", whiteSpace: "nowrap" }}>{m.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
