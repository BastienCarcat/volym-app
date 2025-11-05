import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/tanstack/query-keys";
import type { GymFitExercise } from "@/lib/gymfit/types";
import {
  SessionItemType,
  UserLevel,
  ProgramObjective,
} from "@/generated/prisma";
import type { ExerciseBalanceMetrics, BaseInsightsParams } from "./types";
import { getIdealExerciseBalance } from "./types";
import { classifyExercise } from "@/lib/gymfit/exercise-classification";
import { z } from "zod";
import { circuitItemDbSchema } from "@/lib/schemas/sessions.schema";
import {
  evaluateCriteria,
  createCriterionConfig,
} from "./criteria-system";
import {
  evaluateCompoundIsolationRatio,
  type ExerciseBalanceCriteriaData,
} from "./exercise-balance-criteria";

interface UseExerciseBalanceInsightsParams extends BaseInsightsParams {
  userLevel: UserLevel;
  objective: ProgramObjective;
}

/**
 * Configure which criteria to use for exercise balance evaluation
 */
const EXERCISE_BALANCE_CRITERIA_CONFIG = [
  {
    evaluator: evaluateCompoundIsolationRatio,
    config: createCriterionConfig("compoundIsolationRatio", 1.0), // 100% weight
  },
];

export const useExerciseBalanceInsights = ({
  program,
  currentWeek = 1,
  userLevel,
  objective,
}: UseExerciseBalanceInsightsParams): ExerciseBalanceMetrics => {
  const queryClient = useQueryClient();

  return useMemo(() => {
    const exerciseIds = new Set<string>();

    program.sessions
      .filter(
        (session) =>
          (session.weekNumber ?? 1) === currentWeek && !session.isRestDay
      )
      .forEach((session) => {
        session.sessionItems.forEach((sessionItem) => {
          if (
            sessionItem.type === SessionItemType.Exercise &&
            sessionItem.exercise
          ) {
            exerciseIds.add(sessionItem.exercise.exerciseId);
          } else if (
            sessionItem.type === SessionItemType.Circuit &&
            sessionItem.circuit
          ) {
            sessionItem.circuit.circuitItems?.forEach(
              (circuitItem: z.infer<typeof circuitItemDbSchema>) => {
                if (circuitItem.exercise) {
                  exerciseIds.add(circuitItem.exercise.exerciseId);
                }
              }
            );
          }
        });
      });

    let compoundCount = 0;
    let isolationCount = 0;

    exerciseIds.forEach((exerciseId) => {
      const exercise = queryClient.getQueryData<GymFitExercise>(
        queryKeys.exercises.detail(exerciseId)
      );

      if (exercise) {
        const classification = classifyExercise(exercise.name);
        if (classification === "compound") {
          compoundCount++;
        } else {
          isolationCount++;
        }
      }
    });

    const total = compoundCount + isolationCount;
    const uniqueExercises = exerciseIds.size;

    if (total === 0) {
      return {
        compoundPercentage: 0,
        isolationPercentage: 0,
        totalExercises: 0,
        uniqueExercises: 0,
        score: 0,
        recommendation: "No exercises found in this week.",
      };
    }

    const compoundPercentage = (compoundCount / total) * 100;
    const isolationPercentage = (isolationCount / total) * 100;

    const ideal = getIdealExerciseBalance(userLevel, objective);

    // Prepare data for criteria evaluation
    const criteriaData: ExerciseBalanceCriteriaData = {
      compoundPercentage,
      isolationPercentage,
      totalExercises: total,
      ideal,
    };

    // Evaluate all configured criteria
    const evaluation = evaluateCriteria(
      criteriaData,
      EXERCISE_BALANCE_CRITERIA_CONFIG
    );

    // Get primary recommendation
    const primaryRecommendation = evaluation.recommendations[0];

    return {
      compoundPercentage,
      isolationPercentage,
      totalExercises: total,
      uniqueExercises,
      score: evaluation.finalScore,
      recommendation: primaryRecommendation,
    };
  }, [program, currentWeek, userLevel, objective, queryClient]);
};
