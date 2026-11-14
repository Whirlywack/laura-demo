"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Dose } from "../../lib/dashboard";
import { DoseBars } from "../DoseBars";
import { StatusLabel } from "../StatusLabel";
import type { FilmData, FilmRecord } from "./films";

// The film on the home page: Paul's page on the left fills in as Laura and Lidia talk on the right. It follows its
// sound file's clock (its own once the sound has ended). Paul's page here is a small copy of the dashboard at /demo,
// drawn from the film's records: no database. Every card has a fixed height, so the film never changes size as it plays.

const label: CSSProperties = { font: "var(--text-meta-font)", fontWeight: 700 };
const lead: CSSProperties = { font: "700 var(--size-lead)/var(--leading-lead) var(--font-sans)", letterSpacing: "var(--tracking-lead)" };
const reading: CSSProperties = { font: "700 var(--size-reading)/1.03 var(--font-sans)", letterSpacing: "var(--tracking-reading)" };
const meta: CSSProperties = { font: "var(--text-meta-font)", color: "var(--text-meta)" };
const quote: CSSProperties = { font: "var(--text-meta-font)", color: "var(--text-secondary)" };
const arrive: CSSProperties = { animation: "laura-arrive var(--motion-arrive) both" };
const card = (tone: "card" | "quiet" | "action" = "card"): CSSProperties => ({
  flex: "1 1 190px", minWidth: 0, boxSizing: "border-box", borderRadius: "var(--radius-inner)", padding: "16px 18px 18px", overflow: "hidden",
  background: tone === "card" ? "var(--surface-card)" : tone === "quiet" ? "var(--surface-quiet)" : "var(--surface-action)",
});
const question: CSSProperties = { ...label, color: "var(--text-question)" };
const round: CSSProperties = {
  width: 52, height: 52, borderRadius: "50%", border: 0, background: "var(--surface-card)", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", flex: "none", padding: 0,
};
const pill: CSSProperties = { padding: "13px 26px", borderRadius: "var(--radius-pill)", background: "var(--accent)", color: "var(--text-on-accent)", font: "var(--text-label)", textDecoration: "none", whiteSpace: "nowrap" };
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
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

const MEDICATIONS = ["Concor", "Sanoral HCT", "Eliquis"];
const feedTitle = (e: FilmRecord) =>
  e.kind === "general" ? "How she felt" : e.kind === "sleep" ? "Sleep" : e.kind === "leg" ? "Left leg" : e.kind === "reading" ? `Blood pressure · ${e.value}`
  : e.kind === "dose" ? `${e.name} · Taken on call` : e.kind === "errand" ? `Errand added · ${e.item}` : "For Paul";

