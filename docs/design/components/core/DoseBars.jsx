import React from 'react';

const FILL = {
  taken: { background: 'var(--status-taken)' },
  earlier: { border: '2px solid var(--status-taken)' },
  'not-confirmed': { border: '2px dashed var(--status-pending)' },
  'not-taken': { background: 'var(--ink)' },
};

export function DoseBars({ doses = [], style }) {
  return (
    <div role="img" aria-label={doses.join(', ')} style={{ display: 'flex', gap: 8, ...style }}>
      {doses.map((d, i) => (
        <span key={i} style={{ flex: 1, height: 14, borderRadius: 7, boxSizing: 'border-box', transition: 'background var(--motion-state)', ...(FILL[d] || FILL['not-confirmed']) }} />
      ))}
    </div>
  );
}
