import React from 'react';

export function DatedList({ items = [], style }) {
  return (
    <div style={{ font: 'var(--text-quote)', ...style }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '11px 0', borderTop: '1px solid var(--rule)', flexDirection: it.quote ? 'column' : 'row' }}>
          <span style={{ color: 'var(--text-meta)', font: it.quote ? 'var(--text-meta-font)' : 'inherit' }}>{it.date}</span>
          {it.quote
            ? <span style={{ color: 'var(--text-secondary)', marginTop: -12 }}>{'\u201C' + it.quote + '\u201D'}</span>
            : <span style={{ fontVariantNumeric: 'tabular-nums' }}>{it.value}</span>}
        </div>
      ))}
    </div>
  );
}
