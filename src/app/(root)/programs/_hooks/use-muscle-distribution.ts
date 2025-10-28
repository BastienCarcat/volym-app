import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { queryKeys } from "@/lib/tanstack/query-keys";
import type { ProgramWithFullSessions } from "./use-programs";
import type { SessionWithExercises } from "@/hooks/use-sessions";
import type { GymFitExercise } from "@/lib/gymfit/types";
import { BodyPart } from "@/lib/gymfit/types";

export interface MuscleDistributionData {
  muscle: string;
  sets: number;
}

interface UseMuscleDistributionParams {
  program: ProgramWithFullSessions;
  activeSessionId?: string;
  activeSessionFormValues?: SessionWithExercises;
}

export const useMuscleDistribution = ({
  program,
  activeSessionId,
  activeSessionFormValues,
}: UseMuscleDistributionParams): MuscleDistributionData[] => {
  const queryClient = useQueryClient();

  return useMemo(() => {
    const muscleCount: Record<string, number> = {
      [BodyPart.Chest]: 0,
      [BodyPart.Back]: 0,
      [BodyPart.Legs]: 0,
      [BodyPart.Shoulders]: 0,
      [BodyPart.Arms]: 0,
      [BodyPart.Core]: 0,
    };

    program.sessions.forEach((session) => {
      const isActiveSession = activeSessionId === session.id;
      const sessionData =
        isActiveSession && activeSessionFormValues
          ? activeSessionFormValues
          : session;

      sessionData.exercises.forEach((sessionExercise) => {
        const exercise = queryClient.getQueryData<GymFitExercise>(
          queryKeys.exercises.detail(sessionExercise.exerciseId)
        );

        if (exercise?.bodyPart) {
          const setsCount = sessionExercise.sets.length;
          muscleCount[exercise.bodyPart] =
            (muscleCount[exercise.bodyPart] || 0) + setsCount;
        } else if (!exercise) {
          console.warn(
            `Exercise ${sessionExercise.exerciseId} not found in cache. This should not happen if exercises were prefetched.`
          );
        }
      });
    });

    return Object.entries(muscleCount).map(([muscle, sets]) => ({
      muscle,
      sets,
    }));
  }, [program, activeSessionId, activeSessionFormValues, queryClient]);
};
