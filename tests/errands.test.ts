import { beforeEach, expect, test } from "vitest";
import { getDashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";
import { clearCalls, resetSampleData, sendTool, startCall, tickErrand } from "./helpers";

// Every test starts with the Care plan and no Errands, so the ones listed are only those it makes.
beforeEach(async () => {
  resetSampleData();
  await clearCalls();
});

const errand = { id: expect.any(String), at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/) };

test("what she is running out of becomes an open Errand and a card on the live feed", async () => {
  const call_id = await startCall();

  const response = await sendTool("add_errand", { call_id, quote: "I'm nearly out of tea. Two bags left.", item: "Tea" });

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
  const state = await getDashboardState(readClient());
  expect(state.errands).toEqual([{ item: "Tea", quote: "I'm nearly out of tea. Two bags left.", done: false, ...errand }]);
  expect(state.feed).toMatchObject([{ title: "Errand added · Tea", quote: "I'm nearly out of tea. Two bags left." }]);
});

test("Errands from earlier Calls stay on the list beneath Today's, newest first", async () => {
  await sendTool("add_errand", { call_id: await startCall(), quote: "The little round ones.", item: "Hearing-aid batteries" });
  const call_id = await startCall();

  await sendTool("add_errand", { call_id, quote: "And bread, a small loaf.", item: "Bread" });

  expect((await getDashboardState(readClient())).errands).toEqual([
    { item: "Bread", quote: "And bread, a small loaf.", done: false, ...errand },
    { item: "Hearing-aid batteries", quote: "The little round ones.", done: false, ...errand },
  ]);
});

test("each item she names is its own Errand, even when she names it twice", async () => {
  const call_id = await startCall();

  await sendTool("add_errand", { call_id, quote: "Tea, I need tea.", item: "Tea" });
  await sendTool("add_errand", { call_id, quote: "Did I say tea? Tea.", item: "Tea" });

  expect((await getDashboardState(readClient())).errands).toMatchObject([
    { item: "Tea", quote: "Did I say tea? Tea." },
    { item: "Tea", quote: "Tea, I need tea." },
  ]);
});

test("a ticked Errand stays on the list as done, and the others stay open", async () => {
  const call_id = await startCall();
  await sendTool("add_errand", { call_id, quote: "I'm nearly out of tea.", item: "Tea" });
  await sendTool("add_errand", { call_id, quote: "And bread.", item: "Bread" });
  const [bread] = (await getDashboardState(readClient())).errands;

  const response = await tickErrand(bread.id);

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: true });
  expect((await getDashboardState(readClient())).errands).toMatchObject([
    { item: "Bread", done: true },
    { item: "Tea", done: false },
  ]);
});

test("a ticked Errand is still done after the next Call starts", async () => {
  await sendTool("add_errand", { call_id: await startCall(), quote: "I'm nearly out of tea.", item: "Tea" });
  const [tea] = (await getDashboardState(readClient())).errands;
  await tickErrand(tea.id);

  await startCall();

  expect((await getDashboardState(readClient())).errands).toMatchObject([{ item: "Tea", done: true }]);
});

test.each([
  ["a page on another site", { "sec-fetch-site": "cross-site" }],
  ["a page with another origin", { origin: "https://elsewhere.example" }],
])("an Errand ticked from %s is refused and stays open", async (_, headers) => {
  const call_id = await startCall();
  await sendTool("add_errand", { call_id, quote: "I'm nearly out of tea.", item: "Tea" });
  const [tea] = (await getDashboardState(readClient())).errands;

  const response = await tickErrand(tea.id, headers);

  expect(response.status).toBe(403);
  expect((await getDashboardState(readClient())).errands).toMatchObject([{ item: "Tea", done: false }]);
});

test.each([
  ["an Errand that does not exist", "6f1c2a8e-3b4d-4e5f-8a9b-0c1d2e3f4a5b"],
  ["something that is not an id", "tea"],
])("ticking %s is not found", async (_, id) => {
  const response = await tickErrand(id);

  expect(response.status).toBe(404);
});

test("only an Errand can be ticked: other Entries are not found", async () => {
  const call_id = await startCall();
  await sendTool("log_remark", { call_id, quote: "Less swollen today." });
  const [remark] = (await getDashboardState(readClient())).feed;

  const response = await tickErrand(remark.id);

  expect(response.status).toBe(404);
});

test.each([
  ["no item", { quote: "I need something." }],
  ["an empty item", { quote: "I need something.", item: " " }],
  ["no quote", { item: "Tea" }],
])("an Errand with %s is refused and writes nothing", async (_, fields) => {
  const call_id = await startCall();

  const response = await sendTool("add_errand", { call_id, ...fields });

  expect(response.status).toBe(400);
  expect(await getDashboardState(readClient())).toMatchObject({ errands: [], feed: [] });
});
