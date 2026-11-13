"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { readClient } from "../lib/supabase";

// Re-derives the dashboard state on the server whenever a Call or an Entry changes, so the page updates without a reload.
// It also refreshes once subscribed, to catch anything written between the page loading and the subscription starting.
export function LiveUpdates() {
  const router = useRouter();

  useEffect(() => {
    const db = readClient();
    const channel = db
      .channel("dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "calls" }, () => router.refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "entries" }, () => router.refresh())
      .subscribe((status) => {
        if (status === "SUBSCRIBED") router.refresh();
      });
    return () => {
      db.removeChannel(channel);
    };
  }, [router]);

  return null;
}
