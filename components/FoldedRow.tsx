"use client";

import { useState, type ComponentProps } from "react";
import { QuietRow } from "./QuietRow";

// A QuietRow folded until the Family carer opens it. It stays open across live updates.
export function FoldedRow(props: Omit<ComponentProps<typeof QuietRow>, "open" | "onToggle">) {
  const [open, setOpen] = useState(false);
  return <QuietRow {...props} open={open} onToggle={() => setOpen((o) => !o)} />;
}
