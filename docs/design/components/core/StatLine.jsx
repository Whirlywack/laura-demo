import React from 'react';

export function StatLine({ label, value, suffix, style }) {
  return (
    <span style={{ font: 'var(--text-quote)', color: 'var(--text-secondary)', ...style }}>
      {label}{label ? ' ' : ''}<b style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{value}</b>{suffix ? ' ' + suffix : ''}
    </span>
  );
}
