import { execFileSync } from "node:child_process";
import { expect, test } from "vitest";
import { getDashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";

const runSampleData = () => execFileSync("node", ["scripts/sample-data.ts"], { stdio: "pipe" });

test("the sample data puts the Care plan on the dashboard, with no Call yet", async () => {
  runSampleData();

  const state = await getDashboardState(readClient());

  expect(state.callStatus).toBe("not called yet");
  expect(state.carePlan).toEqual({
    medications: [
      { name: "Metoprolol", strength: "47.5 mg, one tablet", timeOfDay: "morning" },
      { name: "Sanoral HCT", strength: "40/10/12.5 mg, one tablet", timeOfDay: "morning" },
      { name: "Eliquis", strength: "2.5 mg, one tablet", timeOfDay: "morning" },
    ],
    watchItems: ["blood pressure", "left leg swelling"],
    familyPhrase: "Paul says the blue teapot is still his favourite.",
  });
});

test("a missing environment variable is named", () => {
  const { SUPABASE_SERVICE_ROLE_KEY: _, ...withoutKey } = process.env;

  expect(() => execFileSync("node", ["scripts/sample-data.ts"], { env: withoutKey, stdio: "pipe" })).toThrow(
    "Missing environment variable SUPABASE_SERVICE_ROLE_KEY",
  );
});
