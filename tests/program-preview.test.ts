import { describe, expect, it } from "vitest";

import {
  buildProgramPreview,
  buildCopiedProgramName,
  buildProgramImportHints,
  buildProgramPreviewSummary,
  buildProgramPreviewSummaryFromText,
  buildProgramTemplateSummary,
  buildStarterProgramText,
  buildTemplateRecencyLabel,
  filterPhaseTemplatesForDisplay,
  readProgramBasics,
  readProgramDayBlocks,
  readProgramDayExercises,
  readProgramTrainingDays,
  sortPhaseTemplatesForDisplay,
  updateProgramBasics,
  updateProgramDayBlocks,
  updateProgramDayExercises,
  updateProgramTrainingDays,
  validateProgramBasics,
  validateProgramTrainingDay,
} from "../src/domain/program-preview";

const sampleProgram = [
  "PROGRAM,Phase 1,5",
  "TRAINING,Tuesday,Strength A,Main lower-body day",
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

    expect(starterProgram).toContain("PROGRAM,Starter strength phase,4");
    expect(starterProgram).toContain("TRAINING,Tuesday,Strength A,Lower focus and main lift");
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

  it("summarizes saved templates with counts and the most useful session labels", () => {
    expect(
      buildProgramTemplateSummary({
        durationWeeks: 5,
        weekdaySlots: [
          { weekday: 2, title: "Strength A", notes: "Main lower-body day", blocks: [{ exercises: [{}, {}] }, { exercises: [{}] }] },
          { weekday: 5, title: "Strength B", notes: "Upper/lower mixed", blocks: [{ exercises: [{}] }] },
          { weekday: 7, title: "Optional", blocks: [] },
        ],
      }),
    ).toEqual({
      summary: "5 weeks • 3 training days • 3 blocks • 4 exercises",
      detail: "Tuesday: Strength A (Main lower-body day) • Friday: Strength B (Upper/lower mixed) • +1 more",
    });
  });

  it("sorts saved templates by recent edits before older imports", () => {
    expect(
      sortPhaseTemplatesForDisplay([
        { id: "older", name: "Older", importedAt: 100, updatedAt: 100 },
        { id: "edited", name: "Edited", importedAt: 100, updatedAt: 200 },
        { id: "same", name: "Alpha", importedAt: 100, updatedAt: 100 },
        { id: "same-b", name: "Beta", importedAt: 150, updatedAt: 100 },
      ]).map((template) => template.id),
    ).toEqual(["edited", "same-b", "same", "older"]);
  });

  it("describes template recency with a readable age label", () => {
    expect(buildTemplateRecencyLabel({ updatedAt: 1_700_000_000_000 }, 1_700_000_000_000)).toBe("Edited today");
    expect(buildTemplateRecencyLabel({ updatedAt: 1_699_913_600_000 }, 1_700_000_000_000)).toBe("Edited yesterday");
    expect(buildTemplateRecencyLabel({ updatedAt: 1_699_740_800_000 }, 1_700_000_000_000)).toBe("Edited 3 days ago");
  });

  it("filters saved templates by name and structured content", () => {
    const templates = [
      {
        id: "alpha",
        name: "Alpha phase",
        durationWeeks: 5,
        weekdaySlots: [
          {
            weekday: 2,
            title: "Strength A",
            notes: "Main lower-body day",
            blocks: [{ label: "A", duration: "", rest: "", sets: "", exercises: [{ code: "A1", name: "Back squat" }] }],
          },
        ],
      },
      {
        id: "beta",
        name: "Recovery",
        durationWeeks: 3,
        weekdaySlots: [
          {
            weekday: 5,
            title: "Recovery day",
            notes: "Mobility and light work",
            blocks: [{ label: "B", duration: "", rest: "", sets: "", exercises: [{ code: "B1", name: "Bike" }] }],
          },
        ],
      },
    ];

    expect(filterPhaseTemplatesForDisplay(templates, "alpha")).toHaveLength(1);
    expect(filterPhaseTemplatesForDisplay(templates, "back squat")).toHaveLength(1);
    expect(filterPhaseTemplatesForDisplay(templates, "mobility light")).toHaveLength(1);
    expect(filterPhaseTemplatesForDisplay(templates, "deadlift")).toHaveLength(0);
  });

  it("creates a friendly duplicate name for copied templates", () => {
    expect(buildCopiedProgramName("Phase 1")).toBe("Copy of Phase 1");
    expect(buildCopiedProgramName("Copy of Phase 1")).toBe("Copy of Phase 1");
    expect(buildCopiedProgramName("")).toBe("Copy of Strength phase");
  });

  it("builds row-specific import hints for malformed program text", () => {
    expect(buildProgramImportHints("Line 1: PROGRAM row needs a program name.")).toEqual([
      "Add text after `PROGRAM,` for the program name.",
    ]);
    expect(buildProgramImportHints("Line 1: PROGRAM row needs a duration in weeks.")).toEqual([
      "Add a positive whole-number week count like `PROGRAM,Phase 1,5`.",
    ]);
    expect(buildProgramImportHints("Line 1: PROGRAM row duration must be a positive whole number.")).toEqual([
      "Use a positive whole number for weeks, like `PROGRAM,Phase 1,5`.",
    ]);
    expect(buildProgramImportHints("Add a PROGRAM row and at least one training day to preview this program.")).toEqual([
      "Include a `PROGRAM` row and at least one `TRAINING` row.",
      "A minimal example is `PROGRAM,Phase 1,5` then `TRAINING,Tuesday,Strength A,Notes`.",
    ]);
    expect(buildProgramImportHints("Line 2: add a training day before adding blocks.")).toEqual([
      "Add a `TRAINING` row before any `BLOCK` rows.",
    ]);
    expect(buildProgramImportHints("Line 3: add a block before adding exercises.")).toEqual([
      "Add a `BLOCK` row before any `EXERCISE` rows.",
    ]);
    expect(buildProgramImportHints("Line 3: BLOCK row at line 3 must include at least one EXERCISE row.")).toEqual([
      "Add at least one `EXERCISE` row before starting the next `BLOCK` or `TRAINING`.",
    ]);
    expect(buildProgramImportHints("Empty block detected in Tuesday Strength A / A. Add at least one exercise before saving this program.")).toEqual([
      "Add at least one `EXERCISE` row to every `BLOCK` before saving.",
      "Delete the `BLOCK` row if the block should not exist.",
    ]);
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

  it("updates the PROGRAM row from program basics fields", () => {
    expect(updateProgramBasics(sampleProgram, { name: "Winter strength", durationWeeks: "6" }).split("\n")[0]).toBe(
      "PROGRAM,Winter strength,6",
    );
    expect(updateProgramBasics("TRAINING,Tuesday,Strength A,", { name: "New program", durationWeeks: "4" })).toBe(
      "PROGRAM,New program,4\nTRAINING,Tuesday,Strength A,",
    );
  });

  it("reads training days from TRAINING rows", () => {
    expect(readProgramTrainingDays(sampleProgram)).toEqual([
      { weekday: "Tuesday", title: "Strength A", notes: "Main lower-body day" },
    ]);
  });

  it("normalizes blank TRAINING titles to Training # labels by order", () => {
    const text = [
      "PROGRAM,Phase 1,5",
      "TRAINING,Tuesday,,Main lower-body day",
      "BLOCK,A,15-20 mins,90-120s,3-4",
      "EXERCISE,A1,Back squat,2x8-10,Heavy,100",
      "TRAINING,Fri,,Upper day",
      "BLOCK,A,12 mins,60s,3",
      "EXERCISE,A1,Front squat,2x10,,80",
    ].join("\n");

    expect(readProgramTrainingDays(text)).toEqual([
      { weekday: "Tuesday", title: "Training #1", notes: "Main lower-body day" },
      { weekday: "Friday", title: "Training #2", notes: "Upper day" },
    ]);
    expect(buildProgramPreview(text).model?.days.map((day) => day.title)).toEqual(["Training #1", "Training #2"]);
  });

  it("updates training day rows while preserving their block and exercise rows", () => {
    const updated = updateProgramTrainingDays(sampleProgram, [
      { weekday: "Wednesday", title: "Strength A revised", notes: "Lower focus" },
    ]);

    expect(updated).toContain("TRAINING,Wednesday,Strength A revised,Lower focus");
    expect(updated).toContain("BLOCK,A,15-20 mins,90-120s,3-4");
    expect(updated).toContain("EXERCISE,A1,Back squat,2x8-10,Heavy,100");
  });

  it("adds and removes full training day segments", () => {
    const twoDayProgram = [
      sampleProgram,
      "TRAINING,Friday,Strength B,Upper day",
      "BLOCK,A,12 mins,60s,3",
      "EXERCISE,A1,Front squat,2x10,,80",
    ].join("\n");

    expect(updateProgramTrainingDays(sampleProgram, [
      { weekday: "Tuesday", title: "Strength A", notes: "Main lower-body day" },
      { weekday: "Friday", title: "Strength B", notes: "Upper day" },
    ])).toContain("TRAINING,Friday,Strength B,Upper day");
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
    expect(buildProgramPreview("PROGRAM,,5\nTRAINING,Tuesday,Strength A,Main lower-body day").error).toBe(
      "Line 1: PROGRAM row needs a program name.",
    );
    expect(buildProgramPreview("PROGRAM,Phase 1,\nTRAINING,Tuesday,Strength A,Main lower-body day").error).toBe(
      "Line 1: PROGRAM row needs a duration in weeks.",
    );
    expect(buildProgramPreview("PROGRAM,Phase 1,abc\nTRAINING,Tuesday,Strength A,Main lower-body day").error).toBe(
      "Line 1: PROGRAM row duration must be a positive whole number.",
    );
    expect(buildProgramPreview("PROGRAM,Phase 1,0\nTRAINING,Tuesday,Strength A,Main lower-body day").error).toBe(
      "Line 1: PROGRAM row duration must be a positive whole number.",
    );
    expect(buildProgramPreview("BLOCK,A,15 mins,60s,3").error).toBe(
      "Line 1: add a training day before adding blocks.",
    );
    expect(buildProgramPreview("PHASE,Phase 1,5\nTRAINING,Tuesday,Strength A,Main lower-body day").error).toBe(
      'Line 1: "PHASE" is not a supported row type.',
    );
    expect(buildProgramPreview("PROGRAM,Phase 1,5\nSLOT,Tuesday,Strength A,Main lower-body day").error).toBe(
      'Line 2: "SLOT" is not a supported row type.',
    );
    expect(buildProgramPreview("PROGRAM,Phase 1,5\nTRAINING,,Strength A,Main lower-body day").error).toBe(
      "Line 2: TRAINING row needs a weekday.",
    );
    expect(buildProgramPreview("PROGRAM,Phase 1,5\nTRAINING,Funday,Strength A,Main lower-body day").error).toBe(
      "Line 2: TRAINING row weekday must be a real day like Monday, Mon, Tuesday, Tue, Friday, or Sun.",
    );
    expect(buildProgramPreview("PROGRAM,Phase 1,5\nEXERCISE,A1,Squat,10").error).toBe(
      "Line 2: add a block before adding exercises.",
    );
    expect(
      buildProgramPreview([
        "PROGRAM,Phase 1,5",
        "TRAINING,Tuesday,Strength A,Main lower-body day",
        "BLOCK,A,15 mins,60s,3",
        "TRAINING,Friday,Strength B,Upper day",
      ].join("\n")).error,
    ).toBe("Empty block detected in Tuesday Strength A / A. Add at least one exercise before saving this program.");
  });

  it("validates PROGRAM basics as a required name and positive whole-number duration", () => {
    expect(validateProgramBasics({ name: "", durationWeeks: "5" })).toEqual({
      nameError: "PROGRAM row needs a program name.",
      durationWeeksError: "",
    });
    expect(validateProgramBasics({ name: "Phase 1", durationWeeks: "" })).toEqual({
      nameError: "",
      durationWeeksError: "PROGRAM row needs a duration in weeks.",
    });
    expect(validateProgramBasics({ name: "Phase 1", durationWeeks: "-2" })).toEqual({
      nameError: "",
      durationWeeksError: "PROGRAM row duration must be a positive whole number.",
    });
    expect(validateProgramBasics({ name: "Phase 1", durationWeeks: "5" })).toEqual({
      nameError: "",
      durationWeeksError: "",
    });
  });

  it("validates TRAINING weekdays and accepts abbreviations", () => {
    expect(validateProgramTrainingDay({ weekday: "", title: "", notes: "" })).toEqual({
      weekdayError: "TRAINING row needs a weekday.",
    });
    expect(validateProgramTrainingDay({ weekday: "Funday", title: "", notes: "" })).toEqual({
      weekdayError: "TRAINING row weekday must be a real day like Monday, Mon, Tuesday, Tue, Friday, or Sun.",
    });
    expect(validateProgramTrainingDay({ weekday: "Fri", title: "", notes: "" })).toEqual({
      weekdayError: "",
    });
  });
});
