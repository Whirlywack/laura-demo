import React from 'react';

export function QuoteFact({ fact, detail, quote, meta, status, inline = false, muted = false, style }) {
  const q = quote ? '\u201C' + quote + '\u201D' : null;
  if (inline) {
    return (
      <div style={{ font: 'var(--text-body)', color: 'var(--text-secondary)', ...style }}>
        <b style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fact}</b>{q ? ' \u00B7 ' + q : null}
      </div>
    );
  }
  return (
    <div style={{ padding: 'var(--pad-row)', borderTop: '1px solid var(--rule)', font: 'var(--text-quote)', color: muted ? 'var(--text-meta)' : 'var(--text-primary)', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span><b style={{ fontWeight: 700 }}>{fact}</b>{detail ? ' ' + detail : null}</span>
        {status || (meta ? <span style={{ font: 'var(--text-meta-font)', color: 'var(--text-meta)' }}>{meta}</span> : null)}
      </div>
      {q ? <div style={{ marginTop: 4, color: muted ? 'inherit' : 'var(--text-secondary)' }}>{q}</div> : null}
    </div>
  );
}
