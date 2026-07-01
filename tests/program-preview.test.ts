import { describe, expect, it } from "vitest";

import {
  buildProgramPreview,
  readProgramBasics,
  readProgramTrainingDays,
  updateProgramBasics,
  updateProgramTrainingDays,
} from "../src/domain/program-preview";

const sampleProgram = [
  "PHASE,Phase 1,5",
  "SLOT,Tuesday,Strength A,Main lower-body day",
  "BLOCK,A,15-20 mins,90-120s,3-4",
  "EXERCISE,A1,Back squat,2x8-10,Heavy,100",
  "EXERCISE,A2,Barbell row,8-10,Control the eccentric,",
].join("\n");

describe("program import preview", () => {
  it("builds a human-readable program preview from import rows", () => {
    const result = buildProgramPreview(sampleProgram);

    expect(result.error).toBe("");
    expect(result.model).toMatchObject({
      name: "Phase 1",
      durationWeeks: "5",
      days: [
        {
          weekday: "Tuesday",
          title: "Strength A",
          notes: "Main lower-body day",
          blocks: [
            {
              label: "A",
              duration: "15-20 mins",
              rest: "90-120s",
              sets: "3-4",
              exercises: [
                { code: "A1", name: "Back squat", reps: "2x8-10", notes: "Heavy", weight: "100" },
                { code: "A2", name: "Barbell row", reps: "8-10", notes: "Control the eccentric", weight: "" },
              ],
            },
          ],
        },
      ],
    });
  });

  it("uses the name override in preview without changing import text", () => {
    const result = buildProgramPreview(sampleProgram, "Winter strength");

    expect(result.model?.name).toBe("Winter strength");
  });

  it("reads program basics from import text", () => {
    expect(readProgramBasics(sampleProgram)).toEqual({ name: "Phase 1", durationWeeks: "5" });
    expect(readProgramBasics(sampleProgram, "Winter strength")).toEqual({
      name: "Winter strength",
      durationWeeks: "5",
    });
  });

  it("updates the PHASE row from program basics fields", () => {
    expect(updateProgramBasics(sampleProgram, { name: "Winter strength", durationWeeks: "6" }).split("\n")[0]).toBe(
      "PHASE,Winter strength,6",
    );
    expect(updateProgramBasics("SLOT,Tuesday,Strength A,", { name: "New program", durationWeeks: "4" })).toBe(
      "PHASE,New program,4\nSLOT,Tuesday,Strength A,",
    );
  });

  it("reads training days from SLOT rows", () => {
    expect(readProgramTrainingDays(sampleProgram)).toEqual([
      { weekday: "Tuesday", title: "Strength A", notes: "Main lower-body day" },
    ]);
  });

  it("updates training day rows while preserving their block and exercise rows", () => {
    const updated = updateProgramTrainingDays(sampleProgram, [
      { weekday: "Wednesday", title: "Strength A revised", notes: "Lower focus" },
    ]);

    expect(updated).toContain("SLOT,Wednesday,Strength A revised,Lower focus");
    expect(updated).toContain("BLOCK,A,15-20 mins,90-120s,3-4");
    expect(updated).toContain("EXERCISE,A1,Back squat,2x8-10,Heavy,100");
  });

  it("adds and removes full training day segments", () => {
    const twoDayProgram = [
      sampleProgram,
      "SLOT,Friday,Strength B,Upper day",
      "BLOCK,A,12 mins,60s,3",
      "EXERCISE,A1,Front squat,2x10,,80",
    ].join("\n");

    expect(updateProgramTrainingDays(sampleProgram, [
      { weekday: "Tuesday", title: "Strength A", notes: "Main lower-body day" },
      { weekday: "Friday", title: "Strength B", notes: "Upper day" },
    ])).toContain("SLOT,Friday,Strength B,Upper day");
    const removed = updateProgramTrainingDays(twoDayProgram, [
      { weekday: "Tuesday", title: "Strength A", notes: "Main lower-body day" },
    ]);
    expect(removed).not.toContain("Strength B");
    expect(removed).not.toContain("Front squat");
  });

  it("returns friendly validation messages for malformed structure", () => {
    expect(buildProgramPreview("BLOCK,A,15 mins,60s,3").error).toBe(
      "Line 1: add a training day before adding blocks.",
    );
    expect(buildProgramPreview("PHASE,Phase 1,5\nEXERCISE,A1,Squat,10").error).toBe(
      "Line 2: add a block before adding exercises.",
    );
  });
});
