import { InsightStatus } from "./types";
import type { CriterionEvaluator } from "./criteria-system";

/**
 * Data needed to evaluate exercise balance criteria
 */
export interface ExerciseBalanceCriteriaData {
  compoundPercentage: number;
  isolationPercentage: number;
  totalExercises: number;
  ideal: {
    compound: number;
    isolation: number;
  };
}

/**
 * CRITERION 1: Compound/Isolation Ratio
 * Evaluates if the balance between compound and isolation exercises is optimal
 */
export const evaluateCompoundIsolationRatio: CriterionEvaluator<
  ExerciseBalanceCriteriaData
> = (data) => {
  const { compoundPercentage, isolationPercentage, totalExercises, ideal } =
    data;

  if (totalExercises === 0) {
    return {
      criterionName: "compoundIsolationRatio",
      score: 0,
      status: InsightStatus.Critical,
      recommendation: "No exercises found in this week.",
    };
  }

  const compoundDeviation = Math.abs(compoundPercentage - ideal.compound);
  const isolationDeviation = Math.abs(isolationPercentage - ideal.isolation);

  const totalDeviation = (compoundDeviation + isolationDeviation) / 2;

  const score = Math.max(0, 100 - totalDeviation * 2);

  let status: InsightStatus;
  let recommendation: string | undefined;

  // Determine status
  if (score >= 90) {
    status = InsightStatus.Excellent;
  } else if (score >= 70) {
    status = InsightStatus.Good;
  } else if (score >= 50) {
    status = InsightStatus.Warning;
  } else {
    status = InsightStatus.Critical;
  }

  // Generate recommendation
  if (compoundPercentage < ideal.compound - 10) {
    recommendation = `Add more compound exercises. Aim for ${ideal.compound}% compound.`;
  } else if (compoundPercentage > ideal.compound + 10) {
    recommendation = `Add more isolation exercises to target weak points. Aim for ${ideal.isolation}% isolation.`;
  }

  return {
    criterionName: "compoundIsolationRatio",
    score,
    status,
    recommendation,
    metadata: {
      compoundDeviation,
      isolationDeviation,
      totalDeviation,
    },
  };
};
