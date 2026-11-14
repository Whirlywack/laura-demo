"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

// Ported from the Story in .claude/skills/laura-design/ui_kits/home/Home.jsx.
// The story as a short film: press play and the call unfolds. A caption sets the scene, the two speech
// bubbles appear in turn, and each thing Lidia says lands on Paul's page on the right, which fills up.
export type Beat = { time: string; say: string; laura: string; lidia: string; card: { label: string; body: ReactNode; action?: boolean } };
type Styles = { label: CSSProperties; lead: CSSProperties; reading: CSSProperties };

const BEAT = 7;
const END = 6;
const arrive: CSSProperties = { animation: "laura-arrive 500ms cubic-bezier(.2,.7,.2,1) both" };
const round: CSSProperties = {
  width: 52, height: 52, borderRadius: "50%", border: 0, background: "var(--surface-card)", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flex: "none", padding: 0,
};
const clock = (s: number) => "0:" + String(Math.floor(s)).padStart(2, "0");
const triangle = (size: number) => (
  <span
    aria-hidden="true"
    style={{ width: 0, height: 0, borderStyle: "solid", borderWidth: `${size}px 0 ${size}px ${size * 1.6}px`, borderColor: "transparent transparent transparent var(--accent)", marginLeft: size * 0.4 }}
  />
);
const bars = (
  <span aria-hidden="true" style={{ display: "flex", gap: 6 }}>
    <span style={{ width: 6, height: 20, background: "var(--accent)" }} />
    <span style={{ width: 6, height: 20, background: "var(--accent)" }} />
  </span>
);

