import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/tanstack/query-keys";
import type { GymFitExercise } from "@/lib/gymfit/types";
import { BodyPart } from "@/lib/gymfit/types";
import { SessionItemType, DayOfWeek } from "@/generated/prisma";
import type { BaseInsightsParams } from "./types";
import { z } from "zod";
import { circuitItemDbSchema } from "@/lib/schemas/sessions.schema";

export interface RecoveryMetrics {
  muscle: string;
  avgRestDays: number;
  minRestDays: number;
  maxRestDays: number;
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

export const useRecoveryInsights = ({
  program,
  activeSessionId,
  activeSessionFormValues,
  currentWeek = 1,
}: BaseInsightsParams): GlobalRecoveryMetrics => {
  const queryClient = useQueryClient();

  return useMemo(() => {
    // Get sessions for current week sorted by day
    const sessions = program.sessions
      .filter((session) => (session.weekNumber ?? 1) === currentWeek)
      .filter((session) => !session.isRestDay)
      .sort((a, b) => {
        if (!a.day || !b.day) return 0;
        return dayOrder[a.day] - dayOrder[b.day];
      });

    // Track which days each muscle is trained
    const muscleTrainingDays: Record<string, number[]> = {
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

      const dayNum = session.day ? dayOrder[session.day] : 0;

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
          sessionItem.circuit.circuitItems?.forEach((circuitItem: z.infer<typeof circuitItemDbSchema>) => {
            if (circuitItem.exercise) {
              const exercise = queryClient.getQueryData<GymFitExercise>(
                queryKeys.exercises.detail(circuitItem.exercise.exerciseId)
              );

              if (exercise?.bodyPart) {
                trainedMuscles.add(exercise.bodyPart);
              }
            }
          });
        }

        trainedMuscles.forEach((muscle) => {
          if (!muscleTrainingDays[muscle].includes(dayNum)) {
            muscleTrainingDays[muscle].push(dayNum);
          }
        });
      });
    });

    // Calculate rest days between training sessions for each muscle
    const muscleRecovery: RecoveryMetrics[] = Object.entries(muscleTrainingDays).map(
      ([muscle, days]) => {
        if (days.length <= 1) {
          return {
            muscle,
            avgRestDays: 7,
            minRestDays: 7,
            maxRestDays: 7,
          };
        }

        const sortedDays = [...days].sort((a, b) => a - b);
        const restPeriods: number[] = [];

        for (let i = 1; i < sortedDays.length; i++) {
          restPeriods.push(sortedDays[i] - sortedDays[i - 1] - 1);
        }

        const avgRest = restPeriods.reduce((sum, r) => sum + r, 0) / restPeriods.length;
        const minRest = Math.min(...restPeriods);
        const maxRest = Math.max(...restPeriods);

        return {
          muscle,
          avgRestDays: avgRest,
          minRestDays: minRest,
          maxRestDays: maxRest,
        };
      }
    );

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
