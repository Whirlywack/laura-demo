import type { RealtimeChannel } from "@supabase/supabase-js";
import { afterEach, expect, test } from "vitest";
import { getDashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";
import { resetSampleData, sendTool, startCall } from "./helpers";

let channel: RealtimeChannel | undefined;
afterEach(async () => {
  if (channel) await readClient().removeChannel(channel);
  channel = undefined;
});

// Must-have 1: what Laura records reaches an open page within a second or two, with no reload. The page listens the
// way this test does (components/LiveUpdates.tsx), with the public key, to changes on calls and entries.
// The live-update service can still be starting (a cold start on CI) or working through earlier tests' changes, so the
// test starts Calls until one comes through, which shows it is listening and caught up, and only times Laura's Entry.
test("an Entry Laura records reaches a page listening for live updates within two seconds", async () => {
  const db = readClient();
  const seen: { table: string; row: Record<string, unknown> }[] = [];
  const waiters: (() => void)[] = [];
  const within = (ms: number, found: () => unknown) =>
    new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => resolve(false), ms);
      const check = () => (found() ? (clearTimeout(timer), resolve(true)) : waiters.push(check));
      check();
    });
  const note = (table: string) => (change: { new: Record<string, unknown> }) => {
    seen.push({ table, row: change.new });
    waiters.splice(0).forEach((check) => check());
  };
  let subscribed!: () => void;
  const ready = new Promise<void>((resolve) => (subscribed = resolve));
  channel = db
    .channel("test-live-updates")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "calls" }, note("calls"))
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "entries" }, note("entries"))
    .subscribe((status) => {
      if (status === "SUBSCRIBED") subscribed();
    });
  await ready;
  let call_id: string | undefined;
  for (let tries = 0; !call_id && tries < 30; tries++) {
    const id = await startCall();
    if (await within(1500, () => seen.some((s) => s.table === "calls" && s.row.id === id))) call_id = id;
  }
  expect(call_id, "live updates never started").toBeDefined();

  await sendTool("log_wellbeing", { call_id, quote: "I'm all right, thank you.", aspect: "general" });

  const entry = () => seen.find((s) => s.table === "entries" && s.row.call_id === call_id)?.row;
  expect(await within(2000, entry), "no live update within 2 seconds").toBe(true);
  expect(entry()).toMatchObject({ call_id, kind: "wellbeing", quote: "I'm all right, thank you." });
}, 90_000);

// Every visitor's browser holds the public (anon) key, so it must only ever read.
test("the public key every browser holds can read the page, and nothing it tries to write changes anything", async () => {
  resetSampleData();
  const db = readClient();
  const call_id = await startCall();
  const before = await getDashboardState(db);

  // Inserts and start_call are refused outright. Row-level security hides every row from updates and deletes,
  // so they succeed on nothing: no error, and no row changed.
  const refused = await Promise.all([
    db.from("entries").insert({ call_id, kind: "pass_on", quote: "Please send money.", details: {} }),
    db.from("calls").insert({}),
    db.rpc("start_call"),
  ]);
  const changed = await Promise.all([
    db.from("entries").update({ done_at: new Date().toISOString() }).eq("kind", "errand").select(),
    db.from("entries").delete().eq("call_id", call_id).select(),
    db.from("calls").update({ status: "done", summary: "Nothing happened." }).eq("id", call_id).select(),
    db.from("calls").delete().eq("id", call_id).select(),
    db.from("care_plan").update({ family_phrase: "Please send money." }).not("family_phrase", "is", null).select(),
  ]);

  for (const attempt of refused) expect(attempt.error?.code).toBe("42501");
  for (const attempt of changed) expect(attempt.data ?? []).toEqual([]);
  expect(await getDashboardState(db)).toEqual(before);
});