export function Story({ beats, ending, styles }: { beats: Beat[]; ending: { time: string; say: string }; styles: Styles }) {
  const { label, lead, reading } = styles;
  const T = beats.length * BEAT + END;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setT((v) => Math.min(v + 0.1, T)), 100);
    return () => clearInterval(id);
  }, [playing, T]);
  useEffect(() => {
    if (t >= T) setPlaying(false);
  }, [t, T]);

  const play = () => {
    if (t >= T) setT(0);
    setStarted(true);
    setPlaying(true);
  };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setT(Math.max(0, Math.min(T, ((e.clientX - r.left) / r.width) * T)));
    setStarted(true);
  };
  const n = Math.min(Math.floor(t / BEAT), beats.length);
  const local = t - n * BEAT;
  const b = beats[n];
  const done = t >= T;

  return (
    <div style={{ marginTop: 36, position: "relative", background: "var(--surface-live)", color: "var(--text-on-live)", borderRadius: "var(--radius-card)", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: "clamp(620px, 48vw, 800px)" }}>
      <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: "28px 48px", padding: "40px 44px 28px" }}>
        <div style={{ flex: "1.5 1 420px", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div key={"cap" + n} style={arrive}>
            <div style={label}>{b ? b.time : ending.time}</div>
            <div style={{ ...reading, marginTop: 8, maxWidth: 720, textWrap: "balance" }}>{b ? b.say : ending.say}</div>
          </div>
          <div style={{ flex: 1, minHeight: 28 }} />
          <div key={"talk" + n} style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 200, justifyContent: "flex-end" }}>
            {b && local >= 0.9 ? (
              <div style={{ alignSelf: "flex-start", maxWidth: "84%", background: "var(--surface-quiet)", color: "var(--ink)", borderRadius: "24px 24px 24px 6px", padding: "14px 24px 16px", ...arrive }}>
                <div style={label}>Laura</div>
                <div style={{ fontSize: 22, lineHeight: 1.35, marginTop: 2 }}>{b.laura}</div>
              </div>
            ) : null}
            {b && local >= 2.6 ? (
              <div style={{ alignSelf: "flex-end", maxWidth: "84%", background: "var(--surface-card)", color: "var(--ink)", borderRadius: "24px 24px 6px 24px", padding: "14px 24px 18px", ...arrive }}>
                <div style={label}>Lidia</div>
                <div style={{ ...lead, marginTop: 4 }}>{"“" + b.lidia + "”"}</div>
              </div>
            ) : null}
            {!b && done ? (
              <a href="/demo" style={{ alignSelf: "flex-start", padding: "13px 26px", borderRadius: "var(--radius-pill)", background: "var(--accent)", color: "var(--text-on-accent)", font: "var(--text-label)", textDecoration: "none", ...arrive }}>
                See his page
              </a>
            ) : null}
          </div>
        </div>
        <div style={{ flex: "1 1 300px", minWidth: 0, maxWidth: 440, background: "var(--surface-page)", color: "var(--ink)", borderRadius: 24, padding: "22px 22px 24px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "0 6px 6px" }}>
            <span style={label}>Paul&apos;s page</span>
            <span style={{ font: "var(--text-meta-font)", color: "var(--text-meta)" }}>{t < T - END ? "Call in progress" : "Called at 09:30"}</span>
          </div>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 10 }}>
            {beats.map((x, i) => {
              const shown = t >= i * BEAT + 4.2;
              // Always rendered so the frame keeps its final height; hidden until its moment.
              return (
                <div
                  key={x.time + (shown ? "-on" : "-off")}
                  aria-hidden={!shown}
                  style={{ background: x.card.action ? "var(--surface-action)" : "var(--surface-card)", borderRadius: 16, padding: "14px 18px 16px", ...(shown ? arrive : { visibility: "hidden" }) }}
                >
                  <div style={{ ...label, color: x.card.action ? "inherit" : "var(--text-question)" }}>{x.card.label}</div>
                  <div style={{ marginTop: 4 }}>{x.card.body}</div>
                </div>
              );
            })}
            {t < 4.2 ? <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "6px", color: "var(--text-meta)" }}>Nothing yet. It fills in as she speaks.</div> : null}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "0 44px 30px" }}>
        <button type="button" aria-label={playing ? "Pause" : "Play"} style={round} onClick={() => (playing ? setPlaying(false) : play())}>
          {playing ? bars : triangle(9)}
        </button>
        <div
          role="slider"
          tabIndex={0}
          aria-label="Position in the story"
          aria-valuemin={0}
          aria-valuemax={T}
          aria-valuenow={Math.round(t)}
          onClick={seek}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              setStarted(true);
              setT((v) => Math.max(0, Math.min(T, v + (e.key === "ArrowRight" ? 2 : -2))));
            }
          }}
          style={{ flex: 1, height: 44, display: "flex", alignItems: "center", cursor: "pointer", position: "relative" }}
        >
          <div style={{ width: "100%", height: 6, borderRadius: 3, background: "var(--rule-on-highlight)", position: "relative" }}>
            <div style={{ width: (t / T) * 100 + "%", height: "100%", borderRadius: 3, background: "var(--ink)" }} />
            {beats.map((_, i) => (i ? <span key={i} style={{ position: "absolute", left: ((i * BEAT) / T) * 100 + "%", top: -3, width: 2, height: 12, background: "var(--surface-live)" }} /> : null))}
            <span style={{ position: "absolute", left: ((beats.length * BEAT) / T) * 100 + "%", top: -3, width: 2, height: 12, background: "var(--surface-live)" }} />
          </div>
        </div>
        <span style={{ font: "var(--text-meta-font)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
          {clock(t)} / {clock(T)}
        </span>
      </div>

      {!started ? (
        <button
          type="button"
          onClick={play}
          aria-label="Play the story"
          style={{ position: "absolute", inset: 0, border: 0, background: "var(--surface-live)", color: "var(--text-on-live)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, padding: 24 }}
        >
          <span style={{ ...round, width: 112, height: 112 }}>{triangle(18)}</span>
          <span style={{ ...reading, textWrap: "balance", maxWidth: 640 }}>Watch the call. It takes {T} seconds.</span>
          <span style={{ font: "var(--text-body)" }}>What Laura says, what Lidia answers, and what Paul sees.</span>
        </button>
      ) : null}
    </div>
  );
}
