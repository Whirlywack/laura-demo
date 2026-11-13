// Ported from .claude/skills/laura-design/components/core/QuoteFact.jsx, inline form only so far.
export function QuoteFact({ fact, quote }: { fact: string; quote: string }) {
  return (
    <div style={{ font: "var(--text-body)", color: "var(--text-secondary)" }}>
      <b style={{ fontWeight: 700, color: "var(--text-primary)" }}>{fact}</b> · “{quote}”
    </div>
  );
}
