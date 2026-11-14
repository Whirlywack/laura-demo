import React from 'react';

export function Checklist({ items = [], onToggle, onHighlight = true, style }) {
  const rule = onHighlight ? 'var(--rule-on-highlight)' : 'var(--rule)';
  return (
    <div style={style}>
      {items.map((it, i) => (
        <label key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '14px 0', borderTop: '1px solid ' + rule, cursor: 'pointer', minHeight: 'var(--hit-min)', boxSizing: 'border-box', color: it.done ? 'var(--text-meta)' : 'inherit' }}>
          <input type="checkbox" checked={!!it.done} onChange={() => onToggle && onToggle(i)} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
          <span aria-hidden="true" style={{ width: 'var(--checkbox)', height: 'var(--checkbox)', border: '2px solid var(--ink)', borderRadius: 'var(--radius-check)', background: it.done ? 'var(--ink)' : 'var(--surface-card)', color: 'var(--surface-card)', flex: 'none', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '700 16px/1 var(--font-sans)' }}>{it.done ? '\u2713' : ''}</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'flex', justifyContent: 'space-between', gap: 10, font: 'var(--text-body)' }}>
              <b style={{ fontWeight: 700, textDecoration: it.done ? 'line-through' : 'none' }}>{it.label}</b>
              {it.meta ? <span style={{ font: 'var(--text-meta-font)', fontWeight: it.isNew ? 700 : 400 }}>{it.meta}</span> : null}
            </span>
            {it.quote ? <span style={{ display: 'block', font: 'var(--text-quote)', marginTop: 2 }}>{'\u201C' + it.quote + '\u201D'}</span> : null}
          </span>
        </label>
      ))}
    </div>
  );
}
