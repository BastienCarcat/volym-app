import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/tanstack/query-keys";
import type { GymFitExercise } from "@/lib/gymfit/types";
import { BodyPart } from "@/lib/gymfit/types";
import { SessionItemType } from "@/generated/prisma";
import type { BaseInsightsParams } from "./types";
import { z } from "zod";
import { circuitItemDbSchema } from "@/lib/schemas/sessions.schema";

export interface IntensityMetrics {
  muscle: string;
  avgRpe: number;
  setsWithRpe: number;
  totalSets: number;
  highIntensitySets: number; // RPE >= 8
}

export const useIntensityInsights = ({
  program,
  activeSessionId,
  activeSessionFormValues,
  currentWeek = 1,
}: BaseInsightsParams): IntensityMetrics[] => {
  const queryClient = useQueryClient();

  return useMemo(() => {
    const muscleData: Record<string, { rpeSum: number; setsWithRpe: number; totalSets: number; highIntensity: number }> = {
      [BodyPart.Chest]: { rpeSum: 0, setsWithRpe: 0, totalSets: 0, highIntensity: 0 },
      [BodyPart.Back]: { rpeSum: 0, setsWithRpe: 0, totalSets: 0, highIntensity: 0 },
      [BodyPart.Legs]: { rpeSum: 0, setsWithRpe: 0, totalSets: 0, highIntensity: 0 },
      [BodyPart.Shoulders]: { rpeSum: 0, setsWithRpe: 0, totalSets: 0, highIntensity: 0 },
      [BodyPart.Arms]: { rpeSum: 0, setsWithRpe: 0, totalSets: 0, highIntensity: 0 },
      [BodyPart.Core]: { rpeSum: 0, setsWithRpe: 0, totalSets: 0, highIntensity: 0 },
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
              sessionItem.exercise.sets.forEach((set) => {
                muscleData[exercise.bodyPart].totalSets++;
                if (set.rpe !== null && set.rpe > 0) {
                  muscleData[exercise.bodyPart].rpeSum += set.rpe;
                  muscleData[exercise.bodyPart].setsWithRpe++;
                  if (set.rpe >= 8) {
                    muscleData[exercise.bodyPart].highIntensity++;
                  }
                }
              });
            }
          } else if (
            sessionItem.type === SessionItemType.Circuit &&
            sessionItem.circuit
          ) {
            sessionItem.circuit.circuitItems?.forEach((circuitItem: z.infer<typeof circuitItemDbSchema>) => {
              if (circuitItem.exercise) {
                const exercise = queryClient.getQueryData<GymFitExercise>(
                  queryKeys.exercises.detail(circuitItem.exercise.exerciseId)
                );

                if (exercise?.bodyPart) {
                  circuitItem.exercise.sets.forEach((set) => {
                    muscleData[exercise.bodyPart].totalSets++;
                    if (set.rpe !== null && set.rpe > 0) {
                      muscleData[exercise.bodyPart].rpeSum += set.rpe;
                      muscleData[exercise.bodyPart].setsWithRpe++;
                      if (set.rpe >= 8) {
                        muscleData[exercise.bodyPart].highIntensity++;
                      }
                    }
                  });
                }
              }
            });
          }
        });
      });

    return Object.entries(muscleData).map(([muscle, data]) => ({
      muscle,
      avgRpe: data.setsWithRpe > 0 ? data.rpeSum / data.setsWithRpe : 0,
      setsWithRpe: data.setsWithRpe,
      totalSets: data.totalSets,
      highIntensitySets: data.highIntensity,
    }));
  }, [
    program,
    activeSessionId,
    activeSessionFormValues,
    currentWeek,
    queryClient,
  ]);
};
