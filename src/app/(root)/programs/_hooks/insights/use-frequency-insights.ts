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
import { getOptimalFrequency, InsightStatus } from "./types";
import { z } from "zod";
import { circuitItemDbSchema } from "@/lib/schemas/sessions.schema";

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

// Calculate minimum rest days between training sessions
function calculateConsecutiveDaysAnalysis(dayIndices: number[]): {
  hasConsecutiveDays: boolean;
  minRestDays: number;
  status: InsightStatus;
} {
  if (dayIndices.length <= 1) {
    return {
      hasConsecutiveDays: false,
      minRestDays: 7,
      status: InsightStatus.Excellent,
    };
  }

  const sortedDays = [...dayIndices].sort((a, b) => a - b);
  let minRestDays = 7;

  // Check consecutive days within the week
  for (let i = 0; i < sortedDays.length - 1; i++) {
    const daysBetween = sortedDays[i + 1] - sortedDays[i] - 1;
    minRestDays = Math.min(minRestDays, daysBetween);
  }

  // Check wrap-around (Sunday to Monday)
  const wrapAround = 7 - sortedDays[sortedDays.length - 1] + sortedDays[0] - 1;
  minRestDays = Math.min(minRestDays, wrapAround);

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
      const { score: baseScore, recommendation } = calculateFrequencyScore(
        frequency,
        optimalFrequency
      );

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
      const consecutiveDaysAnalysis =
        calculateConsecutiveDaysAnalysis(uniqueDayIndices);

      // Adjust score based on consecutive days status
      let finalScore = baseScore;
      if (uniqueDayIndices.length > 1 && consecutiveDaysAnalysis) {
        // Apply penalty/bonus based on recovery days
        if (consecutiveDaysAnalysis.status === InsightStatus.Warning) {
          // Consecutive days: reduce score by 20 points
          finalScore = Math.max(0, baseScore - 20);
        } else if (consecutiveDaysAnalysis.status === InsightStatus.Good) {
          // 1 day rest: small penalty of 5 points
          finalScore = Math.max(0, baseScore - 5);
        }
        // Excellent (2+ days): no penalty, keep base score
      }

      return {
        muscle,
        timesPerWeek: frequency,
        score: finalScore,
        recommendation,
        dayIndices: uniqueDayIndices,
        consecutiveDays:
          uniqueDayIndices.length > 1 ? consecutiveDaysAnalysis : undefined,
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

function calculateFrequencyScore(
  frequency: number,
  optimal: { min: number; optimal: number; max: number }
): { score: number; recommendation?: string } {
  if (frequency === 0) {
    return {
      score: 0,
      recommendation: "This muscle group is not trained this week.",
    };
  }

  if (frequency < optimal.min) {
    return {
      score: (frequency / optimal.min) * 70,
      recommendation: `Train this muscle ${Math.ceil(optimal.min - frequency)}x more per week for optimal results.`,
    };
  }

  if (frequency === Math.floor(optimal.optimal)) {
    return { score: 100 };
  }

  if (frequency <= optimal.max) {
    const deviation = Math.abs(frequency - optimal.optimal);
    return {
      score: 100 - deviation * 10,
    };
  }

  return {
    score: Math.max(50, 100 - (frequency - optimal.max) * 20),
    recommendation:
      "Training frequency is very high. Ensure adequate recovery between sessions.",
  };
}
