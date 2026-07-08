import { describe, expect, it } from "vitest";
import {
  PROGRAM_TEMPLATE_EXPORT_VERSION,
  createProgramTemplateExportPayload,
  mergeProgramTemplates,
  parseProgramTemplateExportPayload,
} from "../src/domain/program-template-export";

describe("program template export/import", () => {
  it("exports only reusable template data in a dedicated versioned payload", () => {
    const payload = createProgramTemplateExportPayload(
      [
        {
          id: "template-1",
          name: "Phase 1",
          durationWeeks: 5,
          weekdaySlots: [],
          importedAt: 100,
          updatedAt: 200,
          copiedFromTemplateId: "",
        },
      ],
      "2026-07-07T10:00:00.000Z",
    );

    expect(payload).toEqual({
      version: PROGRAM_TEMPLATE_EXPORT_VERSION,
      exportedAt: "2026-07-07T10:00:00.000Z",
      phaseTemplates: [
        {
          id: "template-1",
          name: "Phase 1",
          durationWeeks: 5,
          weekdaySlots: [],
          importedAt: 100,
          updatedAt: 200,
          copiedFromTemplateId: "",
        },
      ],
    });
    expect(Object.keys(payload)).toEqual(["version", "exportedAt", "phaseTemplates"]);
  });

  it("normalizes imported templates with missing optional fields", () => {
    const [template] = parseProgramTemplateExportPayload({
      phaseTemplates: [
        {
          name: "Hypertrophy block",
          durationWeeks: "6",
          weekdaySlots: [
            {
              weekday: "Monday",
              blocks: [
                {
                  exercises: [
                    {
                      name: "Back squat",
                      reps: "5",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(template.id).toEqual(expect.any(String));
    expect(template).toMatchObject({
      name: "Hypertrophy block",
      durationWeeks: 6,
      importedAt: expect.any(Number),
      updatedAt: expect.any(Number),
      copiedFromTemplateId: "",
    });
    expect(template.weekdaySlots).toHaveLength(1);
    expect(template.weekdaySlots[0]).toMatchObject({
      id: expect.any(String),
      weekday: 1,
      title: "Strength session",
      notes: "",
      blocks: [
        {
          label: "",
          durationMin: null,
          durationMax: null,
          restSec: null,
          restMaxSec: null,
          sets: "",
          exercises: [
            {
              code: "",
              name: "Back squat",
              reps: "5",
              notes: "",
              weight: null,
            },
          ],
        },
      ],
    });
  });

  it("accepts files with missing optional top-level fields", () => {
    expect(
      parseProgramTemplateExportPayload({
        phaseTemplates: [
          {
            name: "Speed cycle",
            durationWeeks: 4,
            weekdaySlots: [],
          },
        ],
      }),
    ).toHaveLength(1);
  });

  it("supports single-template sharing files using the same payload contract", () => {
    const payload = createProgramTemplateExportPayload(
      [
        {
          id: "shared-template",
          name: "Shared phase",
          durationWeeks: 4,
          weekdaySlots: [],
          importedAt: 10,
          updatedAt: 20,
          copiedFromTemplateId: "",
        },
      ],
      "2026-07-07T11:00:00.000Z",
    );

    expect(payload.phaseTemplates).toHaveLength(1);
    expect(parseProgramTemplateExportPayload(payload)).toEqual(payload.phaseTemplates);
  });

  it("merges imported templates by id without dropping unrelated local templates", () => {
    expect(
      mergeProgramTemplates(
        [
          {
            id: "keep",
            name: "Keep me",
            durationWeeks: 3,
            weekdaySlots: [],
            importedAt: 1,
            updatedAt: 1,
            copiedFromTemplateId: "",
          },
          {
            id: "replace",
            name: "Old name",
            durationWeeks: 4,
            weekdaySlots: [],
            importedAt: 2,
            updatedAt: 2,
            copiedFromTemplateId: "",
          },
        ],
        [
          {
            id: "replace",
            name: "New name",
            durationWeeks: 5,
            weekdaySlots: [],
            importedAt: 3,
            updatedAt: 4,
            copiedFromTemplateId: "",
          },
        ],
      ),
    ).toEqual([
      {
        id: "replace",
        name: "New name",
        durationWeeks: 5,
        weekdaySlots: [],
        importedAt: 3,
        updatedAt: 4,
        copiedFromTemplateId: "",
      },
      {
        id: "keep",
        name: "Keep me",
        durationWeeks: 3,
        weekdaySlots: [],
        importedAt: 1,
        updatedAt: 1,
        copiedFromTemplateId: "",
      },
    ]);
  });
});
