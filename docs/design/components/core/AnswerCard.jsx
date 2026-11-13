import React from 'react';
import { Card } from './Card.jsx';

export function AnswerCard({ question, answer, tone = 'card', nowrap = false, children, style }) {
  return (
    <Card tone={tone} style={{ display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
      <div style={{ font: 'var(--text-label)', color: tone === 'card' ? 'var(--text-question)' : 'inherit' }}>{question}</div>
      <div style={{ font: 'var(--text-answer)', letterSpacing: 'var(--tracking-display)', marginTop: 18, textWrap: 'balance', whiteSpace: nowrap ? 'nowrap' : 'normal' }}>{answer}</div>
      {children ? <div style={{ flex: 1, minHeight: 28 }} /> : null}
      {children}
    </Card>
  );
}
