"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Card } from "../Card";

// The home page's "On the call" cards. When the row scrolls into view its four headings appear one after another,
// and only then the text under each. The cards themselves never move. Without JavaScript, with reduced motion, or
// when the row is already in view as the page opens, everything is simply there.
const title: CSSProperties = { font: "700 30px/1.1 var(--font-sans)", letterSpacing: "-.03em" };
const lead: CSSProperties = { font: "700 var(--size-lead)/var(--leading-lead) var(--font-sans)", letterSpacing: "var(--tracking-lead)" };
const HEADING = 0.35, TEXT = 0.3;

/** Each card: what it is, Laura's line or what the page shows, and one plain line. */
export function OnTheCall({ cards }: { cards: [what: string, words: string, how: string][] }) {
  const row = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<"there" | "waiting" | "playing">("there");

  useEffect(() => {
    const el = row.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    // Already on screen as the page opens: leave it be, rather than hide it and bring it back.
    if (el.getBoundingClientRect().top < window.innerHeight) return undefined;
    setStage("waiting");
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setStage("playing");
        seen.disconnect();
      },
      { threshold: 0.35 },
    );
    seen.observe(el);
    return () => seen.disconnect();
  }, []);

  // A heading's turn, then, once all four are in, each card's text.
  const arriving = (seconds: number) =>
    stage === "there" ? {} : stage === "waiting" ? { className: "laura-wait" } : { className: "laura-say", style: { animationDelay: `${seconds}s` } };
  const textFrom = cards.length * HEADING + 0.2;

  return (
    <div ref={row} style={{ display: "flex", flexWrap: "wrap", gap: "var(--gap-cards)", marginTop: 36 }}>
      {cards.map(([what, words, how], i) => {
        const heading = arriving(i * HEADING), text = arriving(textFrom + i * TEXT);
        return (
          <Card key={what} style={{ flex: "1 1 300px", minWidth: 0, padding: "28px 30px 26px", display: "flex", flexDirection: "column" }}>
            <div className={heading.className} style={{ ...title, ...heading.style }}>{what}</div>
            <div className={text.className} style={{ ...lead, marginTop: 14, color: "var(--text-question)", textWrap: "balance", ...text.style }}>{words}</div>
            <div style={{ flex: 1, minHeight: 14 }} />
            <div className={text.className} style={{ color: "var(--text-secondary)", ...text.style }}>{how}</div>
          </Card>
        );
      })}
    </div>
  );
}
