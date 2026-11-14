"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import type { Range } from "../../lib/history";

// The calendar on the History page and on every day's page, for finding a date: one month at a time, Monday to Sunday.
// A day with a Call is a shaded link to its page; the arrows and the month name (a dropdown) move between the months.
// It is the keyboard and screen-reader path to every day (the timeline's columns are for pointing). On a day's page it
// opens on that day's month, with the day (`selected`) marked.
const nextMonth = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
};
const monthName = (month: string) => new Date(`${month}-01T12:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

const cell: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "var(--hit-min)", borderRadius: "var(--radius-check)", font: "var(--text-meta-font)" };
const arrow = (disabled: boolean): CSSProperties => ({
  width: "var(--hit-min)", height: "var(--hit-min)", flex: "none", borderRadius: "var(--radius-pill)", border: "2px solid var(--ink)", background: "none",
  color: "var(--ink)", font: "var(--text-label)", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.25 : 1,
});
const dayName = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

export function HistoryCalendar({ first, last, called, range, selected }: { first: string; last: string; called: string[]; range: Range; selected?: string }) {
  const months: string[] = [];
  for (let m = first.slice(0, 7); m <= last.slice(0, 7); m = nextMonth(m)) months.push(m);
  const [shown, setShown] = useState(() => {
    const at = selected ? months.indexOf(selected.slice(0, 7)) : -1;
    return at < 0 ? months.length - 1 : at;
  });
  const month = months[shown];
  const has = new Set(called);
  const [y, m] = month.split("-").map(Number);
  const blanks = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const length = new Date(Date.UTC(y, m, 0)).getUTCDate();

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 14 }}>
        <button type="button" className="laura-button" aria-label="Month before" disabled={shown === 0} onClick={() => setShown(shown - 1)} style={arrow(shown === 0)}>‹</button>
        <span style={{ position: "relative", display: "inline-flex", alignItems: "center", minWidth: 0 }}>
        <select
          aria-label="Month"
          className="laura-input"
          value={shown}
          onChange={(e) => setShown(Number(e.target.value))}
          style={{
            appearance: "none", border: 0, borderRadius: "var(--radius-check)", padding: "8px 28px 8px 10px", minHeight: "var(--hit-min)", minWidth: 0, color: "var(--ink)", cursor: "pointer",
            font: "var(--text-label)", letterSpacing: "var(--tracking-lead)", textAlign: "center", background: "none",
          }}
        >
          {months.map((mm, i) => (
            <option key={mm} value={i}>{monthName(mm)}</option>
          ))}
        </select>
          {/* A small drawn chevron, so the month name reads as a dropdown. */}
          <svg aria-hidden width="12" height="8" viewBox="0 0 12 8" style={{ position: "absolute", right: 10, pointerEvents: "none" }}>
            <path d="M1.5 1.5 6 6l4.5-4.5" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <button type="button" className="laura-button" aria-label="Month after" disabled={shown === months.length - 1} onClick={() => setShown(shown + 1)} style={arrow(shown === months.length - 1)}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(var(--hit-min), 1fr))", gap: 2, textAlign: "center" }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} aria-hidden style={{ font: "var(--text-meta-font)", color: "var(--text-meta)", paddingBottom: 4 }}>{d}</span>
        ))}
        {Array.from({ length: blanks }, (_, i) => <span key={`blank${i}`} />)}
        {Array.from({ length }, (_, i) => {
          const date = `${month}-${String(i + 1).padStart(2, "0")}`;
          return has.has(date) ? (
            <Link
              key={date}
              href={`/demo/history/${date}?range=${range}`}
              aria-label={dayName(date)}
              aria-current={date === selected ? "page" : undefined}
              className="laura-button"
              style={{ ...cell, fontWeight: 700, textDecoration: "none", ...(date === selected ? { background: "var(--accent)", color: "var(--text-on-accent)" } : { background: "var(--surface-quiet)", color: "var(--ink)" }) }}
            >
              {i + 1}
            </Link>
          ) : (
            <span key={date} style={{ ...cell, color: "var(--text-meta)" }}>{i + 1}</span>
          );
        })}
      </div>
    </div>
  );
}
