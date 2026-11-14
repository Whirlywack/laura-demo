import type { ReactNode } from "react";
import { HistoryHeader } from "../../../components/history/HistoryHeader";

// The History page and a day's page share this frame, so the header stays put when you move between them.
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main style={{ padding: "0 24px 40px", boxSizing: "border-box" }}>
      <HistoryHeader />
      {children}
    </main>
  );
}
