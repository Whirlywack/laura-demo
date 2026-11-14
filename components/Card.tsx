import type { CSSProperties, HTMLAttributes } from "react";

// Ported from .claude/skills/laura-design/components/core/Card.jsx
const TONES: Record<string, CSSProperties> = {
  card: { background: "var(--surface-card)", color: "var(--text-primary)" },
  quiet: { background: "var(--surface-quiet)", color: "var(--text-primary)" },
  action: { background: "var(--surface-action)", color: "var(--text-primary)" },
  live: { background: "var(--surface-live)", color: "var(--text-on-live)" },
};

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "card" | "quiet" | "action" | "live";
  compact?: boolean;
};

export function Card({ tone = "card", compact = false, style, children, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      style={{
        ...TONES[tone],
        borderRadius: compact ? "var(--radius-card-compact)" : "var(--radius-card)",
        padding: compact ? "var(--pad-card-compact)" : "var(--pad-card)",
        boxSizing: "border-box",
        font: "var(--text-body)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
