import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { queryKeys } from "@/lib/tanstack/query-keys";
import type { ProgramWithFullSessions } from "./use-programs";
import type { SessionWithItems } from "@/hooks/use-sessions";
import type { GymFitExercise } from "@/lib/gymfit/types";
import { BodyPart } from "@/lib/gymfit/types";
import { SessionItemType } from "@/generated/prisma";

export interface MuscleDistributionData {
  muscle: string;
  sets: number;
}

interface UseMuscleDistributionParams {
  program: ProgramWithFullSessions;
  activeSessionId?: string;
  activeSessionFormValues?: SessionWithItems;
  currentWeek?: number;
}

export const useMuscleDistribution = ({
  program,
  activeSessionId,
  activeSessionFormValues,
  currentWeek = 1,
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

    program.sessions
      .filter((session) => (session.weekNumber ?? 1) === currentWeek)
      .forEach((session) => {
        const isActiveSession = activeSessionId === session.id;
        const sessionData =
          isActiveSession && activeSessionFormValues
            ? activeSessionFormValues
            : session;

        // Process sessionItems instead of exercises
        sessionData.sessionItems.forEach((sessionItem) => {
          if (
            sessionItem.type === SessionItemType.Exercise &&
            sessionItem.exercise
          ) {
            // Direct exercise
            const exercise = queryClient.getQueryData<GymFitExercise>(
              queryKeys.exercises.detail(sessionItem.exercise.exerciseId)
            );

            if (exercise?.bodyPart) {
              const setsCount = sessionItem.exercise.sets.length;
              muscleCount[exercise.bodyPart] =
                (muscleCount[exercise.bodyPart] || 0) + setsCount;
            } else if (!exercise) {
              console.warn(
                `Exercise ${sessionItem.exercise.exerciseId} not found in cache. This should not happen if exercises were prefetched.`
              );
            }
          } else if (
            sessionItem.type === SessionItemType.Circuit &&
            sessionItem.circuit
          ) {
            // Circuit - process all exercises in circuitItems
            sessionItem.circuit.circuitItems?.forEach((circuitItem: any) => {
              if (circuitItem.exercise) {
                const exercise = queryClient.getQueryData<GymFitExercise>(
                  queryKeys.exercises.detail(circuitItem.exercise.exerciseId)
                );

                if (exercise?.bodyPart) {
                  const setsCount = circuitItem.exercise.sets.length;
                  muscleCount[exercise.bodyPart] =
                    (muscleCount[exercise.bodyPart] || 0) + setsCount;
                } else if (!exercise) {
                  console.warn(
                    `Exercise ${circuitItem.exercise.exerciseId} not found in cache. This should not happen if exercises were prefetched.`
                  );
                }
              }
            });
          }
        });
      });

    return Object.entries(muscleCount).map(([muscle, sets]) => ({
      muscle,
      sets,
    }));
  }, [program, activeSessionId, activeSessionFormValues, currentWeek, queryClient]);
};
