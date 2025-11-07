import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/tanstack/query-keys";
import type { GymFitExercise } from "@/lib/gymfit/types";
import { BodyPart } from "@/lib/gymfit/types";
import { SessionItemType, DayOfWeek, ProgramType } from "@/generated/prisma";
import type { BaseInsightsParams } from "./types";
import { InsightStatus } from "./types";
import { z } from "zod";
import { circuitItemDbSchema } from "@/lib/schemas/sessions.schema";
import { evaluateCriteria, createCriterionConfig } from "./criteria-system";
import {
  evaluateConsecutiveDays,
  type RecoveryCriteriaData,
} from "./recovery-criteria";

export interface RecoveryMetrics {
  muscle: string;
  score: number; // Score from criteria evaluation
  avgRestDays: number;
  minRestDays: number;
  maxRestDays: number;
  consecutiveDays?: {
    hasConsecutiveDays: boolean;
    minRestDays: number;
    status: InsightStatus;
  };
}

export interface GlobalRecoveryMetrics {
  totalRestDays: number;
  totalTrainingDays: number;
  muscleRecovery: RecoveryMetrics[];
}

const dayOrder: Record<DayOfWeek, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

// Convert DayOfWeek enum to index (0=Monday, 6=Sunday)
function dayOfWeekToIndex(day: DayOfWeek): number {
  return dayOrder[day];
}

// Map cycle days to week days (0-6), starting with first occurrence at Monday
function mapCycleDaysToWeekDays(
  cycleDays: number[],
  firstOccurrence: number
): number[] {
  if (cycleDays.length === 0) return [];

  const sortedDays = [...cycleDays].sort((a, b) => a - b);

  return sortedDays.map((day) => {
    const offset = day - firstOccurrence;
    return ((offset % 7) + 7) % 7; // Normalize to 0-6
  });
}

/**
 * Configure which criteria to use for recovery evaluation
 */
const RECOVERY_CRITERIA_CONFIG = [
  {
    evaluator: evaluateConsecutiveDays,
    config: createCriterionConfig("consecutiveDays", 1.0), // 100% weight
  },
];

