"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CallStatus as Status } from "../lib/dashboard";
import { CallStatus } from "./CallStatus";

// The Call status and the Call now button, in one place in the header, as in the skill's CallStatus.
// The button stays after the first Call: pressing it again replaces a Call nobody answered.
// It is disabled while its request is in flight, and the server's reason shows beneath it if it refuses.
// The site is public, so the first press asks for the password; Enter or a second press places the call.
export function CallNow({ status }: { status: Status }) {
  const router = useRouter();
  const [calling, setCalling] = useState(false);
  const [message, setMessage] = useState("");
  const [asking, setAsking] = useState(false);
  const [password, setPassword] = useState("");

  async function call(event: React.FormEvent) {
    event.preventDefault();
    if (!asking) return setAsking(true);
    setCalling(true);
    setMessage("");
    const response = await fetch("/api/call-now", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    const result = await response?.json().catch(() => null);
    if (response?.ok) router.refresh();
    else setMessage(result?.message ?? "The call could not be placed. Please try again.");
    setCalling(false);
  }

  // The message sits beside the controls rather than beneath them, so it does not push the page down.
  return (
    <form onSubmit={call} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end", gap: 16 }}>
      <div role="status" style={{ font: "var(--text-meta-font)", color: "var(--text-secondary)", maxWidth: "38ch", textAlign: "right" }}>
        {message}
      </div>
      <CallStatus status={status} />
      {asking && (
        <input
          type="password"
          aria-label="Password to place a call"
          placeholder="Password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="laura-input"
          style={{
            minHeight: "var(--hit-min)", padding: "10px 20px", width: "16ch", boxSizing: "border-box",
            border: "1px solid var(--rule)", borderRadius: "var(--radius-pill)", background: "var(--surface-card)",
            font: "var(--text-label)", color: "var(--ink)",
          }}
        />
      )}
      <button
        type="submit"
        className="laura-button"
        disabled={calling}
        style={{
          display: "inline-flex", alignItems: "center", minHeight: "var(--hit-min)", padding: "12px 22px", border: 0,
          borderRadius: "var(--radius-pill)", font: "var(--text-label)", whiteSpace: "nowrap", boxSizing: "border-box",
          background: calling ? "var(--ink-3)" : "var(--accent)", color: "var(--text-on-accent)", cursor: calling ? "progress" : "pointer",
        }}
      >
        Call now
      </button>
    </form>
  );
}
