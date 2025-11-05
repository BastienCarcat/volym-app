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
import {
  evaluateCriteria,
  createCriterionConfig,
} from "./criteria-system";
import {
  evaluateBaseVolume,
  type VolumeCriteriaData,
} from "./volume-criteria";

interface UseVolumeInsightsParams extends BaseInsightsParams {
  userLevel: UserLevel;
  objective: ProgramObjective;
}

/**
 * Configure which criteria to use for volume evaluation
 */
const VOLUME_CRITERIA_CONFIG = [
  {
    evaluator: evaluateBaseVolume,
    config: createCriterionConfig("baseVolume", 1.0), // 100% weight - only base volume for now
  },
];

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
      // Prepare data for criteria evaluation
      const criteriaData: VolumeCriteriaData = {
        setsPerWeek: sets,
        ranges,
      };

      // Evaluate all configured criteria
      const evaluation = evaluateCriteria(criteriaData, VOLUME_CRITERIA_CONFIG);

      // Extract volume status from base volume criterion
      const baseVolumeCriterion = evaluation.criteria.find(
        (c) => c.criterionName === "baseVolume"
      );
      const volumeStatus =
        (baseVolumeCriterion?.metadata?.volumeStatus as VolumeMetrics["status"]) ||
        "below_mev";

      // Get primary recommendation
      const primaryRecommendation = evaluation.recommendations[0];

      return {
        muscle,
        setsPerWeek: sets,
        score: evaluation.finalScore,
        status: volumeStatus,
        recommendation: primaryRecommendation,
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
