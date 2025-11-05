import { InsightStatus } from "./types";
import type { CriterionEvaluator } from "./criteria-system";

/**
 * Data needed to evaluate frequency criteria
 */
export interface FrequencyCriteriaData {
  frequency: number; // Times per week the muscle is trained
  dayIndices: number[]; // 0=Monday, 6=Sunday
  optimal: {
    min: number;
    optimal: number;
    max: number;
  };
}

/**
 * CRITERION 1: Base Frequency
 * Evaluates if training frequency is optimal for muscle growth
 */
export const evaluateBaseFrequency: CriterionEvaluator<
  FrequencyCriteriaData
> = (data) => {
  const { frequency, optimal } = data;

  if (frequency === 0) {
    return {
      criterionName: "baseFrequency",
      score: 0,
      status: InsightStatus.Critical,
      recommendation: "This muscle group is not trained this week.",
    };
  }

  // Below minimum frequency
  if (frequency < optimal.min) {
    const score = 55 + (frequency / optimal.min) * 15;
    return {
      criterionName: "baseFrequency",
      score,
      status: InsightStatus.Warning,
      recommendation: `Train this muscle ${Math.ceil(optimal.min - frequency)}x more per week for optimal results.`,
      metadata: { frequency, optimal: optimal.min },
    };
  }

  // At optimal frequency
  if (frequency === Math.floor(optimal.optimal)) {
    return {
      criterionName: "baseFrequency",
      score: 100,
      status: InsightStatus.Excellent,
      metadata: { frequency, optimal: optimal.optimal },
    };
  }

  // Within acceptable range
  if (frequency <= optimal.max) {
    const deviation = Math.abs(frequency - optimal.optimal);
    const score = 100 - deviation * 10;
    return {
      criterionName: "baseFrequency",
      score,
      status: score >= 90 ? InsightStatus.Excellent : InsightStatus.Good,
      metadata: { frequency, optimal: optimal.optimal },
    };
  }

  // Exceeding maximum frequency
  const score = Math.max(50, 100 - (frequency - optimal.max) * 20);
  return {
    criterionName: "baseFrequency",
    score,
    status: InsightStatus.Warning,
    recommendation:
      "Training frequency is very high. Ensure adequate recovery between sessions.",
    metadata: { frequency, optimal: optimal.max },
  };
};

/**
 * CRITERION 2: Frequency Distribution (Example of future criterion)
 * Evaluates if training sessions are evenly distributed throughout the week
 * This is an example of how easy it is to add new criteria
 */
export const evaluateFrequencyDistribution: CriterionEvaluator<
  FrequencyCriteriaData
> = (data) => {
  const { dayIndices } = data;

  if (dayIndices.length <= 1) {
    return {
      criterionName: "frequencyDistribution",
      score: 100,
      status: InsightStatus.Excellent,
    };
  }

  // Calculate standard deviation of gaps between training days
  const sortedDays = [...dayIndices].sort((a, b) => a - b);
  const gaps: number[] = [];

  for (let i = 0; i < sortedDays.length - 1; i++) {
    gaps.push(sortedDays[i + 1] - sortedDays[i]);
  }
  // Add wrap-around gap
  gaps.push(7 - sortedDays[sortedDays.length - 1] + sortedDays[0]);

  const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  const variance =
    gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
  const stdDev = Math.sqrt(variance);

  // Lower standard deviation = more evenly distributed
  // Perfect distribution has stdDev = 0
  // We consider stdDev > 1.5 as poor distribution
  let score: number;
  let status: InsightStatus;
  let recommendation: string | undefined;

  if (stdDev <= 0.5) {
    score = 100;
    status = InsightStatus.Excellent;
  } else if (stdDev <= 1.0) {
    score = 85;
    status = InsightStatus.Good;
  } else if (stdDev <= 1.5) {
    score = 70;
    status = InsightStatus.Good;
  } else {
    score = 60;
    status = InsightStatus.Warning;
    recommendation =
      "Training sessions are unevenly distributed. Consider spacing them more evenly throughout the week.";
  }

  return {
    criterionName: "frequencyDistribution",
    score,
    status,
    recommendation,
    metadata: { standardDeviation: stdDev, averageGap: avgGap },
  };
};
