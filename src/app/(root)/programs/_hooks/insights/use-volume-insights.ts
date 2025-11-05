import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/tanstack/query-keys";
import type { GymFitExercise } from "@/lib/gymfit/types";
import { BodyPart } from "@/lib/gymfit/types";
import {
  SessionItemType,
  UserLevel,
  ProgramObjective,
} from "@/generated/prisma";
import type { BaseInsightsParams, VolumeMetrics } from "./types";
import { getVolumeRanges } from "./types";
import { z } from "zod";
import { circuitItemDbSchema } from "@/lib/schemas/sessions.schema";

interface UseVolumeInsightsParams extends BaseInsightsParams {
  userLevel: UserLevel;
  objective: ProgramObjective;
}

export const useVolumeInsights = ({
  program,
  activeSessionId,
  activeSessionFormValues,
  currentWeek = 1,
  userLevel,
  objective,
}: UseVolumeInsightsParams): VolumeMetrics[] => {
  const queryClient = useQueryClient();

  return useMemo(() => {
    const muscleCount: Record<BodyPart, number> = {
      [BodyPart.Chest]: 0,
      [BodyPart.Back]: 0,
      [BodyPart.Legs]: 0,
      [BodyPart.Shoulders]: 0,
      [BodyPart.Arms]: 0,
      [BodyPart.Core]: 0,
    };

    program.sessions
      .filter((session) => (session.weekNumber ?? 1) === currentWeek)
      .forEach((session) => {
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
              const setsCount = sessionItem.exercise.sets.length;
              muscleCount[exercise.bodyPart] =
                (muscleCount[exercise.bodyPart] || 0) + setsCount;
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
                    const setsCount = circuitItem.exercise.sets.length;
                    muscleCount[exercise.bodyPart] =
                      (muscleCount[exercise.bodyPart] || 0) + setsCount;
                  }
                }
              }
            );
          }
        });
      });

    const ranges = getVolumeRanges(userLevel, objective);

    return Object.entries(muscleCount).map(([muscle, sets]) => {
      const { score, status, recommendation } = calculateVolumeScore(
        sets,
        ranges
      );

      return {
        muscle,
        setsPerWeek: sets,
        score,
        status,
        recommendation,
        minRecommended: ranges.mav_min,
        maxRecommended: ranges.mav_max,
      };
    });
  }, [
    program,
    activeSessionId,
    activeSessionFormValues,
    currentWeek,
    userLevel,
    objective,
    queryClient,
  ]);
};

function calculateVolumeScore(
  sets: number,
  ranges: ReturnType<typeof getVolumeRanges>
): {
  score: number;
  status: VolumeMetrics["status"];
  recommendation?: string;
} {
  if (sets === 0) {
    return {
      score: 0,
      status: "below_mev",
      recommendation:
        "This muscle group is not trained. Consider adding exercises.",
    };
  }

  if (sets < ranges.mev) {
    return {
      score: (sets / ranges.mev) * 50,
      status: "below_mev",
      recommendation: `Add ${ranges.mev - sets} more sets to reach minimum effective volume.`,
    };
  }

  if (sets < ranges.mav_min) {
    return {
      score: 50 + ((sets - ranges.mev) / (ranges.mav_min - ranges.mev)) * 20,
      status: "mev_to_mav",
      recommendation: `Add ${ranges.mav_min - sets} more sets to reach optimal volume range.`,
    };
  }

  if (sets <= ranges.mav_max) {
    return {
      score:
        70 + ((sets - ranges.mav_min) / (ranges.mav_max - ranges.mav_min)) * 30,
      status: "optimal",
    };
  }

  if (sets <= ranges.mrv) {
    return {
      score:
        100 - ((sets - ranges.mav_max) / (ranges.mrv - ranges.mav_max)) * 15,
      status: "approaching_mrv",
      recommendation:
        "Volume is high. Monitor recovery and consider a deload week soon.",
    };
  }

  return {
    score: Math.max(0, 85 - ((sets - ranges.mrv) / 5) * 20),
    status: "exceeding_mrv",
    recommendation:
      "Volume exceeds maximum recoverable volume. Reduce sets to avoid overtraining.",
  };
}
