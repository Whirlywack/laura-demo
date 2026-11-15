"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { day as shortDay } from "../../lib/format";
import type { HistoryDay, Range } from "../../lib/history";

// The timeline on the History page (and, for a sample month, on the home page): one column per date in the range,
// every row lined up. Drawn by hand, in ink, on fixed scales: nothing averaged, smoothed or coloured by value, and no
// line across a day without a Reading.
// - 1 month: everything per day. A line for her blood pressure, a dot for her pulse and for each answer, a mark for
//   each tablet.
// - 3 months: blood pressure and pulse per day; her answers and tablets counted week by week (from the range's start),
//   with a bar as long as that answer's share of the week's Calls.
// - 1 year: everything month by month, so every row shares the same columns. Blood pressure and pulse are a bar from
//   the lowest number she read out that month to the highest: both ends are real Readings.
// Pointing at a column reads it out above the drawing. A day's column links to its page, except in the year view,
// where a day is 2px wide: there the calendar opens a day. The calendar is the keyboard path, so the links are left out
// of the tab order.
const W = 900, L = 110;
const ink: CSSProperties = { fill: "var(--ink)" };
const meta: CSSProperties = { fill: "var(--ink-3)", font: "var(--text-meta-font)" };
const rule: CSSProperties = { stroke: "var(--rule)" };
const FELT = [["good", "Good"], ["okay", "Okay"], ["bad", "Bad"]] as const;
const SLEPT = [["well", "Well"], ["not well", "Not well"]] as const;
const lane = (i: number) => 14 + i * 30;
const monthName = (date: string, form: "short" | "long") => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { month: form, timeZone: "UTC" });

// How a tablet's Dose is marked, here and in the key. "Not taken" is a square, not a third colour of dot: filled
// burgundy and filled ink are too alike to tell apart by colour alone.
const KEY: [status: string, label: string, mark: CSSProperties][] = [
  ["taken on call", "Taken on call", { borderRadius: "50%", background: "var(--status-taken)" }],
  ["says taken earlier", "Says taken earlier", { borderRadius: "50%", border: "2px solid var(--status-taken)" }],
  ["not taken", "Not taken", { borderRadius: 2, background: "var(--ink)" }],
];

/** The key to the Tablets row: the three marks with their statuses. */
export function DoseKey({ style }: { style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 22px", font: "var(--text-meta-font)", ...style }}>
      {KEY.map(([status, text, mark]) => (
        <span key={status} style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
          <span style={{ width: "var(--marker)", height: "var(--marker)", boxSizing: "border-box", flex: "none", ...mark }} />
          {text}
        </span>
      ))}
    </div>
  );
}

type Props = {
  dates: string[];
  days: HistoryDay[];
  range: Range;
  /** The rows to draw, by title; all of them when left out. */
  only?: string[];
  /** Write the newest Reading at the end of its row. */
  latest?: boolean;
  /** Off: a day's column reads out on hover but goes nowhere (the home page's sample days). */
  links?: boolean;
  /** What the drawing shows, for a screen reader. */
  label?: string;
};