// Paul's page as it stands once these records have landed.
function PaulsPage({ records, status, calledAt }: { records: FilmRecord[]; status: "not called yet" | "live" | "done"; calledAt: string }) {
  const last = (kind: FilmRecord["kind"]) => records.findLast((e) => e.kind === kind);
  const general = last("general"), sleep = last("sleep"), leg = last("leg"), bp = last("reading"), summary = last("summary"), passOn = last("passOn");
  const errands = records.filter((e) => e.kind === "errand");
  const doses: Dose[] = MEDICATIONS.map((name) => {
    const taken = records.find((e) => e.kind === "dose" && e.name === name);
    return { name, strength: "", timeOfDay: "morning", status: taken ? "taken on call" : "not confirmed", quote: taken?.quote ?? null };
  });
  const feed = records.filter((e) => e.kind !== "summary").reverse().slice(0, 2);
  const waiting = status === "not called yet" ? "Laura hasn't called yet today." : "Laura is asking…";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "0 6px 4px" }}>
        <span style={label}>Paul&apos;s page · Lidia, 94</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...meta }}>
          {status === "live" ? <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)" }} /> : null}
          {status === "live" ? "Call in progress" : status === "done" ? `Called at ${calledAt}` : "Not called yet"}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <div style={{ ...card(), flex: "1.7 1 260px", height: "var(--film-card)" }}>
          <div style={question}>Is she okay today?</div>
          {general ? <div key={general.quote} style={{ ...lead, marginTop: 10, textWrap: "balance", ...arrive }}>“{general.quote}”</div> : <div style={{ ...lead, marginTop: 10, color: "var(--text-meta)" }}>{waiting}</div>}
          {sleep ? <div key={sleep.quote} style={{ ...quote, marginTop: 10, ...arrive }}><b style={{ color: "var(--text-primary)" }}>Sleep</b> · “{sleep.quote}”</div> : <div style={{ ...meta, marginTop: 10 }}>Sleep · not asked yet</div>}
          {passOn ? <div key={passOn.quote} style={{ ...quote, marginTop: 6, ...arrive }}><b style={{ color: "var(--text-primary)" }}>For Paul</b> · “{passOn.quote}”</div> : null}
        </div>
        <div style={{ ...card(), height: "var(--film-card)", display: "flex", flexDirection: "column" }}>
          <div style={question}>Did she take her tablets?</div>
          <div style={{ ...reading, marginTop: 8 }}>{doses.filter((d) => d.status === "taken on call").length} of 3</div>
          <DoseBars doses={doses} style={{ marginTop: 12 }} />
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
            {doses.map((d) => (
              <span key={d.name} style={{ display: "flex", justifyContent: "space-between", gap: 8, ...meta }}>
                <b style={{ color: "var(--text-primary)" }}>{d.name}</b>
                <StatusLabel status={d.status} />
              </span>
            ))}
          </div>
        </div>
        <div style={{ ...card("action"), height: "var(--film-card)" }}>
          <div style={label}>What do I need to bring?</div>
          <div style={{ ...lead, marginTop: 10 }}>{errands.length ? `Bring ${errands.length} thing${errands.length > 1 ? "s" : ""}` : "Nothing yet"}</div>
          {errands.map((e) => (
            <div key={e.at} style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--rule-on-highlight)", ...arrive }}>
              <b style={label}>{e.item}</b>
              <div style={{ font: "var(--text-meta-font)" }}>“{e.quote}”</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {/* As she read it out, in plain ink: never coloured, ranked or commented on. */}
        <div style={{ ...card("quiet"), height: "var(--film-card-small)" }}>
          <div style={label}>Blood pressure</div>
          {bp ? <div key={bp.value} style={arrive}><div style={{ ...reading, marginTop: 8, fontVariantNumeric: "tabular-nums" }}>{bp.value}</div><div style={{ ...quote, marginTop: 6 }}>“{bp.quote}”</div></div> : <div style={{ ...meta, marginTop: 8 }}>Not read yet today.</div>}
        </div>
        <div style={{ ...card(), height: "var(--film-card-small)" }}>
          <div style={label}>Left leg</div>
          {leg ? <div key={leg.quote} style={{ font: "var(--text-quote)", fontWeight: 700, marginTop: 8, ...arrive }}>“{leg.quote}”</div> : <div style={{ ...meta, marginTop: 8 }}>Not asked yet today.</div>}
        </div>
        <div style={{ ...card("quiet"), flex: "1.5 1 240px", height: "var(--film-card)", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, ...meta }}>
            <b>{summary ? "Laura's summary" : "Live from the call"}</b>
            {summary ? null : <span>Newest first</span>}
          </div>
          {/* Laura's own words, so no quotation marks. It takes the feed's place once the Call is done. */}
          {summary ? <div style={{ font: "var(--text-meta-font)", marginTop: 8, ...arrive }}>{summary.text}</div> : null}
          {feed.length || summary ? null : <div style={{ ...meta, marginTop: 8 }}>Nothing yet. It fills in as she speaks.</div>}
          {(summary ? [] : feed).map((e) => (
            <div key={e.at} style={{ padding: "8px 0", borderTop: "1px solid var(--rule)", marginTop: 8, ...arrive }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, ...meta }}>
                <span>{feedTitle(e)}</span>
                <span>{e.clock}</span>
              </div>
              <div style={{ font: "var(--text-meta-font)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>“{e.quote}”</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Film({ data }: { data: FilmData }) {
  const { lines, records, captions, ending, length: T } = data;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const sound = useRef<HTMLAudioElement>(null);

  // The film's clock: the sound file's while it has sound left, its own otherwise.
  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      const a = sound.current;
      // readyState 2+: the sound has data to play. If it never loads, the film still runs, silent.
      setT((v) => Math.min(a && a.readyState >= 2 && !a.paused && !a.ended ? a.currentTime : v + 0.1, T));
    }, 100);
    return () => clearInterval(id);
  }, [playing, T]);
  useEffect(() => {
    if (t >= T) setPlaying(false);
  }, [t, T]);

  const go = (to: number) => {
    const at = Math.max(0, Math.min(T, to));
    setT(at);
    if (sound.current) sound.current.currentTime = Math.min(at, sound.current.duration || at);
    return at;
  };
  const play = () => {
    const at = t >= T ? go(0) : t;
    setStarted(true);
    setPlaying(true);
    const a = sound.current;
    if (a && at < (a.duration || Infinity)) {
      // The sound may have been stopped from outside the page (a media key) while the film ran on.
      if (Math.abs(a.currentTime - at) > 0.3) a.currentTime = at;
      void a.play().catch(() => undefined);
    }
  };
  const pause = () => {
    setPlaying(false);
    sound.current?.pause();
  };
  const seek = (to: number) => {
    const at = go(to);
    setStarted(true);
    const a = sound.current;
    if (a && playing && a.paused && at < (a.duration || 0)) void a.play().catch(() => undefined);
  };

  const landed = records.filter((e) => e.at <= t);
  const lastLine = lines.findLast((l) => l.start <= t);
  const laura = lines.findLast((l) => l.who === "laura" && l.start <= t);
  const lidia = lastLine?.who === "lidia" ? lastLine : undefined;
  const caption = captions.findLast((c) => c.at <= t) ?? captions[0];
  const callOver = landed.some((e) => e.kind === "summary");
  const ended = t >= ending.at;
  const talk: ReactNode = ended ? (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18, ...arrive }}>
      <div style={{ font: "700 var(--size-answer)/1 var(--font-sans)", letterSpacing: "var(--tracking-display)" }}>{ending.text}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Link href="/demo" style={pill}>See his page</Link>
        <Link href="/demo/history" style={{ ...pill, background: "var(--surface-card)", color: "var(--ink)" }}>Open History</Link>
      </div>
    </div>
  ) : (
    <>
      {laura ? (
        <div key={laura.start} style={{ alignSelf: "flex-start", maxWidth: "92%", background: "var(--surface-quiet)", color: "var(--ink)", borderRadius: "24px 24px 24px 6px", padding: "14px 22px 16px", ...arrive }}>
          <div style={label}>Laura</div>
          <div style={{ marginTop: 2 }}>{laura.text}</div>
        </div>
      ) : null}
      {lidia ? (
        <div key={lidia.start} style={{ alignSelf: "flex-end", maxWidth: "92%", background: "var(--surface-card)", color: "var(--ink)", borderRadius: "24px 24px 6px 24px", padding: "14px 22px 18px", ...arrive }}>
          <div style={label}>Lidia</div>
          <div style={{ ...lead, marginTop: 4 }}>“{lidia.text}”</div>
        </div>
      ) : null}
    </>
  );

  return (
    <div style={{ marginTop: 36, position: "relative", background: "var(--surface-live)", color: "var(--text-on-live)", borderRadius: "var(--radius-card)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {data.audio ? <audio ref={sound} src={data.audio} preload="none" /> : null}
      {/* Side by side on a laptop. When they no longer fit, wrap-reverse puts the talk above Paul's page. */}
      <div style={{ display: "flex", flexWrap: "wrap-reverse", gap: "24px 36px", padding: "var(--film-pad) var(--film-pad) 24px" }}>
        <div style={{ flex: "1.9 1 560px", minWidth: 0, background: "var(--surface-page)", color: "var(--ink)", borderRadius: "var(--radius-card)", padding: "18px min(16px, var(--film-pad)) 16px", boxSizing: "border-box" }}>
          <PaulsPage records={landed} status={callOver ? "done" : started && t > 0 ? "live" : "not called yet"} calledAt={data.calledAt} />
        </div>
        <div style={{ flex: "1 1 320px", minWidth: 0, display: "flex", flexDirection: "column", minHeight: "var(--film-talk)", padding: "0 6px", boxSizing: "border-box" }}>
          <div key={caption.at} style={arrive}>
            <div style={label}>{caption.label}</div>
            <div style={{ ...lead, marginTop: 8, textWrap: "balance" }}>{caption.text}</div>
          </div>
          <div aria-live="off" style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>{talk}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "0 var(--film-pad) 28px" }}>
        <button type="button" className="laura-button" tabIndex={started ? 0 : -1} aria-label={playing ? "Pause" : "Play"} style={round} onClick={() => (playing ? pause() : play())}>
          {playing ? bars : triangle(9)}
        </button>
        <div
          role="slider"
          tabIndex={started ? 0 : -1}
          className="laura-button"
          aria-label="Position in the film"
          aria-valuemin={0}
          aria-valuemax={Math.round(T)}
          aria-valuenow={Math.round(t)}
          aria-valuetext={`${clock(t)} of ${clock(T)}`}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            seek(((e.clientX - r.left) / r.width) * T);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              seek(t + (e.key === "ArrowRight" ? 3 : -3));
            }
          }}
          style={{ flex: 1, height: 44, display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <div style={{ width: "100%", height: 6, borderRadius: 3, background: "var(--rule-on-highlight)" }}>
            <div style={{ width: `${(t / T) * 100}%`, height: "100%", borderRadius: 3, background: "var(--ink)" }} />
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
          aria-label={data.poster.title}
          style={{ position: "absolute", inset: 0, border: 0, background: "var(--surface-live)", color: "var(--text-on-live)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 28, padding: "min(13%, 200px) 24px 24px" }}
        >
          <span style={{ ...round, width: 112, height: 112 }}>{triangle(18)}</span>
          <span style={{ ...reading, textWrap: "balance", maxWidth: 680 }}>{data.poster.title}</span>
          <span style={{ font: "var(--text-body)" }}>{data.poster.note}</span>
        </button>
      ) : null}
    </div>
  );
}
