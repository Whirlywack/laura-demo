"use client";

import { useState } from "react";
import { FeedItem } from "./FeedItem";

type Card = { id: string; title: string; time: string; quote: string };

// The live call feed, newest first. Only a card that arrives while the page is open moves.
export function LiveFeed({ cards }: { cards: Card[] }) {
  const [onLoad] = useState(() => new Set(cards.map((c) => c.id)));

  if (cards.length === 0) {
    return (
      <div style={{ padding: "14px 0 0", font: "var(--text-quote)", color: "var(--text-secondary)" }}>
        Nothing yet. What she says arrives here during the call.
      </div>
    );
  }
  return cards.map((c, i) => (
    <FeedItem key={c.id} title={c.title} time={c.time} quote={c.quote} isNew={i === 0 && !onLoad.has(c.id)} last={i === cards.length - 1} />
  ));
}
