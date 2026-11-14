import type { Metadata } from "next";
import { Fragment, type CSSProperties } from "react";
import { Card } from "../components/Card";
import { Story, type Beat } from "../components/home/Story";
import { TabletTicks } from "../components/home/TabletTicks";
import { StatusLabel } from "../components/StatusLabel";

// The home page, ported from .claude/skills/laura-design/ui_kits/home/Home.jsx: what Laura is, one morning step by
// step, then what it adds up to. The tablets are Lidia's own (as in the care plan); "Call now" opens the demo at /demo.
export const metadata: Metadata = {
  title: "Laura",
  description: "Laura phones her every morning, so nothing gets missed. A daily phone call for your mother or grandmother, and a page for you that fills in as she speaks.",
};

const display = (size: number): CSSProperties => ({ font: `700 ${size}px/0.98 var(--font-sans)`, letterSpacing: "var(--tracking-display)", textWrap: "balance", margin: 0 });
const label: CSSProperties = { font: "var(--text-meta-font)", fontWeight: 700 };
const lead: CSSProperties = { font: "700 var(--size-lead)/var(--leading-lead) var(--font-sans)", letterSpacing: "var(--tracking-lead)" };
const reading: CSSProperties = { font: "700 var(--size-reading)/1.03 var(--font-sans)", letterSpacing: "var(--tracking-reading)" };
const title: CSSProperties = { font: "700 30px/1.1 var(--font-sans)", letterSpacing: "-.03em" };
const box: CSSProperties = { width: 24, height: 24, border: "2px solid var(--ink)", background: "var(--surface-card)", borderRadius: 7, flex: "none", boxSizing: "border-box" };
const pill: CSSProperties = { padding: "13px 26px", borderRadius: "var(--radius-pill)", background: "var(--accent)", color: "var(--text-on-accent)", font: "var(--text-label)", textDecoration: "none", whiteSpace: "nowrap" };
const q = (s: string) => "“" + s + "”";

const story: Beat[] = [
  {
    time: "09:30", say: "At half past nine the phone rings. Lidia picks up.", laura: "Good morning, Lidia. How did you sleep?", lidia: "I woke at four and couldn't get back off. Otherwise fine.",
    card: { label: "Sleep", body: q("I woke at four and couldn't get back off. Otherwise fine.") },
  },
  {
    time: "09:32", say: "Laura reminds her about the morning tablets, and stays on the line while she takes them.", laura: "Take them now, take your time, I'll wait.", lidia: "There. I've swallowed it.",
    card: { label: "Tablets", body: <span style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "4px 12px" }}><b>Concor 5 mg</b><StatusLabel status="taken on call" /></span> },
  },
  {
    time: "09:34", say: "Then the blood pressure. Lidia reads the numbers off her monitor.", laura: "What does your blood pressure say this morning?", lidia: "One thirty-eight over eighty-two. I wrote it down.",
    card: { label: "Blood pressure", body: <span style={lead}>138/82</span> },
  },
  {
    time: "09:35", say: "Before they say goodbye, Laura asks about the cupboards.", laura: "Is anything running out at home?", lidia: "I'm nearly out of tea. Two bags left.",
    card: { action: true, label: "For Paul to bring", body: <span style={lead}>Tea</span> },
  },
];
const ending = { time: "09:36", say: "Six minutes. Lidia goes back to her morning. Paul opens the page and knows how she is." };
const jobs: [string, string[]][] = [
  ["Makes sure nothing is missed", ["Her tablets, taken while Laura waits on the line", "Anything running out at home, passed on to you"]],
  ["Keeps a record of how she is", ["How she feels today, in her own words", "How she slept", "Her left leg, day by day", "Her blood pressure, as she reads it out"]],
];

