import { useMemo } from "react";
import { UserLevel, ProgramObjective } from "@/generated/prisma";
import type {
  ProgramInsightsData,
  MuscleDetailedMetrics,
  MuscleRecommendation,
  ExerciseMetrics,
  BaseInsightsParams,
} from "./insights/types";
import { getGrade, getStatus } from "./insights/types";
import { useVolumeInsights } from "./insights/use-volume-insights";
import { useFrequencyInsights } from "./insights/use-frequency-insights";
import { useExerciseBalanceInsights } from "./insights/use-exercise-balance-insights";
import { useIntensityInsights } from "./insights/use-intensity-insights";
import { useRecoveryInsights } from "./insights/use-recovery-insights";
import { useIntensityTechniquesInsights } from "./insights/use-intensity-techniques-insights";

// Helper to determine priority based on score
function getPriority(score: number): "high" | "medium" | "low" {
  if (score < 50) return "high";
  if (score < 70) return "medium";
  return "low";
}

// Helper to calculate category score
function calculateCategoryScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export const useProgramInsights = ({
  program,
  activeSessionId,
  activeSessionFormValues,
  currentWeek = 1,
  userLevel: userLevelProp,
  objective: objectiveProp,
}: BaseInsightsParams): ProgramInsightsData => {
  const userLevel = userLevelProp || UserLevel.Intermediate;
  const objective =
    objectiveProp || program.objective || ProgramObjective.Hypertrophy;

  const volumeMetrics = useVolumeInsights({
    program,
    activeSessionId,
    activeSessionFormValues,
    currentWeek,
    userLevel,
    objective,
  });

  const frequencyMetrics = useFrequencyInsights({
    program,
    activeSessionId,
    activeSessionFormValues,
    currentWeek,
    userLevel,
  });

  const exerciseBalance = useExerciseBalanceInsights({
    program,
    currentWeek,
    userLevel,
    objective,
  });

  const intensityMetrics = useIntensityInsights({
    program,
    activeSessionId,
    activeSessionFormValues,
    currentWeek,
  });

  const recoveryMetrics = useRecoveryInsights({
    program,
    activeSessionId,
    activeSessionFormValues,
    currentWeek,
  });

  const intensityTechniques = useIntensityTechniquesInsights({
    program,
    activeSessionId,
    activeSessionFormValues,
    currentWeek,
  });

  return useMemo(() => {
    // Calculate scores for total program score
    const volumeScore = calculateCategoryScore(
      volumeMetrics.map((m) => m.score)
    );
    const frequencyScore = calculateCategoryScore(
      frequencyMetrics.map((m) => m.score)
    );
    const exerciseBalanceScore = exerciseBalance.score;

    // Calculate weighted total score
    const totalScore =
      volumeScore * 0.35 + frequencyScore * 0.3 + exerciseBalanceScore * 0.2;

    const grade = getGrade(totalScore);

    // Build muscle-centric metrics
    const muscleMetrics: MuscleDetailedMetrics[] = volumeMetrics.map((v) => {
      const freq = frequencyMetrics.find((f) => f.muscle === v.muscle);
      const intensity = intensityMetrics.find((i) => i.muscle === v.muscle);
      const recovery = recoveryMetrics.muscleRecovery.find(
        (r) => r.muscle === v.muscle
      );

      // Aggregate all recommendations for this muscle
      const recommendations: MuscleRecommendation[] = [];

      if (v.recommendation) {
        recommendations.push({
          category: "volume",
          message: v.recommendation,
          priority: getPriority(v.score),
        });
      }

      if (freq?.recommendation) {
        recommendations.push({
          category: "frequency",
          message: freq.recommendation,
          priority: getPriority(freq.score),
        });
      }

      // Add recovery recommendation based on consecutive days
      if (freq?.consecutiveDays) {
        if (freq.consecutiveDays.status === "warning") {
          recommendations.push({
            category: "recovery",
            message: `This muscle is trained on consecutive days (${freq.consecutiveDays.minRestDays} rest days). Allow at least 48h between sessions for optimal recovery.`,
            priority: "high",
          });
        } else if (freq.consecutiveDays.status === "good") {
          recommendations.push({
            category: "recovery",
            message: `Only ${freq.consecutiveDays.minRestDays} rest day between sessions. Consider adding one more rest day for optimal recovery.`,
            priority: "medium",
          });
        }
      }

      return {
        muscle: v.muscle,
        volume: {
          setsPerWeek: v.setsPerWeek,
          score: v.score,
          status: getStatus(v.score),
          minRecommended: v.minRecommended,
          maxRecommended: v.maxRecommended,
        },
        frequency: {
          timesPerWeek: freq?.timesPerWeek || 0,
          score: freq?.score || 0,
          status: getStatus(freq?.score || 0),
          dayIndices: freq?.dayIndices || [],
          consecutiveDays: freq?.consecutiveDays,
        },
        intensity: intensity
          ? {
              avgRpe: intensity.avgRpe,
            }
          : undefined,
        recovery: recovery
          ? {
              avgRestDays: recovery.avgRestDays,
            }
          : undefined,
        recommendations,
      };
    });

    // Build exercise metrics
    const exerciseMetrics: ExerciseMetrics = {
      compoundIsolationRatio: {
        compound: Math.round(
          (exerciseBalance.compoundPercentage / 100) *
            exerciseBalance.totalExercises
        ),
        isolation: Math.round(
          (exerciseBalance.isolationPercentage / 100) *
            exerciseBalance.totalExercises
        ),
        compoundPercentage: exerciseBalance.compoundPercentage,
        isolationPercentage: exerciseBalance.isolationPercentage,
        score: exerciseBalance.score,
        status: getStatus(exerciseBalance.score),
        recommendations: exerciseBalance.recommendation
          ? [exerciseBalance.recommendation]
          : [],
      },
      totalExercises: exerciseBalance.totalExercises,
      uniqueExercises: exerciseBalance.uniqueExercises,
    };

    return {
      totalScore: Math.round(totalScore),
      maxTotalScore: 100,
      grade,
      muscleMetrics,
      exerciseMetrics,
      recovery: {
        totalRestDays: recoveryMetrics.totalRestDays,
        totalTrainingDays: recoveryMetrics.totalTrainingDays,
        restDayDistribution: [], // TODO: Calculate rest day distribution
      },
      intensityTechniques: {
        percentage: intensityTechniques.percentage,
        totalExercises: intensityTechniques.totalExercises,
        circuitExercises: intensityTechniques.circuitExercises,
        circuitsByType: intensityTechniques.circuitsByType,
      },
    };
  }, [
    volumeMetrics,
    frequencyMetrics,
    exerciseBalance,
    intensityMetrics,
    recoveryMetrics,
    intensityTechniques,
  ]);
};
