export interface PlannedExerciseSnapshot {
  setsBase: number;
  repsBase: number | null;
  weight: number | null;
}

export interface ActualExerciseSnapshot {
  totalSets: number;
  maxReps: number;
  maxWeight: number | null;
}

export interface MetricStatus {
  label: string;
  explanation: string;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function evaluatePlanStatus(planned: PlannedExerciseSnapshot, actual: ActualExerciseSnapshot): MetricStatus {
  const plannedReps = planned.repsBase ?? 0;
  const setsMeetPlan = !planned.setsBase || actual.totalSets >= planned.setsBase;
  const repsMeetPlan = !plannedReps || actual.maxReps >= plannedReps;
  const weightMeetPlan = !isNumber(planned.weight) || (isNumber(actual.maxWeight) && actual.maxWeight >= planned.weight);
  const weightExceededPlan = isNumber(planned.weight) && isNumber(actual.maxWeight) && actual.maxWeight > planned.weight;

  if (
    setsMeetPlan &&
    repsMeetPlan &&
    weightMeetPlan &&
    actual.totalSets === planned.setsBase &&
    actual.maxReps === plannedReps &&
    (!isNumber(planned.weight) || actual.maxWeight === planned.weight)
  ) {
    return { label: "Matched plan", explanation: "Actual sets, reps, and top weight matched the plan." };
  }
  if (setsMeetPlan && repsMeetPlan && weightMeetPlan && (actual.totalSets > planned.setsBase || actual.maxReps > plannedReps || weightExceededPlan)) {
    return { label: "Exceeded plan", explanation: "Actual execution met or exceeded the planned prescription." };
  }
  if (!setsMeetPlan || !repsMeetPlan || !weightMeetPlan) {
    return { label: "Below plan", explanation: "Actual execution landed below the planned prescription." };
  }
  return { label: "Matched plan", explanation: "Actual execution met the minimum planned prescription." };
}
