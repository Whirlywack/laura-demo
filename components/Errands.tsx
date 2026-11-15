"use client";

import { useState, type CSSProperties } from "react";
import { AnswerCard } from "./AnswerCard";
import { Checklist, type ChecklistItem } from "./Checklist";

type Errand = ChecklistItem & { id: string };

// Every Errand from every Call, with a tick box. The page can only read, so a tick goes to the server.
// The box shows ticked at once, and unticks again if the server does not record it.
// Chamomile is for something to do: with nothing left to bring, the card is quiet.
export function Errands({ errands, style }: { errands: Errand[]; style?: CSSProperties }) {
  const [ticked, setTicked] = useState<string[]>([]);
  const items = errands.map((e) => ({ ...e, done: e.done || ticked.includes(e.id) }));
  const open = items.filter((e) => !e.done).length;

  async function tick(id: string) {
    setTicked((t) => [...t, id]);
    const response = await fetch(`/api/errands/${id}/tick`, { method: "POST" }).catch(() => null);
    if (!response?.ok) setTicked((t) => t.filter((x) => x !== id));
  }

  return (
    <AnswerCard
      tone={open ? "action" : "quiet"}
      style={style}
      question="What do I need to do?"
      answer={open === 0 ? "Nothing to bring" : `Bring ${open} ${open === 1 ? "thing" : "things"}`}
    >
      {items.length ? <Checklist items={items} onTick={(i) => tick(items[i].id)} /> : null}
    </AnswerCard>
  );
}
