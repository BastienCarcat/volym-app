import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/tanstack/query-keys";
import type { GymFitExercise } from "@/lib/gymfit/types";
import { BodyPart } from "@/lib/gymfit/types";
import {
  SessionItemType,
  UserLevel,
  DayOfWeek,
  ProgramType,
} from "@/generated/prisma";
import type { BaseInsightsParams, FrequencyMetrics } from "./types";
import { getOptimalFrequency } from "./types";
import { z } from "zod";
import { circuitItemDbSchema } from "@/lib/schemas/sessions.schema";
import {
  evaluateCriteria,
  createCriterionConfig,
} from "./criteria-system";
import {
  evaluateBaseFrequency,
  evaluateFrequencyDistribution,
  type FrequencyCriteriaData,
} from "./frequency-criteria";

interface UseFrequencyInsightsParams extends BaseInsightsParams {
  userLevel: UserLevel;
}

// Convert DayOfWeek enum to index (0=Monday, 6=Sunday)
function dayOfWeekToIndex(day: DayOfWeek): number {
  const dayMap: Record<DayOfWeek, number> = {
    [DayOfWeek.Monday]: 0,
    [DayOfWeek.Tuesday]: 1,
    [DayOfWeek.Wednesday]: 2,
    [DayOfWeek.Thursday]: 3,
    [DayOfWeek.Friday]: 4,
    [DayOfWeek.Saturday]: 5,
    [DayOfWeek.Sunday]: 6,
  };
  return dayMap[day];
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
 * Configure which criteria to use for frequency evaluation
 * You can easily enable/disable criteria or adjust their weights
 */
const FREQUENCY_CRITERIA_CONFIG = [
  {
    evaluator: evaluateBaseFrequency,
    config: createCriterionConfig("baseFrequency", 0.9), // 90% weight
  },
  {
    evaluator: evaluateFrequencyDistribution,
    config: createCriterionConfig("frequencyDistribution", 0.1, false), // 10% weight - disabled for now
  },
];

export const useFrequencyInsights = ({
  program,
  activeSessionId,
  activeSessionFormValues,
  currentWeek = 1,
  userLevel,
}: UseFrequencyInsightsParams): FrequencyMetrics[] => {
  const queryClient = useQueryClient();

  return useMemo(() => {
    const muscleSessionData: Record<
      string,
      { sessionIds: Set<string>; days: (number | null)[] }
    > = {
      [BodyPart.Chest]: { sessionIds: new Set(), days: [] },
      [BodyPart.Back]: { sessionIds: new Set(), days: [] },
      [BodyPart.Legs]: { sessionIds: new Set(), days: [] },
      [BodyPart.Shoulders]: { sessionIds: new Set(), days: [] },
      [BodyPart.Arms]: { sessionIds: new Set(), days: [] },
      [BodyPart.Core]: { sessionIds: new Set(), days: [] },
    };

    const isTypeDays = program.type === ProgramType.Days;

    program.sessions
      .filter(
        (session) =>
          (session.weekNumber ?? 1) === currentWeek && !session.isRestDay
      )
      .forEach((session) => {
        const musclesInSession = new Set<string>();

        const isActiveSession = activeSessionId === session.id;
        const sessionData =
          isActiveSession && activeSessionFormValues
            ? activeSessionFormValues
            : session;

        sessionData.sessionItems.forEach((sessionItem) => {
          if (
            sessionItem.type === SessionItemType.Exercise &&
            sessionItem.exercise
          ) {
            const exercise = queryClient.getQueryData<GymFitExercise>(
              queryKeys.exercises.detail(sessionItem.exercise.exerciseId)
            );

            if (exercise?.bodyPart) {
              musclesInSession.add(exercise.bodyPart);
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
                    musclesInSession.add(exercise.bodyPart);
                  }
                }
              }
            );
          }
        });

        const dayValue = isTypeDays
          ? sessionData.day
            ? dayOfWeekToIndex(sessionData.day)
            : null
          : sessionData.cycleDay;

        musclesInSession.forEach((muscle) => {
          muscleSessionData[muscle].sessionIds.add(session.id);
          if (dayValue !== null) {
            muscleSessionData[muscle].days.push(dayValue);
          }
        });
      });

    const optimalFrequency = getOptimalFrequency(userLevel);

    return Object.entries(muscleSessionData).map(([muscle, data]) => {
      const frequency = data.sessionIds.size;

      // Calculate dayIndices based on program type
      let dayIndices: number[] = [];

      if (isTypeDays) {
        // For Days type, use actual day indices
        dayIndices = data.days.filter((d): d is number => d !== null);
      } else {
        // For Cycle type, map to week days starting from Monday
        const cycleDays = data.days.filter((d): d is number => d !== null);
        if (cycleDays.length > 0) {
          const firstOccurrence = Math.min(...cycleDays);
          dayIndices = mapCycleDaysToWeekDays(cycleDays, firstOccurrence);
        }
      }

      const uniqueDayIndices = [...new Set(dayIndices)].sort();

      // Prepare data for criteria evaluation
      const criteriaData: FrequencyCriteriaData = {
        frequency,
        dayIndices: uniqueDayIndices,
        optimal: optimalFrequency,
      };

      // Evaluate all configured criteria
      const evaluation = evaluateCriteria(criteriaData, FREQUENCY_CRITERIA_CONFIG);

      // Get primary recommendation (from lowest scoring criterion)
      const lowestCriterion = evaluation.criteria.sort(
        (a, b) => a.score - b.score
      )[0];
      const primaryRecommendation = lowestCriterion?.recommendation;

      return {
        muscle,
        timesPerWeek: frequency,
        score: evaluation.finalScore,
        recommendation: primaryRecommendation,
        dayIndices: uniqueDayIndices,
      };
    });
  }, [
    program,
    currentWeek,
    userLevel,
    queryClient,
    activeSessionId,
    activeSessionFormValues,
  ]);
};
