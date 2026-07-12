import { describe, expect, it } from "vitest";
import {
  buildPhaseSlotId,
  getAnchoredPhaseOccurrenceDate,
  getDateShiftDelta,
  getPhaseOccurrenceSchedule,
  normalizePhaseSlotDayShifts,
} from "../src/domain/phase-scheduling";

describe("phase scheduling", () => {
  it("keeps anchored dates for slots without shift rules", () => {
    const phaseSlotId = buildPhaseSlotId(2, 0);
    expect(getAnchoredPhaseOccurrenceDate("2026-07-06", 2, 0)).toBe("2026-07-07");
    expect(
      getPhaseOccurrenceSchedule({
        startDate: "2026-07-06",
        slotWeekday: 2,
        phaseSlotId,
        phaseWeekIndex: 2,
        slotDayShifts: [],
      }),
    ).toMatchObject({
      generatedDate: "2026-07-21",
      effectiveDate: "2026-07-21",
      dayDelta: 0,
    });
  });

  it("shifts only future occurrences of the same slot by day offset", () => {
    const phaseSlotId = buildPhaseSlotId(2, 0);
    const otherSlotId = buildPhaseSlotId(4, 1);
    const slotDayShifts = normalizePhaseSlotDayShifts([
      {
        phaseSlotId,
        fromWeekIndex: 2,
        dayDelta: 3,
        createdAt: 1,
      },
    ]);

    expect(
      getPhaseOccurrenceSchedule({
        startDate: "2026-07-06",
        slotWeekday: 2,
        phaseSlotId,
        phaseWeekIndex: 1,
        slotDayShifts,
      }).effectiveDate,
    ).toBe("2026-07-14");
    expect(
      getPhaseOccurrenceSchedule({
        startDate: "2026-07-06",
        slotWeekday: 2,
        phaseSlotId,
        phaseWeekIndex: 2,
        slotDayShifts,
      }).effectiveDate,
    ).toBe("2026-07-24");
    expect(
      getPhaseOccurrenceSchedule({
        startDate: "2026-07-06",
        slotWeekday: 4,
        phaseSlotId: otherSlotId,
        phaseWeekIndex: 2,
        slotDayShifts,
      }).effectiveDate,
    ).toBe("2026-07-23");
  });

  it("stacks later rules for the same slot", () => {
    const phaseSlotId = buildPhaseSlotId(2, 0);
    const slotDayShifts = normalizePhaseSlotDayShifts([
      {
        phaseSlotId,
        fromWeekIndex: 1,
        dayDelta: 3,
        createdAt: 1,
      },
      {
        phaseSlotId,
        fromWeekIndex: 3,
        dayDelta: -2,
        createdAt: 2,
      },
    ]);

    expect(
      getPhaseOccurrenceSchedule({
        startDate: "2026-07-06",
        slotWeekday: 2,
        phaseSlotId,
        phaseWeekIndex: 2,
        slotDayShifts,
      }),
    ).toMatchObject({
      effectiveDate: "2026-07-24",
      dayDelta: 3,
    });
    expect(
      getPhaseOccurrenceSchedule({
        startDate: "2026-07-06",
        slotWeekday: 2,
        phaseSlotId,
        phaseWeekIndex: 3,
        slotDayShifts,
      }),
    ).toMatchObject({
      effectiveDate: "2026-07-29",
      dayDelta: 1,
    });
  });

  it("accepts forward and backward day moves", () => {
    expect(getDateShiftDelta("2026-07-21", "2026-07-24")).toBe(3);
    expect(getDateShiftDelta("2026-07-21", "2026-07-18")).toBe(-3);
  });

  it("allows shifting one slot onto a day that already has another training", () => {
    const movedSlotId = buildPhaseSlotId(2, 0);
    const existingSlotId = buildPhaseSlotId(5, 1);
    const slotDayShifts = normalizePhaseSlotDayShifts([
      {
        phaseSlotId: movedSlotId,
        fromWeekIndex: 0,
        dayDelta: 3,
        createdAt: 1,
      },
    ]);

    const movedSlot = getPhaseOccurrenceSchedule({
      startDate: "2026-07-06",
      slotWeekday: 2,
      phaseSlotId: movedSlotId,
      phaseWeekIndex: 0,
      slotDayShifts,
    });
    const existingSlot = getPhaseOccurrenceSchedule({
      startDate: "2026-07-06",
      slotWeekday: 5,
      phaseSlotId: existingSlotId,
      phaseWeekIndex: 0,
      slotDayShifts,
    });

    expect(movedSlot.effectiveDate).toBe("2026-07-10");
    expect(existingSlot.effectiveDate).toBe("2026-07-10");
  });
});
