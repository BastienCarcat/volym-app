import type { ProgramWithFullSessions } from "../use-programs";
import type { SessionWithItems } from "@/hooks/use-sessions";
import { UserLevel, ProgramObjective } from "@/generated/prisma";

export interface BaseInsightsParams {
  program: ProgramWithFullSessions;
  activeSessionId?: string;
  activeSessionFormValues?: SessionWithItems;
  currentWeek?: number;
  userLevel?: UserLevel;
  objective?: ProgramObjective;
}

export interface VolumeRanges {
  mev: number;
  mav_min: number;
  mav_max: number;
  mrv: number;
}

export function getVolumeRanges(
  level: UserLevel,
  objective: ProgramObjective
): VolumeRanges {
  const baseRanges: Record<UserLevel, VolumeRanges> = {
    [UserLevel.Beginner]: { mev: 4, mav_min: 8, mav_max: 12, mrv: 15 },
    [UserLevel.Intermediate]: { mev: 8, mav_min: 12, mav_max: 18, mrv: 22 },
    [UserLevel.Advanced]: { mev: 12, mav_min: 16, mav_max: 22, mrv: 30 },
    [UserLevel.Elite]: { mev: 14, mav_min: 18, mav_max: 25, mrv: 35 },
  };

  const ranges = baseRanges[level];

  if (objective === ProgramObjective.Strength) {
    const strengthRatio = 0.8;
    return {
      mev: Math.floor(ranges.mev * strengthRatio),
      mav_min: Math.floor(ranges.mav_min * strengthRatio),
      mav_max: Math.floor(ranges.mav_max * strengthRatio),
      mrv: Math.floor(ranges.mrv * strengthRatio),
    };
  }

  if (objective === ProgramObjective.Endurance) {
    const enduranceRatio = 1.2;
    return {
      mev: Math.floor(ranges.mev * enduranceRatio),
      mav_min: Math.floor(ranges.mav_min * enduranceRatio),
      mav_max: Math.floor(ranges.mav_max * enduranceRatio),
      mrv: Math.floor(ranges.mrv * enduranceRatio),
    };
  }

  return ranges;
}

export function getOptimalFrequency(level: UserLevel): {
  min: number;
  optimal: number;
  max: number;
} {
  const frequencies = {
    [UserLevel.Beginner]: { min: 2, optimal: 3, max: 4 },
    [UserLevel.Intermediate]: { min: 2, optimal: 2, max: 3 },
    [UserLevel.Advanced]: { min: 2, optimal: 2.5, max: 3 },
    [UserLevel.Elite]: { min: 2, optimal: 2.5, max: 3 },
  };

  return frequencies[level];
}

export function getIdealExerciseBalance(
  level: UserLevel,
  objective: ProgramObjective
): { compound: number; isolation: number } {
  if (level === UserLevel.Beginner) {
    return { compound: 75, isolation: 25 };
  }

  if (level === UserLevel.Intermediate) {
    return { compound: 65, isolation: 35 };
  }

  if (
    objective === ProgramObjective.Strength ||
    objective === ProgramObjective.PowerLifting
  ) {
    return { compound: 80, isolation: 20 };
  }

  if (objective === ProgramObjective.Hypertrophy) {
    return { compound: 60, isolation: 40 };
  }

  return { compound: 70, isolation: 30 };
}

export enum InsightStatus {
  Excellent = "excellent",
  Good = "good",
  Warning = "warning",
  Critical = "critical",
}

// Types for enhanced insights

export interface MuscleRecommendation {
  category:
    | "volume"
    | "frequency"
    | "exercise_balance"
    | "intensity"
    | "recovery";
  message: string;
  priority: "high" | "medium" | "low";
}

export interface MuscleDetailedMetrics {
  muscle: string;

  // Volume with visual status
  volume: {
    setsPerWeek: number;
    score: number;
    status: InsightStatus;
    minRecommended: number;
    maxRecommended: number;
  };

  // Frequency with calendar data
  frequency: {
    timesPerWeek: number;
    score: number;
    status: InsightStatus;
    dayIndices: number[]; // 0=Monday, 6=Sunday (for visual calendar)
    consecutiveDays?: {
      hasConsecutiveDays: boolean;
      minRestDays: number;
      status: InsightStatus;
    };
  };

  // Other optional metrics
  intensity?: {
    avgRpe: number;
  };

  recovery?: {
    avgRestDays: number;
  };

  // All recommendations related to this muscle
  recommendations: MuscleRecommendation[];
}

export interface ExercisePattern {
  count: number;
  percentage: number;
}

export interface ExerciseMetrics {
  // Compound/Isolation ratio
  compoundIsolationRatio: {
    compound: number;
    isolation: number;
    compoundPercentage: number;
    isolationPercentage: number;
    score: number;
    status: InsightStatus;
    recommendations: string[];
  };

  // Global metrics
  totalExercises: number;
  uniqueExercises: number;
}

export interface ProgramInsightsData {
  totalScore: number;
  maxTotalScore: number;
  grade: "Excellent" | "Very Good" | "Good" | "Fair" | "Needs Improvement";

  // Muscle-centric structure
  muscleMetrics: MuscleDetailedMetrics[];

  // Exercise metrics section
  exerciseMetrics: ExerciseMetrics;

  // Global metrics
  recovery: {
    totalRestDays: number;
    totalTrainingDays: number;
    restDayDistribution: number[];
  };

  intensityTechniques: {
    percentage: number;
    totalExercises: number;
    circuitExercises: number;
    circuitsByType: Record<string, number>;
  };
}

export interface QuickInsight {
  id: string;
  type: "positive" | "warning" | "critical";
  message: string;
  category: string;
}

// Updated metrics types for hooks

export interface VolumeMetrics {
  muscle: string;
  setsPerWeek: number;
  score: number;
  status:
    | "below_mev"
    | "mev_to_mav"
    | "optimal"
    | "approaching_mrv"
    | "exceeding_mrv";
  recommendation?: string;
  minRecommended: number;
  maxRecommended: number;
}

export interface FrequencyMetrics {
  muscle: string;
  timesPerWeek: number;
  score: number;
  recommendation?: string;
  dayIndices: number[]; // 0=Monday, 6=Sunday
  consecutiveDays?: {
    hasConsecutiveDays: boolean;
    minRestDays: number; // Minimum rest days between sessions
    status: InsightStatus; // excellent (2+ days), good (1 day), warning (0 days)
  };
}

export interface ExerciseBalanceMetrics {
  compoundPercentage: number;
  isolationPercentage: number;
  totalExercises: number;
  uniqueExercises: number;
  score: number;
  recommendation?: string;
}

export function getStatus(score: number): InsightStatus {
  if (score >= 90) return InsightStatus.Excellent;
  if (score >= 70) return InsightStatus.Good;
  if (score >= 50) return InsightStatus.Warning;
  return InsightStatus.Critical;
}

export function getGrade(
  score: number
): "Excellent" | "Very Good" | "Good" | "Fair" | "Needs Improvement" {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  return "Needs Improvement";
}
