// Ported from .claude/skills/laura-design/components/core/Checklist.jsx, on the straw card. A ticked item stays ticked.
export type ChecklistItem = { label: string; quote: string; meta: string; done: boolean };

export function Checklist({ items, onTick }: { items: ChecklistItem[]; onTick: (index: number) => void }) {
  return (
    <div>
      {items.map((it, i) => (
        <label
          key={i}
          style={{
            position: "relative", display: "flex", gap: 16, alignItems: "flex-start", padding: "14px 0",
            borderTop: "1px solid var(--rule-on-highlight)", cursor: it.done ? "default" : "pointer",
            minHeight: "var(--hit-min)", boxSizing: "border-box", color: it.done ? "var(--text-meta)" : "inherit",
          }}
        >
          <input
            type="checkbox"
            className="laura-check"
            checked={it.done}
            disabled={it.done}
            onChange={() => onTick(i)}
            style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
          />
          <span
            aria-hidden="true"
            style={{
              width: "var(--checkbox)", height: "var(--checkbox)", border: "2px solid var(--ink)", borderRadius: "var(--radius-check)",
              background: it.done ? "var(--ink)" : "var(--surface-card)", color: "var(--surface-card)", flex: "none", boxSizing: "border-box",
              display: "flex", alignItems: "center", justifyContent: "center", font: "700 var(--size-meta)/1 var(--font-sans)",
            }}
          >
            {it.done ? "✓" : ""}
          </span>
          <span style={{ flex: 1 }}>
            <span style={{ display: "flex", justifyContent: "space-between", gap: 10, font: "var(--text-body)" }}>
              <b style={{ fontWeight: 700, textDecoration: it.done ? "line-through" : "none" }}>{it.label}</b>
              <span style={{ font: "var(--text-meta-font)", whiteSpace: "nowrap" }}>{it.meta}</span>
            </span>
            <span style={{ display: "block", font: "var(--text-quote)", marginTop: 2 }}>“{it.quote}”</span>
          </span>
        </label>
      ))}
    </div>
  );
}
