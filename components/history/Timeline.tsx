import type { CSSProperties, ReactNode } from "react";
import { day as shortDay } from "../../lib/format";
import type { HistoryDay, Range } from "../../lib/history";

// The History page's timeline: one column per date in the range, every row lined up by day. Drawn by hand, in ink, on
// fixed scales: nothing averaged, smoothed or coloured, and no line across a day without a Reading. For 1 month her
// answers are a dot per day; for 3 months (weeks from the start of the range) and 1 year (calendar months) they are
// counted, with a bar as long as that answer's share of that period's Calls. A column with a Call links to its day
// (CSS shades it on hover; its title is the date); the calendar beside it is the keyboard path, so these links are
// left out of the tab order.
const L = 110, R = 8;
const ink: CSSProperties = { fill: "var(--ink)" };
const meta: CSSProperties = { fill: "var(--ink-3)", font: "var(--text-meta-font)" };
const rule: CSSProperties = { stroke: "var(--rule)" };
const FELT = [["good", "Good"], ["okay", "Okay"], ["bad", "Bad"]] as const;
const SLEPT = [["well", "Well"], ["not well", "Not well"]] as const;
const lane = (i: number) => 14 + i * 30;

// `width` is the drawing's width in px at full size (the home page's blocks are narrower than the History page's card).
// `label` says what the drawing shows, for a screen reader.
export function Timeline({ dates, days, range, only, width: W = 900, label = "Blood pressure, pulse, how she felt and how she slept, day by day. Use the calendar to open a day." }: { dates: string[]; days: HistoryDay[]; range: Range; only?: string[]; width?: number; label?: string }) {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const step = (W - L - R) / dates.length;
  const x = (i: number) => L + i * step + step / 2;
  const width = Math.max(1.2, Math.min(5, step * 0.5));
  const dot = Math.max(1.6, width * 0.75);
  const perDay = range === "1m";
  // Day numbers under a month: every one when there is room, otherwise every second or third, ending on the newest.
  const every = Math.ceil(24 / step);

  // Periods for the counts: 7-day blocks from the start for 3 months, calendar months for a year.
  const groupOf = (i: number) => (range === "1y" ? dates[i].slice(0, 7) : Math.floor(i / 7));
  const groups: { a: number; b: number }[] = [];
  dates.forEach((_, i) => {
    const last = groups.at(-1);
    if (last && groupOf(last.a) === groupOf(i)) last.b = i;
    else groups.push({ a: i, b: i });
  });

  function counts(answers: readonly (readonly [string, string])[], rating: (d: HistoryDay) => string | null) {
    return groups.map(({ a, b }) => {
      const called = dates.slice(a, b + 1).flatMap((date) => byDate.get(date) ?? []);
      const x0 = L + a * step, w = (b - a + 1) * step;
      return (
        <g key={a}>
          <line x1={x0} x2={x0} y1={0} y2={lane(answers.length - 1) + 14} style={rule} />
          {answers.map(([value], k) => {
            const n = called.filter((d) => rating(d) === value).length;
            return (
              <g key={value}>
                <rect x={x0 + 3} y={lane(k) - 11} width={Math.max(0, (w - 6) * (called.length ? n / called.length : 0))} height={22} rx={4} style={{ fill: "var(--rule)" }} />
                <text x={x0 + w / 2} y={lane(k) + 5} textAnchor="middle" style={{ ...meta, fill: n ? "var(--ink)" : "var(--ink-3)", fontWeight: n ? 700 : 400 }}>{n}</text>
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
  rows.push({
    title: "Blood pressure", height: 140, lines: true, ticks: [180, 140, 100, 60].map((v) => [String(v), bp(v)]),
    marks: dates.map((date, i) => {
      const r = byDate.get(date)?.reading;
      return r ? <line key={date} x1={x(i)} x2={x(i)} y1={bp(r.systolic)} y2={bp(r.diastolic)} strokeWidth={width} strokeLinecap="round" style={{ stroke: "var(--ink)" }} /> : null;
    }),
  });
  rows.push({
    title: "Pulse", height: 74, lines: true, ticks: [120, 80, 40].map((v) => [String(v), pulse(v)]),
    marks: dates.map((date, i) => {
      const p = byDate.get(date)?.reading?.pulse;
      return p == null ? null : <circle key={date} cx={x(i)} cy={pulse(p)} r={dot} style={ink} />;
    }),
  });
  for (const [title, answers, rating] of [
    ["How she felt", FELT, (d: HistoryDay) => d.felt.rating],
    ["How she slept", SLEPT, (d: HistoryDay) => d.slept.rating],
  ] as const) {
    rows.push({
      title, height: lane(answers.length - 1) + 16, lines: perDay, ticks: answers.map(([, label], k) => [label, lane(k)]),
      marks: perDay
        ? dates.map((date, i) => {
            const d = byDate.get(date), k = answers.findIndex(([value]) => d && value === rating(d));
            return k < 0 ? null : <circle key={date} cx={x(i)} cy={lane(k)} r={dot} style={ink} />;
          })
        : counts(answers, rating),
    });
  }

  let top = 0;
  // `only` names the rows to draw (the home page shows them one block at a time).
  const drawn = rows.filter((row) => !only || only.includes(row.title)).map((row) => {
    const g0 = top + 28;
    top = g0 + row.height + 12;
    return (
      <g key={row.title}>
        <text x={0} y={g0 - 12} style={{ ...ink, font: "var(--text-quote)", fontWeight: 700 }}>{row.title}</text>
        <g transform={`translate(0,${g0})`}>
          {row.ticks.map(([label, y]) => (
            <g key={label}>
              {row.lines ? <line x1={L} x2={W - R} y1={y} y2={y} style={rule} /> : null}
              <text x={L - 10} y={y + 5} textAnchor="end" style={meta}>{label}</text>
            </g>
          ))}
          {row.marks}
        </g>
      </g>
    );
  });
  const plotted = top;

  // Under the rows: day numbers (and the month at its 1st) for a month, the 1st and 15th for three months.
  const axis = dates.map((date, i) => {
    const n = Number(date.slice(8)), month = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
    if (range === "1m")
      return (
        <g key={date}>
          {(dates.length - 1 - i) % every === 0 ? <text x={x(i)} y={top + 18} textAnchor="middle" style={meta}>{n}</text> : null}
          {n === 1 || i === 0 ? <text x={x(i)} y={top + 40} textAnchor="middle" style={{ ...meta, fill: "var(--ink)", fontWeight: 700 }}>{month}</text> : null}
        </g>
      );
    // Three months: the 1st and 15th, left out when the label would run past the right edge.
    if (range === "3m") return (n === 1 || n === 15) && i < dates.length - 6 ? <text key={date} x={L + i * step} y={top + 18} style={meta}>{`${n} ${month}`}</text> : null;
    // A year: each month's name in the middle of its block, the part-months at either end included.
    const g = groups.find((g) => g.a === i);
    return g ? <text key={date} x={(x(g.a) + x(g.b)) / 2} y={top + 18} textAnchor="middle" style={meta}>{month}</text> : null;
  });
  top += range === "1m" ? 48 : 28;

  return (
    // On a narrow screen the full-size drawing scrolls sideways, so its type keeps its size (a narrower one may shrink
    // by up to three tenths first, so a phone shows all of it); right-to-left makes it open at the newest days.
    <div style={{ overflowX: "auto", direction: "rtl" }}>
      <svg viewBox={`0 0 ${W} ${top}`} width="100%" role="img" aria-label={label} style={{ display: "block", minWidth: W < 760 ? W * 0.7 : 760, direction: "ltr" }}>
        {dates.map((date, i) => {
          const d = byDate.get(date);
          return d ? (
            <a key={date} href={`/demo/history/${date}?range=${range}`} tabIndex={-1} className="laura-column">
              <title>{shortDay(d.at)}</title>
              <rect x={L + i * step} y={0} width={step} height={plotted} />
            </a>
          ) : null;
        })}
        <g style={{ pointerEvents: "none" }}>
          {drawn}
          {axis}
        </g>
      </svg>
    </div>
  );
}
