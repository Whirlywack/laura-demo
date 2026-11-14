// Ported from .claude/skills/laura-design/components/core/FeedItem.jsx. Every Entry is her words, so there is no speaker.
// It always shows the time: nothing clears `isNew` while the page is open, so "Just now" would go stale.
// `isNew` drives only the arrival motion and the bold.
export function FeedItem({ title, time, quote, isNew = false, last = false }: { title: string; time: string; quote: string; isNew?: boolean; last?: boolean }) {
  return (
    <div
      style={{
        padding: last ? "14px 0 0" : "var(--pad-row)",
        borderBottom: last ? 0 : "1px solid var(--rule)",
        font: "var(--text-quote)",
        animation: isNew ? "laura-arrive var(--motion-arrive)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", font: "var(--text-meta-font)", color: isNew ? "var(--text-primary)" : "var(--text-secondary)" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: isNew ? 700 : 400 }}>
          {isNew ? <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)" }} /> : null}
          <span>{title}</span>
        </span>
        <span style={{ fontWeight: isNew ? 700 : 400 }}>{time}</span>
      </div>
      <div style={{ marginTop: 3, fontWeight: isNew ? 700 : 400 }}>“{quote}”</div>
    </div>
  );
}
