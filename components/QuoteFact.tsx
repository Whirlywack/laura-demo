import type { ReactNode } from "react";

// Ported from .claude/skills/laura-design/components/core/QuoteFact.jsx: a row with a status (default) or the inline form.
type Props = { fact: string; detail?: string; quote?: string | null; status?: ReactNode; inline?: boolean; muted?: boolean };

export function QuoteFact({ fact, detail, quote, status, inline = false, muted = false }: Props) {
  const q = quote ? `“${quote}”` : null;
  if (inline) {
    return (
      <div style={{ font: "var(--text-body)", color: "var(--text-secondary)" }}>
        <b style={{ fontWeight: 700, color: "var(--text-primary)" }}>{fact}</b>
        {q ? ` · ${q}` : null}
      </div>
    );
  }
  return (
    <div
      style={{
        padding: "var(--pad-row)",
        borderTop: "1px solid var(--rule)",
        font: "var(--text-quote)",
        color: muted ? "var(--text-meta)" : "var(--text-primary)",
        transition: "color var(--motion-state)",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "4px 16px" }}>
        <span>
          <b style={{ fontWeight: 700 }}>{fact}</b>
          {detail ? ` ${detail}` : null}
        </span>
        {status}
      </div>
      {q ? <div style={{ marginTop: 4, color: muted ? "inherit" : "var(--text-secondary)" }}>{q}</div> : null}
    </div>
  );
}
