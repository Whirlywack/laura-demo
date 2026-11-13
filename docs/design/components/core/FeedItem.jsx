import React from 'react';

export function FeedItem({ title, time, quote, speaker = 'lidia', isNew = false, last = false, style }) {
  const text = speaker === 'lidia' && quote ? '\u201C' + quote + '\u201D' : quote;
  return (
    <div style={{ padding: last ? '14px 0 0' : 'var(--pad-row)', borderBottom: last ? 0 : '1px solid var(--rule)', font: 'var(--text-quote)', color: speaker === 'laura' ? 'var(--text-secondary)' : 'var(--text-primary)', animation: isNew ? 'laura-arrive var(--motion-arrive)' : 'none', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', font: 'var(--text-meta-font)', color: isNew ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: isNew ? 700 : 400 }}>
          {isNew ? <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} /> : null}
          <span>{title}</span>
        </span>
        <span style={{ fontWeight: isNew ? 700 : 400 }}>{isNew ? 'Just now' : time}</span>
      </div>
      <div style={{ marginTop: 3, fontWeight: isNew ? 700 : 400 }}>{text}</div>
    </div>
  );
}
