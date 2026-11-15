import type { CSSProperties, ReactNode } from "react";
import { Card } from "./Card";

// Ported from .claude/skills/laura-design/components/core/AnswerCard.jsx: card or action tone, and quiet for an
// answer that asks nothing of the carer.
type Props = { question: string; answer: ReactNode; tone?: "card" | "action" | "quiet"; children?: ReactNode; style?: CSSProperties };

export function AnswerCard({ question, answer, tone = "card", children, style }: Props) {
  return (
    <Card tone={tone} style={{ display: "flex", flexDirection: "column", minWidth: 0, ...style }}>
      <div style={{ font: "var(--text-label)", color: tone === "card" ? "var(--text-question)" : "inherit" }}>{question}</div>
      <div style={{ font: "var(--text-answer)", letterSpacing: "var(--tracking-display)", marginTop: 18, textWrap: "balance" }}>{answer}</div>
      {children ? <div style={{ flex: 1, minHeight: 28 }} /> : null}
      {children}
    </Card>
  );
}
