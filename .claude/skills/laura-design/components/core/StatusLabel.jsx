import React from 'react';

const STATES = {
  taken: { label: 'Taken on call', mark: { background: 'var(--status-taken)' }, color: 'var(--text-primary)' },
  earlier: { label: 'Says taken earlier', mark: { border: '2px solid var(--status-taken)' }, color: 'var(--text-primary)' },
  'not-confirmed': { label: 'Not confirmed', mark: { border: '2px dashed var(--ink-3)' }, color: 'var(--text-meta)' },
  'not-taken': { label: 'Not taken', mark: { border: '2px solid var(--ink)', background: 'var(--ink)' }, color: 'var(--text-primary)' },
};

export function StatusLabel({ status = 'not-confirmed', label, style }) {
  const s = STATES[status] || STATES['not-confirmed'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, font: 'var(--text-meta-font)', color: s.color, whiteSpace: 'nowrap', ...style }}>
      <span style={{ width: 'var(--marker)', height: 'var(--marker)', borderRadius: '50%', boxSizing: 'border-box', flex: 'none', ...s.mark }} />
      <span style={status === 'not-taken' ? { fontWeight: 700 } : undefined}>{label || s.label}</span>
    </span>
  );
}
