import { describe, expect, it } from "vitest";

import {
  buildProgramPreview,
  buildCopiedProgramName,
  buildProgramPreviewSummary,
  buildProgramPreviewSummaryFromText,
  buildStarterProgramText,
  readProgramBasics,
  readProgramDayBlocks,
  readProgramDayExercises,
  readProgramTrainingDays,
  updateProgramBasics,
  updateProgramDayBlocks,
  updateProgramDayExercises,
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

  it("provides a starter program example that previews cleanly", () => {
    const starterProgram = buildStarterProgramText();
    const result = buildProgramPreview(starterProgram);

    expect(starterProgram).toContain("PHASE,Starter strength phase,4");
    expect(starterProgram).toContain("SLOT,Tuesday,Strength A,Lower focus and main lift");
    expect(result.error).toBe("");
    expect(result.model?.days).toHaveLength(2);
  });

  it("summarizes program structure for the preview header", () => {
    expect(buildProgramPreviewSummary(buildProgramPreview(sampleProgram).model)).toBe("1 training day • 1 block • 2 exercises");
    expect(buildProgramPreviewSummary(buildProgramPreview(buildStarterProgramText()).model)).toBe(
      "2 training days • 3 blocks • 5 exercises",
    );
  });

  it("summarizes program structure directly from text for template cards", () => {
    expect(buildProgramPreviewSummaryFromText(sampleProgram)).toBe("1 training day • 1 block • 2 exercises");
    expect(buildProgramPreviewSummaryFromText(buildStarterProgramText())).toBe("2 training days • 3 blocks • 5 exercises");
  });

  it("creates a friendly duplicate name for copied templates", () => {
    expect(buildCopiedProgramName("Phase 1")).toBe("Copy of Phase 1");
    expect(buildCopiedProgramName("Copy of Phase 1")).toBe("Copy of Phase 1");
    expect(buildCopiedProgramName("")).toBe("Copy of Strength phase");
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

  it("reads blocks for each training day", () => {
    expect(readProgramDayBlocks(sampleProgram)).toEqual([
      {
        blocks: [
          { label: "A", duration: "15-20 mins", rest: "90-120s", sets: "3-4" },
        ],
      },
    ]);
  });

  it("updates block rows while preserving exercise rows", () => {
    const updated = updateProgramDayBlocks(sampleProgram, [
      {
        blocks: [
          { label: "Main", duration: "20 mins", rest: "120s", sets: "4" },
        ],
      },
    ]);

    expect(updated).toContain("BLOCK,Main,20 mins,120s,4");
    expect(updated).toContain("EXERCISE,A1,Back squat,2x8-10,Heavy,100");
  });

  it("adds and removes block segments within a training day", () => {
    const twoBlockProgram = [
      sampleProgram,
      "BLOCK,B,10 mins,45s,2",
      "EXERCISE,B1,Lunge,10 each leg,,",
    ].join("\n");

    expect(updateProgramDayBlocks(sampleProgram, [
      {
        blocks: [
          { label: "A", duration: "15-20 mins", rest: "90-120s", sets: "3-4" },
          { label: "B", duration: "10 mins", rest: "45s", sets: "2" },
        ],
      },
    ])).toContain("BLOCK,B,10 mins,45s,2");
    const removed = updateProgramDayBlocks(twoBlockProgram, [
      {
        blocks: [
          { label: "A", duration: "15-20 mins", rest: "90-120s", sets: "3-4" },
        ],
      },
    ]);
    expect(removed).not.toContain("BLOCK,B");
    expect(removed).not.toContain("Lunge");
  });

  it("reads exercises for each block", () => {
    expect(readProgramDayExercises(sampleProgram)).toEqual([
      {
        blocks: [
          {
            exercises: [
              { code: "A1", name: "Back squat", reps: "2x8-10", notes: "Heavy", weight: "100" },
              { code: "A2", name: "Barbell row", reps: "8-10", notes: "Control the eccentric", weight: "" },
            ],
          },
        ],
      },
    ]);
  });

  it("updates exercise rows inside a block", () => {
    const updated = updateProgramDayExercises(sampleProgram, [
      {
        blocks: [
          {
            exercises: [
              { code: "A1", name: "Front squat", reps: "3x8", notes: "Smooth", weight: "90" },
            ],
          },
        ],
      },
    ]);

    expect(updated).toContain("EXERCISE,A1,Front squat,3x8,Smooth,90");
    expect(updated).not.toContain("Back squat");
  });

  it("adds and removes exercise rows within a block", () => {
    const added = updateProgramDayExercises(sampleProgram, [
      {
        blocks: [
          {
            exercises: [
              { code: "A1", name: "Back squat", reps: "2x8-10", notes: "Heavy", weight: "100" },
              { code: "A3", name: "Split squat", reps: "10 each", notes: "", weight: "" },
            ],
          },
        ],
      },
    ]);
    expect(added).toContain("EXERCISE,A3,Split squat,10 each,,");
    const removed = updateProgramDayExercises(sampleProgram, [
      {
        blocks: [
          {
            exercises: [
              { code: "A1", name: "Back squat", reps: "2x8-10", notes: "Heavy", weight: "100" },
            ],
          },
        ],
      },
    ]);
    expect(removed).not.toContain("Barbell row");
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