export default function Home() {
  return (
    <div style={{ padding: "0 24px 8px", maxWidth: 1760, margin: "0 auto", boxSizing: "border-box" }}>
      <header style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 40px", padding: "26px 20px 22px" }}>
        <div style={{ font: "700 var(--size-wordmark-large)/1 var(--font-sans)", letterSpacing: "-.06em" }}>laura</div>
        <div style={{ flex: 1 }} />
        <nav style={{ display: "flex", flexWrap: "wrap", gap: "8px 36px", whiteSpace: "nowrap" }}>
          <a href="#one-morning" style={{ color: "inherit", textDecoration: "none" }}>One morning</a>
          <a href="#what-laura-does" style={{ color: "inherit", textDecoration: "none" }}>What Laura does</a>
          <a href="#about" style={{ color: "inherit", textDecoration: "none" }}>About</a>
        </nav>
        <a href="/demo" style={pill}>Call now</a>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)" }}>
        <Card tone="live" style={{ flex: "1 1 380px", minWidth: 0, padding: "36px 40px 30px", display: "flex", flexDirection: "column" }}>
          <div style={label}>Her side · the phone she already has</div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG drawing, nothing to optimise */}
            <img src="/home-phone.svg" alt="A cordless home phone standing in its charging stand" style={{ height: 500, maxHeight: "60vh", maxWidth: "100%" }} />
          </div>
          <div>
            <div style={lead}>No smartphone needed.</div>
            <div style={{ marginTop: 8 }}>Most people her age don&apos;t have one. Laura rings the phone that&apos;s already in the house, a landline or a simple mobile, and she just answers.</div>
          </div>
        </Card>

        <div style={{ flex: "2.2 1 600px", minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--gap-cards)" }}>
          <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)" }}>
            <div style={{ flex: "2 1 420px", minWidth: 0, padding: "14px 12px 24px 24px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10, ...label, padding: "8px 16px", borderRadius: "var(--radius-pill)", background: "var(--surface-quiet)" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)", flex: "none" }} />
                <span>Lidia, 94 · on the phone now</span>
              </span>
              <h1 style={{ ...display(60), marginTop: 22, maxWidth: 760 }}>Laura phones her every morning, so nothing gets missed.</h1>
              <p style={{ margin: "20px 0 0", maxWidth: 520, lineHeight: 1.4, color: "var(--text-secondary)" }}>
                A daily phone call for your mother or grandmother, and a page for you that fills in as she speaks.
              </p>
            </div>
            <Card tone="quiet" style={{ flex: "1 1 300px", minWidth: 0, padding: 30, display: "flex", flexDirection: "column" }}>
              <div style={{ ...label, color: "var(--text-question)" }}>Today, in her words</div>
              <div style={{ ...reading, marginTop: 14 }}>{q("I'm all right. A bit tired, but all right.")}</div>
              <div style={{ flex: 1, minHeight: 16 }} />
              <div style={label}>Sleep</div>
              <div style={{ marginTop: 2 }}>{q("I woke at four and couldn't get back off.")}</div>
            </Card>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)" }}>
            <Card style={{ flex: "1.2 1 320px", minWidth: 0, padding: "28px 30px 26px" }}>
              <div style={title}>Tablets</div>
              <TabletTicks tablets={["Concor", "Sanoral HCT", "Eliquis"]} initial={["taken", "taken", "earlier"]} />
            </Card>
            <Card tone="quiet" style={{ flex: "1 1 280px", minWidth: 0, padding: "28px 30px 26px" }}>
              <div style={title}>Blood pressure</div>
              <div style={{ marginTop: 4, color: "var(--text-secondary)" }}>She read it out on the call.</div>
              <div style={{ marginTop: 16 }}>{q("One thirty-eight over eighty-two. I wrote it down.")}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", marginTop: 14, fontVariantNumeric: "tabular-nums" }}>
                {[["Today", "138/82"], ["Thu 12 Nov", "142/85"], ["Wed 11 Nov", "136/80"]].map(([d, v], i) => (
                  <Fragment key={d}>
                    <span style={{ padding: "9px 0", borderTop: "1px solid var(--rule)", ...(i ? { color: "var(--text-secondary)" } : { fontWeight: 700 }) }}>{d}</span>
                    <span style={{ padding: "9px 0", borderTop: "1px solid var(--rule)", fontWeight: i ? 400 : 700 }}>{v}</span>
                  </Fragment>
                ))}
              </div>
            </Card>
            <Card tone="action" style={{ flex: "1 1 280px", minWidth: 0, padding: "28px 30px 26px" }}>
              <div style={title}>To bring her</div>
              <div style={{ marginTop: 4 }}>2 things she&apos;s running out of.</div>
              <div style={{ marginTop: 16, borderTop: "1px solid var(--rule-on-highlight)", padding: "12px 0 14px" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={box} />
                  <b style={{ flex: 1 }}>Tea</b>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, ...label, whiteSpace: "nowrap" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)" }} />
                    <span>Just now</span>
                  </span>
                </div>
                <div style={{ margin: "8px 0 0 36px" }}>{q("I'm nearly out of tea. Two bags left.")}</div>
              </div>
              <div style={{ borderTop: "1px solid var(--rule-on-highlight)", padding: "12px 0 0", display: "flex", gap: 12, alignItems: "center" }}>
                <span style={box} />
                <b style={{ flex: 1 }}>Hearing-aid batteries</b>
                <span style={{ font: "var(--text-meta-font)", whiteSpace: "nowrap" }}>Wed</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <section id="one-morning" style={{ marginTop: 88, padding: "0 20px", scrollMarginTop: 24 }}>
        <h2 style={display(64)}>One morning with Lidia</h2>
        <p style={{ margin: "18px 0 0", maxWidth: 680, fontSize: 22, lineHeight: 1.4, color: "var(--text-secondary)" }}>
          Lidia is 94. Her grandson Paul looks after her from another city. This is Friday.
        </p>
      </section>
      <Story beats={story} ending={ending} styles={{ label, lead, reading }} />

      <section id="what-laura-does" style={{ marginTop: 72, padding: "0 20px", scrollMarginTop: 24 }}>
        <h2 style={display(64)}>What it adds up to</h2>
      </section>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", marginTop: 36 }}>
        <Card style={{ flex: "2.2 1 600px", minWidth: 0, padding: "40px 44px 44px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "36px 56px" }}>
            {jobs.map(([job, items]) => (
              <div key={job} style={{ flex: "1 1 300px", minWidth: 0 }}>
                <div style={reading}>{job}</div>
                <div style={{ marginTop: 22 }}>
                  {items.map((it) => (
                    <div key={it} style={{ display: "flex", gap: 14, alignItems: "baseline", padding: "13px 0", borderTop: "1px solid var(--rule)" }}>
                      <span style={{ width: "var(--marker)", height: "var(--marker)", borderRadius: "50%", background: "var(--accent)", flex: "none" }} />
                      <span>{it}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card tone="quiet" style={{ flex: "1 1 380px", minWidth: 0, padding: "40px 42px 44px" }}>
          <div style={label}>Day after day</div>
          <div style={{ font: "700 80px/0.95 var(--font-sans)", letterSpacing: "-.06em", marginTop: 8, whiteSpace: "nowrap" }}>39 of 42</div>
          <div style={{ marginTop: 10 }}>of Lidia&apos;s tablets confirmed on the call in the last two weeks</div>
          <div role="img" aria-label="39 of 42 dots filled" style={{ display: "grid", gridTemplateColumns: "repeat(14,1fr)", gap: 8, marginTop: 30 }}>
            {Array.from({ length: 42 }, (_, i) => (
              <span key={i} style={{ aspectRatio: "1", borderRadius: "50%", boxSizing: "border-box", ...(i < 39 ? { background: "var(--accent)" } : { border: "2px solid var(--accent)" }) }} />
            ))}
          </div>
        </Card>
      </div>

      <footer id="about" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "8px 32px", padding: "40px 20px 28px" }}>
        <b>About</b>
        <span style={{ color: "var(--text-secondary)" }}>Laura reminds and records. She never gives medical advice and never interprets a reading.</span>
      </footer>
    </div>
  );
}
