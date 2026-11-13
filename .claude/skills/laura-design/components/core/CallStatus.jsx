import React from 'react';

const base = {
  display: 'inline-flex', alignItems: 'center', gap: 12, minHeight: 'var(--hit-min)', padding: '12px 22px',
  borderRadius: 'var(--radius-pill)', font: 'var(--text-label)', whiteSpace: 'nowrap', border: 0, boxSizing: 'border-box',
};

export function CallStatus({ state = 'idle', elapsed, calledAt, onCall, style }) {
  if (state === 'live') {
    return (
      <span role="status" style={{ ...base, background: 'var(--surface-live)', color: 'var(--text-on-live)', ...style }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'currentColor' }} />
        <span>Call in progress</span>
        {elapsed ? <span style={{ fontVariantNumeric: 'tabular-nums' }}>{elapsed}</span> : null}
      </span>
    );
  }
  if (state === 'done') {
    return (
      <span role="status" style={{ ...base, background: 'transparent', color: 'var(--text-primary)', boxShadow: 'inset 0 0 0 2px var(--ink)', ...style }}>
        <span>Called{calledAt ? ' at ' + calledAt : ' today'}</span>
      </span>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 16, ...style }}>
      <span style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>Not called yet</span>
      <button type="button" onClick={onCall} style={{ ...base, background: 'var(--ink)', color: 'var(--paper)', cursor: 'pointer' }}>Call now</button>
    </span>
  );
}
