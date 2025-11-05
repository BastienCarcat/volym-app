import { InsightStatus } from "./types";
import type { CriterionEvaluator } from "./criteria-system";

/**
 * Data needed to evaluate volume criteria
 */
export interface VolumeCriteriaData {
  setsPerWeek: number;
  ranges: {
    mev: number;
    mav_min: number;
    mav_max: number;
    mrv: number;
  };
}

/**
 * CRITERION 1: Base Volume
 * Evaluates if volume is within optimal ranges (MEV, MAV, MRV)
 */
export const evaluateBaseVolume: CriterionEvaluator<VolumeCriteriaData> = (
  data
) => {
  const { setsPerWeek, ranges } = data;

  if (setsPerWeek === 0) {
    // No recommendation because we already have the same in frequency if the muscle is not trained
    return {
      criterionName: "baseVolume",
      score: 0,
      status: InsightStatus.Critical,
      metadata: { volumeStatus: "below_mev" },
    };
  }

  // Below MEV
  if (setsPerWeek < ranges.mev) {
    return {
      criterionName: "baseVolume",
      score: (setsPerWeek / ranges.mev) * 50,
      status: InsightStatus.Critical,
      recommendation: `Add ${ranges.mev - setsPerWeek} more sets to reach minimum effective volume.`,
      metadata: { volumeStatus: "below_mev" },
    };
  }

  // Between MEV and MAV min
  if (setsPerWeek < ranges.mav_min) {
    return {
      criterionName: "baseVolume",
      score:
        50 + ((setsPerWeek - ranges.mev) / (ranges.mav_min - ranges.mev)) * 20,
      status: InsightStatus.Warning,
      recommendation: `Add ${ranges.mav_min - setsPerWeek} more sets to reach optimal volume range.`,
      metadata: { volumeStatus: "mev_to_mav" },
    };
  }

  // Optimal range (MAV min to MAV max)
  if (setsPerWeek <= ranges.mav_max) {
    return {
      criterionName: "baseVolume",
      score:
        70 +
        ((setsPerWeek - ranges.mav_min) / (ranges.mav_max - ranges.mav_min)) *
          30,
      status: InsightStatus.Excellent,
      metadata: { volumeStatus: "optimal" },
    };
  }

  // Approaching MRV
  if (setsPerWeek <= ranges.mrv) {
    return {
      criterionName: "baseVolume",
      score:
        100 -
        ((setsPerWeek - ranges.mav_max) / (ranges.mrv - ranges.mav_max)) * 15,
      status: InsightStatus.Good,
      recommendation:
        "Volume is high. Monitor recovery and consider a deload week soon.",
      metadata: { volumeStatus: "approaching_mrv" },
    };
  }

  // Exceeding MRV
  return {
    criterionName: "baseVolume",
    score: Math.max(0, 85 - ((setsPerWeek - ranges.mrv) / 5) * 20),
    status: InsightStatus.Warning,
    recommendation:
      "Volume exceeds maximum recoverable volume. Reduce sets to avoid overtraining.",
    metadata: { volumeStatus: "exceeding_mrv" },
  };
};
