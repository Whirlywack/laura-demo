import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Card } from "../../components/Card";
import { SiteHeader } from "../../components/SiteHeader";

// "Why Laura" in the menu: who Laura is for, each problem with the name of what solves it, how each of those works,
// and what is not built yet. Words only, in the home page's type and cards.
export const metadata: Metadata = {
  title: "What problem is Laura solving?",
  description: "When an older person lives alone, small things get missed. Laura phones them every day and shows the family how they are, in their own words.",
};

// A size in px, or a clamp() for the long lines that must shrink on a phone.
const display = (size: number | string): CSSProperties => ({ font: `700 ${typeof size === "number" ? `${size}px` : size}/0.98 var(--font-sans)`, letterSpacing: "var(--tracking-display)", textWrap: "balance", margin: 0 });
const label: CSSProperties = { font: "var(--text-meta-font)", fontWeight: 700 };
const lead: CSSProperties = { font: "700 var(--size-lead)/var(--leading-lead) var(--font-sans)", letterSpacing: "var(--tracking-lead)" };
const title: CSSProperties = { font: "700 30px/1.1 var(--font-sans)", letterSpacing: "-.03em", textWrap: "balance" };
const body: CSSProperties = { marginTop: 12, color: "var(--text-secondary)", maxWidth: "46ch", textWrap: "pretty" };
const row: CSSProperties = { display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", marginTop: 36 };
const section: CSSProperties = { marginTop: 88, padding: "0 20px" };
const pill: CSSProperties = { padding: "13px 26px", borderRadius: "var(--radius-pill)", background: "var(--accent)", color: "var(--text-on-accent)", font: "var(--text-label)", textDecoration: "none", whiteSpace: "nowrap" };
const quietPill: CSSProperties = { ...pill, background: "var(--surface-quiet)", color: "var(--text-primary)" };

// The two people Laura is for, and the problems each of them has.
const people: [string, string, string[]][] = [
  ["The older person", "In their eighties or nineties, living on their own, with a landline or a button phone.", [
    "Their health is their own, and a standard checklist asks about none of it",
    "They mention something once and nobody asks again",
    "They have no smartphone",
    "They aren't sure whether they took their tablets",
    "They can't tell a real call from a scam",
  ]],
  ["The family carer", "A son, daughter or grandchild. Some live round the corner and do everything. Some live abroad. Some used to phone every day until life got busier.", [
    "You can't be there or phone every morning",
    "All you ever hear is “I'm fine”",
    "You don't know what to bring until you arrive",
    "What you know is secondhand and late",
  ]],
];
const context = "Laura knows who she is calling. The family tells her what matters for this person: their conditions, their tablets, the things to keep an eye on. Every morning she asks about exactly those. When the person mentions something new, a bad night or a pain that wasn't there last week, Laura brings it up again on the next call.";
// What solves each problem: the problem (as written above), the name of the answer, and one or two plain sentences.
const solutions: [string, string, string][] = [
  ["You can't be there or phone every morning", "A daily call from Laura", "Laura phones every morning, at the time the tablets are due, so you don't have to be the one who remembers."],
  ["They have no smartphone", "A call to any phone", "Laura rings the landline or the button mobile they already own. They pick up and talk."],
  ["They aren't sure whether they took their tablets", "Tablets confirmed on the line", "Laura names each tablet, waits while it is taken, and records it only then."],
  ["All you ever hear is “I'm fine”", "Daily wellbeing log", "How they feel, how they slept, and any reading they give, written down every morning in their own words."],
  ["You don't know what to bring until you arrive", "Shopping list from the call", "Laura asks what is running out. The list is waiting for you before your next visit."],
  // The phrase comes after they have said who they are (docs/demo-brief.md, Trust and safety), not as the first words.
  ["They can't tell a real call from a scam", "Family passphrase", "Once they have said who they are, Laura gives a phrase the family chose. A caller who doesn't say it isn't Laura."],
  ["What you know is secondhand and late", "Live family page", "Each answer appears on your page while the call is still going."],
];
const notYet: [string, string][] = [
  ["Missed-call alert", "You're told within minutes when the morning call goes unanswered."],
  ["Prescription calendar", "Tablets and prescription dates are counted, and you're warned before one runs out."],
  ["Ordering", "Medicines and groceries ordered from the list through a pharmacy or a shop."],
];
const reading: CSSProperties = { font: "700 var(--size-reading)/1.03 var(--font-sans)", letterSpacing: "var(--tracking-reading)", textWrap: "balance" };
const dot: CSSProperties = { width: "var(--marker)", height: "var(--marker)", borderRadius: "50%", background: "var(--accent)", flex: "none" };
const quiet: CSSProperties = { font: "var(--text-meta-font)", color: "var(--text-secondary)" };

export default function About() {
  return (
    <div style={{ padding: "0 24px 8px", maxWidth: 1760, margin: "0 auto", boxSizing: "border-box" }}>
      <SiteHeader current="about">
        <Link href="/demo" className="laura-button" style={pill}>See the demo</Link>
      </SiteHeader>

      {/* The question is the label; the answer is the largest thing on the page. */}
      <section style={{ padding: "56px 20px 16px" }}>
        <div style={{ ...label, color: "var(--text-question)" }}>What problem are we solving?</div>
        <h1 style={{ ...display("clamp(34px, 5.4vw, 60px)"), marginTop: 18, maxWidth: 1180 }}>
          Laura is for two people: an older person who lives alone, and the family member who can&apos;t be there every morning.
        </h1>
      </section>

      {/* Each person, then what is hard for them. */}
      <div style={row}>
        {people.map(([who, text, problems], i) => (
          <Card key={who} tone={i ? "card" : "quiet"} style={{ flex: "1 1 460px", minWidth: 0, padding: "40px clamp(26px, 4vw, 44px) 30px" }}>
            <div style={reading}>{who}</div>
            <div style={body}>{text}</div>
            <div style={{ ...label, marginTop: 36, marginBottom: 10 }}>What is hard</div>
            <div>
              {problems.map((problem) => (
                <div key={problem} style={{ display: "flex", gap: 14, alignItems: "baseline", padding: "13px 0", borderTop: `1px solid var(--rule)` }}>
                  <span style={dot} />
                  <span style={{ textWrap: "pretty" }}>{problem}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <section style={section}>
        <h2 style={display(40)}>How Laura solves them</h2>
      </section>
      <div style={row}>
        {/* The one that answers two of the problems, and the reason no two calls are the same. */}
        <Card tone="live" style={{ flex: "1 1 100%", minWidth: 0, padding: "44px clamp(26px, 4vw, 44px) 48px", display: "flex", flexWrap: "wrap", gap: "28px 64px" }}>
          <div style={{ flex: "1 1 380px", minWidth: 0 }}>
            <div style={label}>The heart of it</div>
            <div style={{ ...display("clamp(36px, 4.6vw, 52px)"), marginTop: 14 }}>No two people get the same call.</div>
          </div>
          <div style={{ flex: "1.2 1 420px", minWidth: 0 }}>
            <div style={lead}>Context-infused conversations</div>
            <div style={{ font: "400 20px/1.45 var(--font-sans)", marginTop: 12, maxWidth: "58ch", textWrap: "pretty" }}>{context}</div>
          </div>
        </Card>
        <Card style={{ flex: "1 1 100%", minWidth: 0, padding: "14px clamp(26px, 4vw, 44px) 18px" }}>
          {solutions.map(([problem, name, text], i) => (
            <div key={name} style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "8px 48px", padding: "26px 0", borderTop: i ? "1px solid var(--rule)" : 0 }}>
              <div style={{ flex: "1 1 340px", minWidth: 0 }}>
                <div style={title}>{name}</div>
                <div style={{ ...quiet, marginTop: 8 }}>{problem}</div>
              </div>
              <div style={{ flex: "1.2 1 380px", minWidth: 0, font: "400 20px/1.45 var(--font-sans)", maxWidth: "52ch", textWrap: "pretty" }}>{text}</div>
            </div>
          ))}
        </Card>
      </div>

      <section style={section}>
        <div style={label}>Not yet</div>
        <div style={{ marginTop: 6, maxWidth: 860 }}>
          {notYet.map(([name, text], i) => (
            <div key={name} style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "2px 28px", padding: "14px 0", borderTop: i ? "1px solid var(--rule)" : 0 }}>
              <b style={{ flex: "0 1 220px" }}>{name}</b>
              <span style={{ flex: "1 1 320px", color: "var(--text-secondary)" }}>{text}</span>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: "72px 20px 48px" }}>
        <div style={{ ...display(40), maxWidth: 760 }}>Laura reminds and records. She gives no medical advice.</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
          <Link href="/#one-morning" className="laura-button" style={pill}>Watch one call</Link>
          <Link href="/#safety" className="laura-button" style={quietPill}>Safety</Link>
        </div>
      </footer>
    </div>
  );
}
