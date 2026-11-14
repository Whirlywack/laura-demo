import { expect, test } from "vitest";
import { getDashboardState } from "../lib/dashboard";
import { readClient } from "../lib/supabase";
import { resetSampleData } from "./helpers";

test("the sample data puts the Care plan on the dashboard, with no Call yet", async () => {
  resetSampleData();

  const state = await getDashboardState(readClient());

  expect(state.callStatus).toBe("not called yet");
  expect(state.carePlan).toEqual({
    medications: [
      { name: "Concor", strength: "5 mg, one tablet", timeOfDay: "morning" },
      { name: "Sanoral HCT", strength: "40/10/12.5 mg, one tablet", timeOfDay: "morning" },
      { name: "Eliquis", strength: "2.5 mg, one tablet", timeOfDay: "morning" },
    ],
    watchItems: ["blood pressure", "left leg swelling"],
    familyPhrase: "Paul says the blue teapot is still his favourite.",
  });
});