export function Timeline({ dates, days, range, only, latest = false, links = true, label = "Blood pressure, pulse, how she felt, how she slept and her tablets, day by day. Use the calendar to open a day." }: Props) {
  const [pointed, setPointed] = useState<number | null>(null);
  // Room on the right for the newest Reading's numbers.
  const R = latest ? 84 : 8;
  const byDate = new Map(days.map((d) => [d.date, d]));
  const step = (W - L - R) / dates.length;
  const x = (i: number) => L + i * step + step / 2;
  const width = Math.max(1.2, Math.min(5, step * 0.5));
  const dot = Math.max(1.6, width * 0.8);
  const perDay = range === "1m", byMonth = range === "1y";
  // Day numbers under a month: every one when there is room, otherwise every second or third, ending on the newest.
  const every = Math.ceil(24 / step);

  // Periods: 7-day blocks from the start for 3 months, calendar months for a year.
  const groupOf = (i: number) => (byMonth ? dates[i].slice(0, 7) : Math.floor(i / 7));
  const groups: { a: number; b: number }[] = [];
  dates.forEach((_, i) => {
    const last = groups.at(-1);
    if (last && groupOf(last.a) === groupOf(i)) last.b = i;
    else groups.push({ a: i, b: i });
  });
  const left = (g: { a: number }) => L + g.a * step;
  const wide = (g: { a: number; b: number }) => (g.b - g.a + 1) * step;
  const callsIn = (g: { a: number; b: number }) => dates.slice(g.a, g.b + 1).flatMap((date) => byDate.get(date) ?? []);
  const dividers = (height: number) => groups.map((g) => <line key={`divider${g.a}`} x1={left(g)} x2={left(g)} y1={0} y2={height} style={rule} />);

  // In each period, how many Calls match each lane's value, with a bar as long as its share of the period's Calls.
  function counts(values: readonly string[], matches: (d: HistoryDay, value: string) => boolean) {
    return groups.map((g) => {
      const called = callsIn(g);
      return (
        <g key={g.a}>
          <line x1={left(g)} x2={left(g)} y1={0} y2={lane(values.length - 1) + 14} style={rule} />
          {values.map((value, k) => {
            const n = called.filter((d) => matches(d, value)).length;
            return (
              <g key={value}>
                <rect x={left(g) + 3} y={lane(k) - 11} width={Math.max(0, (wide(g) - 6) * (called.length ? n / called.length : 0))} height={22} rx={4} style={{ fill: "var(--rule)" }} />
                <text x={left(g) + wide(g) / 2} y={lane(k) + 5} textAnchor="middle" style={{ ...meta, fill: n ? "var(--ink)" : "var(--ink-3)", fontWeight: n ? 700 : 400 }}>{n}</text>
              </g>
            );
          })}
        </g>
      );
    });
  }

  // Each row: its title, its scale or answers on the left, then what each day drew. `height` is the drawing area.
  const rows: { title: string; height: number; ticks: [string, number][]; lines: boolean; marks: ReactNode }[] = [];
  // Fixed scales; a value beyond one stops at its edge rather than drawing over the row above.
  const within = (v: number, low: number, high: number) => Math.min(high, Math.max(low, v));
  const bp = (v: number) => 8 + 124 * (1 - (within(v, 60, 190) - 60) / 130);
  const pulse = (v: number) => 8 + 58 * (1 - (within(v, 40, 120) - 40) / 80);
  // The lowest and highest of a period's numbers, as one bar; nothing when she gave none.
  const span = (g: { a: number; b: number }, numbers: number[], y: (v: number) => number, thick: number) =>
    numbers.length ? (
      <line key={g.a} x1={left(g) + wide(g) / 2} x2={left(g) + wide(g) / 2} y1={y(Math.max(...numbers))} y2={y(Math.min(...numbers))} strokeWidth={Math.min(thick, wide(g) - 8)} strokeLinecap="round" style={{ stroke: "var(--ink)" }} />
    ) : null;
  const readingsIn = (g: { a: number; b: number }) => callsIn(g).flatMap((d) => d.reading ?? []);

  rows.push({
    title: "Blood pressure", height: 140, lines: true, ticks: [180, 140, 100, 60].map((v) => [String(v), bp(v)]),
    marks: byMonth
      ? [dividers(140), groups.map((g) => span(g, readingsIn(g).flatMap((r) => [r.systolic, r.diastolic]), bp, 12))]
      : dates.map((date, i) => {
          const r = byDate.get(date)?.reading;
          return r ? <line key={date} x1={x(i)} x2={x(i)} y1={bp(r.systolic)} y2={bp(r.diastolic)} strokeWidth={width} strokeLinecap="round" style={{ stroke: "var(--ink)" }} /> : null;
        }),
  });
  // The one number written on the drawing: the newest Reading, beside its line.
  const newest = latest ? days.findLast((d) => d.reading)?.reading : undefined;
  if (newest) rows[0].marks = [rows[0].marks, <text key="newest" x={W - R + 12} y={bp((newest.systolic + newest.diastolic) / 2) + 6} style={{ ...ink, font: "var(--text-meta-font)", fontWeight: 700 }}>{newest.systolic}/{newest.diastolic}</text>];
  rows.push({
    title: "Pulse", height: 74, lines: true, ticks: [120, 80, 40].map((v) => [String(v), pulse(v)]),
    marks: byMonth
      ? [dividers(74), groups.map((g) => span(g, readingsIn(g).flatMap((r) => r.pulse ?? []), pulse, 8))]
      : dates.map((date, i) => {
          const p = byDate.get(date)?.reading?.pulse;
          return p == null ? null : <circle key={date} cx={x(i)} cy={pulse(p)} r={dot} style={ink} />;
        }),
  });
  for (const [title, answers, rating] of [
    ["How she felt", FELT, (d: HistoryDay) => d.felt.rating],
    ["How she slept", SLEPT, (d: HistoryDay) => d.slept.rating],
  ] as const) {
    rows.push({
      title, height: lane(answers.length - 1) + 16, lines: perDay, ticks: answers.map(([, text], k) => [text, lane(k)]),
      marks: perDay
        ? dates.map((date, i) => {
            const d = byDate.get(date), k = answers.findIndex(([value]) => d && value === rating(d));
            return k < 0 ? null : <circle key={date} cx={x(i)} cy={lane(k)} r={dot} style={ink} />;
          })
        : counts(answers.map(([value]) => value), (d, value) => rating(d) === value),
    });
  }
  // Her tablets, in Care plan order: a mark per Dose for a month; for longer, how many days each was taken on the call.
  const tablets = days.find((d) => d.doses.length)?.doses.map((d) => d.name) ?? [];
  if (tablets.length)
    rows.push({
      title: "Tablets", height: lane(tablets.length - 1) + 16, lines: perDay, ticks: tablets.map((name, k) => [name, lane(k)]),
      marks: perDay
        ? dates.flatMap((date, i) =>
            (byDate.get(date)?.doses ?? []).map((d) => {
              const cy = lane(tablets.indexOf(d.name)), key = date + d.name;
              if (d.status === "taken on call") return <circle key={key} cx={x(i)} cy={cy} r={dot} style={{ fill: "var(--status-taken)" }} />;
              if (d.status === "says taken earlier") return <circle key={key} cx={x(i)} cy={cy} r={dot - 1} style={{ fill: "var(--surface-card)", stroke: "var(--status-taken)", strokeWidth: 2 }} />;
              if (d.status === "not taken") return <rect key={key} x={x(i) - dot} y={cy - dot} width={dot * 2} height={dot * 2} rx={1} style={ink} />;
              return null;
            }),
          )
        : counts(tablets, (d, name) => d.doses.some((dose) => dose.name === name && dose.status === "taken on call")),
    });

  let top = 0;
  const drawn = rows.filter((row) => !only || only.includes(row.title)).map((row) => {
    const g0 = top + 28;
    top = g0 + row.height + 12;
    return (
      <g key={row.title}>
        <text x={0} y={g0 - 12} style={{ ...ink, font: "var(--text-quote)", fontWeight: 700 }}>{row.title}</text>
        <g transform={`translate(0,${g0})`}>
          {row.ticks.map(([text, y]) => (
            <g key={text}>
              {row.lines ? <line x1={L} x2={W - R} y1={y} y2={y} style={rule} /> : null}
              <text x={L - 10} y={y + 5} textAnchor="end" style={meta}>{text}</text>
            </g>
          ))}
          {row.marks}
        </g>
      </g>
    );
  });
  const plotted = top;

  // Under the rows: day numbers and the month for a month; the 1st and 15th for three months; for a year the months,
  // with the year under the first one and under each January.
  const axis = dates.map((date, i) => {
    const n = Number(date.slice(8)), month = monthName(date, "short");
    if (perDay)
      return (
        <g key={date}>
          {(dates.length - 1 - i) % every === 0 ? <text x={x(i)} y={top + 18} textAnchor="middle" style={meta}>{n}</text> : null}
          {n === 1 || i === 0 ? <text x={x(i)} y={top + 40} textAnchor="middle" style={{ ...meta, fill: "var(--ink)", fontWeight: 700 }}>{month}</text> : null}
        </g>
      );
    // Three months: the 1st and 15th, left out when the label would run past the right edge.
    if (!byMonth) return (n === 1 || n === 15) && i < dates.length - 6 ? <text key={date} x={L + i * step} y={top + 18} style={meta}>{`${n} ${month}`}</text> : null;
    const g = groups.find((g) => g.a === i);
    if (!g) return null;
    const year = i === 0 || date.slice(5, 7) === "01" ? date.slice(0, 4) : null;
    return (
      <g key={date}>
        <text x={left(g) + wide(g) / 2} y={top + 18} textAnchor="middle" style={meta}>{month}</text>
        {year ? <text x={i === 0 ? left(g) : left(g) + wide(g) / 2} y={top + 40} textAnchor={i === 0 ? "start" : "middle"} style={{ ...meta, fill: "var(--ink)", fontWeight: 700 }}>{year}</text> : null}
      </g>
    );
  });
  top += range === "3m" ? 28 : 48;

  // What pointing at a column reads out: the date (or the month), then what she said.
  const dayRead = (d: HistoryDay): [string, string[]] => [
    shortDay(d.at),
    [
      d.reading ? `${d.reading.systolic}/${d.reading.diastolic}${d.reading.pulse === null ? "" : `, pulse ${d.reading.pulse}`}` : null,
      d.felt.rating ? `felt ${d.felt.rating}` : null,
      d.slept.rating ? `slept ${d.slept.rating}` : null,
      d.doses.length ? `${d.doses.filter((dose) => dose.status === "taken on call").length} of ${d.doses.length} tablets on the call` : null,
    ].flatMap((part) => part ?? []),
  ];
  const monthRead = (g: { a: number; b: number }): [string, string[]] => {
    const numbers = readingsIn(g).flatMap((r) => [r.systolic, r.diastolic]), calls = callsIn(g).length;
    return [
      `${monthName(dates[g.a], "long")} ${dates[g.a].slice(0, 4)}`,
      [`${calls} ${calls === 1 ? "call" : "calls"}`, ...(numbers.length ? [`blood pressure from ${Math.min(...numbers)} to ${Math.max(...numbers)}`] : [])],
    ];
  };
  const columns = byMonth
    ? groups.map((g) => ({ key: dates[g.a], x0: left(g), w: wide(g), read: monthRead(g), href: null as string | null }))
    : dates.flatMap((date, i) => {
        const d = byDate.get(date);
        return d ? [{ key: date, x0: L + i * step, w: step, read: dayRead(d), href: links ? `/demo/history/${date}?range=${range}` : null }] : [];
      });
  const reading = columns.find((c, i) => i === pointed)?.read;
  const hint = byMonth ? "Point at a month to read it. The calendar opens a day." : links ? "Point at a day to read it. Press it to open it." : "Point at a day to read it.";

  return (
    <div>
      {/* The readout keeps its height, so the drawing never moves under the pointer. */}
      <div aria-hidden="true" style={{ minHeight: 44, font: "var(--text-meta-font)", color: "var(--text-meta)" }}>
        {reading ? (
          <span style={{ color: "var(--text-secondary)" }}>
            <b style={{ color: "var(--text-primary)" }}>{reading[0]}</b>
            {reading[1].map((part) => ` · ${part}`).join("")}
          </span>
        ) : (
          hint
        )}
      </div>
      {/* On a narrow screen it scrolls sideways, so its type keeps its size; right-to-left makes it open at the newest days. */}
      <div style={{ overflowX: "auto", direction: "rtl" }}>
        <svg viewBox={`0 0 ${W} ${top}`} width="100%" role="img" aria-label={label} onMouseLeave={() => setPointed(null)} style={{ display: "block", minWidth: 700, direction: "ltr" }}>
          {columns.map((c, i) => {
            const column = (
              <>
                <title>{[c.read[0], ...c.read[1]].join(" · ")}</title>
                <rect x={c.x0} y={0} width={c.w} height={plotted} />
              </>
            );
            return c.href ? (
              <Link key={c.key} href={c.href} prefetch={false} tabIndex={-1} className="laura-column" onMouseEnter={() => setPointed(i)}>{column}</Link>
            ) : (
              <g key={c.key} className="laura-column" onMouseEnter={() => setPointed(i)}>{column}</g>
            );
          })}
          <g style={{ pointerEvents: "none" }}>
            {drawn}
            {axis}
          </g>
        </svg>
      </div>
    </div>
  );
}
