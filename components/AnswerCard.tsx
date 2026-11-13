import type { CSSProperties, ReactNode } from "react";
import { Card } from "./Card";

// Ported from .claude/skills/laura-design/components/core/AnswerCard.jsx, card tone only so far.
export function AnswerCard({ question, answer, children, style }: { question: string; answer: ReactNode; children?: ReactNode; style?: CSSProperties }) {
  return (
    <Card style={{ display: "flex", flexDirection: "column", minWidth: 0, ...style }}>
      <div style={{ font: "var(--text-label)", color: "var(--text-question)" }}>{question}</div>
      <div style={{ font: "var(--text-answer)", letterSpacing: "var(--tracking-display)", marginTop: 18, textWrap: "balance" }}>{answer}</div>
      {children ? <div style={{ flex: 1, minHeight: 28 }} /> : null}
      {children}
    </Card>
  );
}
