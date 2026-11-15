import type { Metadata } from "next";
import { Fragment, type CSSProperties } from "react";
import Link from "next/link";
import { Card } from "../components/Card";
import { Film } from "../components/home/Film";
import { DataBlocks } from "../components/home/DataBlocks";
import { realCall } from "../components/home/films";
import { TabletTicks } from "../components/home/TabletTicks";
import { SiteHeader } from "../components/SiteHeader";

// The home page, ported from .claude/skills/laura-design/ui_kits/home/Home.jsx: what Laura is, a call to listen to (the film,
// components/home/films.ts) with a month of her answers and her tablet count drawn under it, then Laura's two jobs. The tablets are Lidia's own (as in the care plan); "See the demo" opens the dashboard at /demo.
export const metadata: Metadata = {
  title: "Laura: a phone call every morning for an older family member",
  description: "Laura phones an older family member every morning on the phone they already have. You see how they are, whether the tablets were taken and what is running low, as they speak.",
};

const display = (size: number): CSSProperties => ({ font: `700 ${size}px/0.98 var(--font-sans)`, letterSpacing: "var(--tracking-display)", textWrap: "balance", margin: 0 });
const label: CSSProperties = { font: "var(--text-meta-font)", fontWeight: 700 };
const lead: CSSProperties = { font: "700 var(--size-lead)/var(--leading-lead) var(--font-sans)", letterSpacing: "var(--tracking-lead)" };
const reading: CSSProperties = { font: "700 var(--size-reading)/1.03 var(--font-sans)", letterSpacing: "var(--tracking-reading)" };
const title: CSSProperties = { font: "700 30px/1.1 var(--font-sans)", letterSpacing: "-.03em" };
const box: CSSProperties = { width: 24, height: 24, border: "2px solid var(--ink)", background: "var(--surface-card)", borderRadius: 7, flex: "none", boxSizing: "border-box" };
const pill: CSSProperties = { padding: "13px 26px", borderRadius: "var(--radius-pill)", background: "var(--accent)", color: "var(--text-on-accent)", font: "var(--text-label)", textDecoration: "none", whiteSpace: "nowrap" };
const q = (s: string) => "“" + s + "”";

const jobs: [string, string[]][] = [
  ["Nothing gets missed", ["Tablets, taken while Laura waits on the line", "Anything running out at home, passed on to you"]],
  ["A record of how they are", ["How they feel today, in their own words", "How they slept", "Whatever you ask Laura to follow, day by day. For Lidia, it is her left leg.", "Blood pressure, as they read it out"]],
];
// What happens on the call: what it is, Laura's line or what the page shows (her own words, so no quotation marks),
// and one plain line.
const onTheCall: [string, string, string][] = [
  ["Laura waits.", "Take them now, take your time, I'll wait.", "The tablet is recorded once it is taken."],
  ["Laura remembers.", "You told me yesterday you slept badly. How was last night?", "Each call starts from the last one."],
  ["You see it live.", "Concor · Taken on call · 09:32", "It is on your page while the call is still going."],
  ["They know it is Laura.", "Paul says the blue teapot is still his favourite.", "Once they have said who they are, Laura gives a phrase only your family knows."],
];

export default function Home() {
  return (
    <div style={{ padding: "0 24px 8px", maxWidth: 1760, margin: "0 auto", boxSizing: "border-box" }}>
      <SiteHeader>
        <Link href="/demo" className="laura-button" style={pill}>See the demo</Link>
      </SiteHeader>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)" }}>
        <Card tone="live" style={{ flex: "1 1 380px", minWidth: 0, padding: "36px 40px 30px", display: "flex", flexDirection: "column" }}>
          <div style={label}>Their side · the phone they already have</div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG drawing, nothing to optimise */}
            <img src="/home-phone.svg" alt="A cordless home phone standing in its charging stand" style={{ height: 500, maxHeight: "60vh", maxWidth: "100%" }} />
          </div>
          <div>
            <div style={lead}>No smartphone needed.</div>
            <div style={{ marginTop: 8 }}>Many older people have no smartphone, or have one and rarely use it. Laura rings the phone that&apos;s already in the house, a landline or a simple mobile. They just pick up.</div>
          </div>
        </Card>

        <div style={{ flex: "2.2 1 600px", minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--gap-cards)" }}>
          <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)" }}>
            <div style={{ flex: "2 1 420px", minWidth: 0, padding: "14px 12px 24px 24px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10, ...label, padding: "8px 16px", borderRadius: "var(--radius-pill)", background: "var(--surface-quiet)" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)", flex: "none" }} />
                <span>One family&apos;s morning · Lidia, 94 · on the phone now</span>
              </span>
              <h1 style={{ ...display(60), marginTop: 22, maxWidth: 760 }}>A phone call every morning, so nothing gets missed.</h1>
              <p style={{ margin: "20px 0 0", maxWidth: 520, lineHeight: 1.4, color: "var(--text-secondary)" }}>
                Laura phones an older family member who lives alone: a parent, a grandparent, an aunt or uncle. You get a page that fills in as they speak.
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
              <div style={title}>To bring Lidia</div>
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
        <h2 style={display(40)}>Listen to a call</h2>
        <p style={{ margin: "18px 0 0", maxWidth: 760, fontSize: 22, lineHeight: 1.4, color: "var(--text-secondary)" }}>
          Lidia is 94. Her grandson Paul looks after her from another city. The words are from a real call on 14 November. Laura&apos;s voice is the one you would hear on the phone. Lidia&apos;s side is read by a generated voice.
        </p>
      </section>
      <Film data={realCall} />
      <DataBlocks />

      <section id="on-the-call" style={{ marginTop: 72, padding: "0 20px", scrollMarginTop: 24 }}>
        <h2 style={display(40)}>On the call</h2>
      </section>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", marginTop: 36 }}>
        {onTheCall.map(([what, words, how]) => (
          <Card key={what} style={{ flex: "1 1 300px", minWidth: 0, padding: "28px 30px 26px", display: "flex", flexDirection: "column" }}>
            <div style={title}>{what}</div>
            <div style={{ ...lead, marginTop: 14, color: "var(--text-question)", textWrap: "balance" }}>{words}</div>
            <div style={{ flex: 1, minHeight: 14 }} />
            <div style={{ color: "var(--text-secondary)" }}>{how}</div>
          </Card>
        ))}
      </div>

      <section id="what-laura-does" style={{ marginTop: 72, padding: "0 20px", scrollMarginTop: 24 }}>
        <h2 style={display(40)}>What Laura does</h2>
      </section>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", marginTop: 36 }}>
        <Card style={{ flex: "1 1 600px", minWidth: 0, padding: "40px 44px 44px" }}>
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
      </div>

      <footer id="safety" style={{ padding: "64px 20px 40px", scrollMarginTop: 24 }}>
        <div style={label}>Safety</div>
        <div style={{ ...lead, marginTop: 10, maxWidth: 760, textWrap: "balance" }}>Laura reminds and records. She never gives medical advice and never interprets a reading.</div>
        <div style={{ marginTop: 12, maxWidth: 760, color: "var(--text-secondary)" }}>
          Once they have said who they are, Laura gives a phrase your family chose, so they know it is really Laura and can hang up on anyone else. Asked if she is a person, Laura says she is not. In an emergency she tells them to call 112.
        </div>
        <div style={{ marginTop: 12, maxWidth: 760, color: "var(--text-secondary)" }}>Lidia and Paul are sample people, and everything on these pages is sample data.</div>
      </footer>
    </div>
  );
}
