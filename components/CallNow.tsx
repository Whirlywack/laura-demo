"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CallStatus as Status } from "../lib/dashboard";
import { CallStatus } from "./CallStatus";

// The Call status and the Call now button, in one place in the header, as in the skill's CallStatus.
// The button stays after the first Call: pressing it again replaces a Call nobody answered.
// It is disabled while its request is in flight, and the server's reason shows beneath it if it refuses.
export function CallNow({ status }: { status: Status }) {
  const router = useRouter();
  const [calling, setCalling] = useState(false);
  const [message, setMessage] = useState("");

  async function call() {
    setCalling(true);
    setMessage("");
    const response = await fetch("/api/call-now", { method: "POST" }).catch(() => null);
    const result = await response?.json().catch(() => null);
    if (response?.ok) router.refresh();
    else setMessage(result?.message ?? "The call could not be placed. Please try again.");
    setCalling(false);
  }

  // The message sits beside the controls rather than beneath them, so it does not push the page down.
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end", gap: 16 }}>
      <div role="status" style={{ font: "var(--text-meta-font)", color: "var(--text-secondary)", maxWidth: "38ch", textAlign: "right" }}>
        {message}
      </div>
      <CallStatus status={status} />
      <button
        type="button"
        className="laura-button"
        onClick={call}
        disabled={calling}
        style={{
          display: "inline-flex", alignItems: "center", minHeight: "var(--hit-min)", padding: "12px 22px", border: 0,
          borderRadius: "var(--radius-pill)", font: "var(--text-label)", whiteSpace: "nowrap", boxSizing: "border-box",
          background: calling ? "var(--ink-3)" : "var(--ink)", color: "var(--paper)", cursor: calling ? "progress" : "pointer",
        }}
      >
        Call now
      </button>
    </div>
  );
}