export const useRecoveryInsights = ({
  program,
  activeSessionId,
  activeSessionFormValues,
  currentWeek = 1,
}: BaseInsightsParams): GlobalRecoveryMetrics => {
  const queryClient = useQueryClient();

  return useMemo(() => {
    const isTypeDays = program.type === ProgramType.Days;

    // For Days type: filter by currentWeek
    // For Cycle type: analyze all sessions
    const sessions = program.sessions
      .filter((session) =>
        isTypeDays ? (session.weekNumber ?? 1) === currentWeek : true
      )
      .filter((session) => !session.isRestDay)
      .sort((a, b) => {
        if (isTypeDays) {
          if (!a.day || !b.day) return 0;
          return dayOrder[a.day] - dayOrder[b.day];
        }
        return (a.cycleDay || 0) - (b.cycleDay || 0);
      });

    // Track which days each muscle is trained
    const muscleTrainingDays: Record<string, (number | null)[]> = {
      [BodyPart.Chest]: [],
      [BodyPart.Back]: [],
      [BodyPart.Legs]: [],
      [BodyPart.Shoulders]: [],
      [BodyPart.Arms]: [],
      [BodyPart.Core]: [],
    };

    sessions.forEach((session) => {
      const isActiveSession = activeSessionId === session.id;
      const sessionData =
        isActiveSession && activeSessionFormValues
          ? activeSessionFormValues
          : session;

      const dayValue = isTypeDays
        ? sessionData.day
          ? dayOfWeekToIndex(sessionData.day)
          : null
        : sessionData.cycleDay;

      sessionData.sessionItems.forEach((sessionItem) => {
        const trainedMuscles = new Set<string>();

        if (
          sessionItem.type === SessionItemType.Exercise &&
          sessionItem.exercise
        ) {
          const exercise = queryClient.getQueryData<GymFitExercise>(
            queryKeys.exercises.detail(sessionItem.exercise.exerciseId)
          );

          if (exercise?.bodyPart) {
            trainedMuscles.add(exercise.bodyPart);
          }
        } else if (
          sessionItem.type === SessionItemType.Circuit &&
          sessionItem.circuit
        ) {
          sessionItem.circuit.circuitItems?.forEach(
            (circuitItem: z.infer<typeof circuitItemDbSchema>) => {
              if (circuitItem.exercise) {
                const exercise = queryClient.getQueryData<GymFitExercise>(
                  queryKeys.exercises.detail(circuitItem.exercise.exerciseId)
                );

                if (exercise?.bodyPart) {
                  trainedMuscles.add(exercise.bodyPart);
                }
              }
            }
          );
        }

        trainedMuscles.forEach((muscle) => {
          if (
            dayValue !== null &&
            !muscleTrainingDays[muscle].includes(dayValue)
          ) {
            muscleTrainingDays[muscle].push(dayValue);
          }
        });
      });
    });

    // Calculate rest days between training sessions for each muscle
    const muscleRecovery: RecoveryMetrics[] = Object.entries(
      muscleTrainingDays
    ).map(([muscle, days]) => {
      // Calculate dayIndices based on program type
      let dayIndices: number[] = [];

      if (isTypeDays) {
        // For Days type, use actual day indices
        dayIndices = days.filter((d): d is number => d !== null);
      } else {
        // For Cycle type, map to week days starting from Monday
        const cycleDays = days.filter((d): d is number => d !== null);
        if (cycleDays.length > 0) {
          const firstOccurrence = Math.min(...cycleDays);
          dayIndices = mapCycleDaysToWeekDays(cycleDays, firstOccurrence);
        }
      }

      const uniqueDayIndices = [...new Set(dayIndices)].sort();

      // Prepare data for criteria evaluation
      const criteriaData: RecoveryCriteriaData = {
        totalRestDays: 0, // Not used for muscle-specific evaluation
        totalTrainingDays: 0, // Not used for muscle-specific evaluation
        dayIndices: uniqueDayIndices,
      };

      // Evaluate criteria
      const evaluation = evaluateCriteria(
        criteriaData,
        RECOVERY_CRITERIA_CONFIG
      );

      // Extract consecutive days info
      const consecutiveDaysCriterion = evaluation.criteria.find(
        (c) => c.criterionName === "consecutiveDays"
      );

      // For muscles not trained (length=0), consecutiveDays should be undefined
      // to prevent showing recovery metrics in the UI
      const consecutiveDays = consecutiveDaysCriterion && uniqueDayIndices.length > 0
        ? {
            hasConsecutiveDays:
              (consecutiveDaysCriterion.metadata
                ?.hasConsecutiveDays as boolean) || false,
            minRestDays:
              (consecutiveDaysCriterion.metadata?.minRestDays as number) || 6,
            status: consecutiveDaysCriterion.status,
          }
        : undefined;

      // For 0 or 1 training day, no need to calculate rest periods
      if (uniqueDayIndices.length <= 1) {
        return {
          muscle,
          score: evaluation.finalScore, // 100 from evaluateConsecutiveDays
          avgRestDays: 6,
          minRestDays: 6,
          maxRestDays: 6,
          consecutiveDays, // undefined for 0 sessions, defined for 1 session
        };
      }

      const sortedDays = [...uniqueDayIndices].sort((a, b) => a - b);
      const restPeriods: number[] = [];

      for (let i = 1; i < sortedDays.length; i++) {
        restPeriods.push(sortedDays[i] - sortedDays[i - 1] - 1);
      }

      const avgRest =
        restPeriods.reduce((sum, r) => sum + r, 0) / restPeriods.length;
      const minRest = Math.min(...restPeriods);
      const maxRest = Math.max(...restPeriods);

      return {
        muscle,
        score: evaluation.finalScore,
        avgRestDays: avgRest,
        minRestDays: minRest,
        maxRestDays: maxRest,
        consecutiveDays,
      };
    });

    // Count total training vs rest days
    const allSessionsInWeek = program.sessions.filter(
      (session) => (session.weekNumber ?? 1) === currentWeek
    );
    const trainingDays = allSessionsInWeek.filter((s) => !s.isRestDay).length;
    const restDays = 7 - trainingDays;

    return {
      totalRestDays: restDays,
      totalTrainingDays: trainingDays,
      muscleRecovery,
    };
  }, [
    program,
    activeSessionId,
    activeSessionFormValues,
    currentWeek,
    queryClient,
  ]);
};
