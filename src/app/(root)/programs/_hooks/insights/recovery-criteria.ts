import { InsightStatus } from "./types";
import type { CriterionEvaluator } from "./criteria-system";

/**
 * Data needed to evaluate recovery criteria
 */
export interface RecoveryCriteriaData {
  totalRestDays: number; // For evaluateTotalRestDays & evaluateTrainingRestRatio
  totalTrainingDays: number; // For evaluateTotalRestDays & evaluateTrainingRestRatio
  dayIndices?: number[]; // For evaluateConsecutiveDays (muscle-specific)
}

/**
 * CRITERION 1: Consecutive Days (Muscle-Specific)
 * Evaluates if a specific muscle has enough rest days between training sessions
 * Uses dayIndices (0=Monday, 6=Sunday) to calculate minimum rest days
 *
 * Scoring:
 * - 0 rest days (consecutive) → 50 points, Warning
 * - 1 rest day → 80 points, Good
 * - 2+ rest days → 100 points, Excellent
 */
export const evaluateConsecutiveDays: CriterionEvaluator<
  RecoveryCriteriaData
> = (data) => {
  const { dayIndices } = data;

  // Not enough data to evaluate
  if (!dayIndices || dayIndices.length === 0) {
    return {
      criterionName: "consecutiveDays",
      score: 100,
      status: InsightStatus.Excellent,
      metadata: { minRestDays: 6, hasConsecutiveDays: false },
    };
  }

  // Only one training day - 6 days of rest
  if (dayIndices.length === 1) {
    return {
      criterionName: "consecutiveDays",
      score: 100,
      status: InsightStatus.Excellent,
      metadata: { minRestDays: 6, hasConsecutiveDays: false },
    };
  }

  const analysis = calculateConsecutiveDaysAnalysis(dayIndices);

  let recommendation: string | undefined;
  if (analysis.status === InsightStatus.Warning) {
    recommendation = `This muscle is trained on consecutive days (${analysis.minRestDays} rest days). Allow at least 48h between sessions for optimal recovery.`;
  } else if (analysis.status === InsightStatus.Good) {
    recommendation = `Only ${analysis.minRestDays} rest day between sessions. Consider adding one more rest day for optimal recovery.`;
  }

  // Score based on minimum rest days
  let score: number;
  if (analysis.minRestDays >= 2) {
    score = 100;
  } else if (analysis.minRestDays === 1) {
    score = 80;
  } else {
    score = 50;
  }

  return {
    criterionName: "consecutiveDays",
    score,
    status: analysis.status,
    recommendation,
    metadata: {
      minRestDays: analysis.minRestDays,
      hasConsecutiveDays: analysis.hasConsecutiveDays,
    },
  };
};

/**
 * Helper function to analyze consecutive training days
 */
function calculateConsecutiveDaysAnalysis(dayIndices: number[]): {
  hasConsecutiveDays: boolean;
  minRestDays: number;
  status: InsightStatus;
} {
  if (dayIndices.length === 0) {
    // Muscle not trained - return neutral values (will be handled separately)
    return {
      hasConsecutiveDays: false,
      minRestDays: 6,
      status: InsightStatus.Excellent,
    };
  }

  if (dayIndices.length === 1) {
    // Only one training day - perfect recovery
    return {
      hasConsecutiveDays: false,
      minRestDays: 6,
      status: InsightStatus.Excellent,
    };
  }

  const sortedDays = [...dayIndices].sort((a, b) => a - b);
  let minRestDays = Infinity;

  // Check consecutive days within the week
  for (let i = 0; i < sortedDays.length - 1; i++) {
    const daysBetween = sortedDays[i + 1] - sortedDays[i] - 1;
    minRestDays = Math.min(minRestDays, daysBetween);
  }

  // Check wrap-around (from last day of week to first day of next week)
  // Only if we have at least 2 training days
  if (sortedDays.length >= 2) {
    // Days between Sunday (last training day) and Monday (first training day of next week)
    const wrapAround =
      7 - sortedDays[sortedDays.length - 1] + sortedDays[0] - 1;
    minRestDays = Math.min(minRestDays, wrapAround);
  }

  // If minRestDays is still Infinity, set it to a large number
  if (minRestDays === Infinity) {
    minRestDays = 7;
  }

  const hasConsecutiveDays = minRestDays === 0;

  let status: InsightStatus;
  if (minRestDays >= 2) {
    status = InsightStatus.Excellent;
  } else if (minRestDays === 1) {
    status = InsightStatus.Good;
  } else {
    status = InsightStatus.Warning;
  }

  return {
    hasConsecutiveDays,
    minRestDays,
    status,
  };
}

/**
 * CRITERION 2: Training/Rest Ratio
 * Evaluates the overall balance between training and rest
 */
export const evaluateTrainingRestRatio: CriterionEvaluator<
  RecoveryCriteriaData
> = (data) => {
  const { totalRestDays, totalTrainingDays } = data;

  const totalDays = totalRestDays + totalTrainingDays;
  const trainingPercentage = (totalTrainingDays / totalDays) * 100;

  // Ideal: 57-71% training (4-5 training days out of 7)
  let score: number;
  let status: InsightStatus;
  let recommendation: string | undefined;

  if (trainingPercentage < 40) {
    // Less than 3 training days
    score = 60;
    status = InsightStatus.Warning;
    recommendation = "Low training frequency. Consider adding more sessions.";
  } else if (trainingPercentage >= 40 && trainingPercentage < 57) {
    // 3 training days
    score = 80;
    status = InsightStatus.Good;
  } else if (trainingPercentage >= 57 && trainingPercentage <= 71) {
    // 4-5 training days (optimal)
    score = 100;
    status = InsightStatus.Excellent;
  } else if (trainingPercentage > 71 && trainingPercentage <= 85) {
    // 6 training days
    score = 85;
    status = InsightStatus.Good;
  } else {
    // 7 training days
    score = 50;
    status = InsightStatus.Warning;
    recommendation =
      "Very high training frequency. Ensure adequate recovery to prevent overtraining.";
  }

  return {
    criterionName: "trainingRestRatio",
    score,
    status,
    recommendation,
    metadata: {
      trainingPercentage,
      totalRestDays,
      totalTrainingDays,
    },
  };
};
