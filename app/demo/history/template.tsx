import type { ReactNode } from "react";

// A template is mounted afresh on each move between the History page and a day (or from one day to the next), so the
// cards stay where they are and what is written in them appears again (app/globals.css: laura-card).
export default function Template({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
