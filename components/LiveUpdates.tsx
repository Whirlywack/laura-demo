"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { readClient } from "../lib/supabase";

// Changes that land within this many milliseconds of each other share one refresh.
const SETTLE_MS = 250;

// Re-derives the dashboard state on the server whenever a Call or an Entry changes, so the page updates without a reload.
// It also refreshes once subscribed, to catch anything written between the page loading and the subscription starting.
export function LiveUpdates() {
  const router = useRouter();

  useEffect(() => {
    const db = readClient();
    // Resetting the sample data changes a few hundred rows in under a second. One refresh per change queued as many
    // page renders and held the page on the old state for about 25 seconds, so a burst of changes shares one refresh.
    // A change that arrives while a refresh is waiting is still read by it, because that refresh starts later.
    let pending: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      pending ??= setTimeout(() => {
        pending = undefined;
        router.refresh();
      }, SETTLE_MS);
    };
    const channel = db
      .channel("dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "calls" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "entries" }, refresh)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") router.refresh();
      });
    return () => {
      clearTimeout(pending);
      db.removeChannel(channel);
    };
  }, [router]);

  return null;
}
