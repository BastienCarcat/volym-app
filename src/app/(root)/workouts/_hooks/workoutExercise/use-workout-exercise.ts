"use client";

import { addWorkoutExercise } from "../../_actions/workoutExercise/addWorkoutExercise.action";
import { removeWorkoutExercise } from "../../_actions/workoutExercise/removeWorkoutExercise.action";
import { updateWorkoutExercise } from "../../_actions/workoutExercise/updateWorkoutExercise.action";
import { resolveActionResult } from "@/lib/utils";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";

interface WorkoutData {
  id: string;
  name: string;
  note?: string | null;
  exercises?: ExerciseData[];
}

interface ExerciseData {
  id: string;
  workoutId: string;
  exerciseId: string;
  order: number;
  note?: string | null;
  sets: SetData[];
}

interface SetData {
  id: string;
  weight?: number | null;
  reps?: number | null;
  rest?: number | null;
  order: number;
}

export function useAddWorkoutExercise(workoutId: string) {
  return useOptimisticMutation<
    WorkoutData,
    { exerciseId: string; order: number },
    ExerciseData
  >({
    queryKey: ["workout", workoutId],
    mutationFn: async (variables) =>
      resolveActionResult(addWorkoutExercise({ workoutId, ...variables })),

    getOptimisticUpdate: (old, { exerciseId, order }) => {
      if (!old) return old;
      const tempExercise: ExerciseData = {
        id: `temp-${exerciseId}`,
        workoutId,
        exerciseId,
        order,
        note: "",
        sets: [
          {
            id: `temp-set-${Date.now()}`,
            order: 1,
            weight: null,
            reps: null,
            rest: null,
          },
        ],
      };
      return {
        ...old,
        exercises: [...(old.exercises || []), tempExercise],
      };
    },
    getSuccessUpdate: (old, serverResult, params) => {
      if (!old) return old;
      return {
        ...old,
        exercises: (old.exercises || []).map((ex) =>
          ex.id.startsWith("temp-") && ex.exerciseId === params.exerciseId
            ? serverResult
            : ex
        ),
      };
    },
  });
}

export function useRemoveWorkoutExercise(workoutId: string) {
  return useOptimisticMutation<
    WorkoutData,
    string, // exerciseId
    { id: string }
  >({
    queryKey: ["workout", workoutId],
    mutationFn: (exerciseId) =>
      resolveActionResult(removeWorkoutExercise({ id: exerciseId })),
    getOptimisticUpdate: (old, exerciseId) => {
      if (!old) return old;
      return {
        ...old,
        exercises: (old.exercises || []).filter((ex) => ex.id !== exerciseId),
      };
    },
    // We don't need realistic update because element is already deleted
  });
}

export function useUpdateWorkoutExercise(workoutId: string) {
  return useOptimisticMutation<
    WorkoutData,
    { id: string; note?: string; order?: number },
    ExerciseData
  >({
    queryKey: ["workout", workoutId],
    mutationFn: async (exerciseData) =>
      resolveActionResult(updateWorkoutExercise(exerciseData)),
    getOptimisticUpdate: (old, variables) => {
      if (!old) return old;
      return {
        ...old,
        exercises: (old.exercises || []).map((ex) =>
          ex.id === variables.id
            ? {
                ...ex,
                note: variables.note !== undefined ? variables.note : ex.note,
                order:
                  variables.order !== undefined ? variables.order : ex.order,
              }
            : ex
        ),
      };
    },
    getSuccessUpdate: (old, serverResult) => {
      if (!old) return old;
      return {
        ...old,
        exercises: (old.exercises || []).map((ex) =>
          ex.id === serverResult.id ? serverResult : ex
        ),
      };
    },
  });
}

// export function useReorderWorkoutExercises(workoutId: string) {
//   return useOptimisticMutation<
//     WorkoutData,
//     { exercises: { id: string; order: number }[] }
//   >({
//     queryKey: queryKeys.workouts.detail(workoutId),
//     mutationFn: async ({ exercises }) =>
//       resolveActionResult(reorderWorkoutExercises({ workoutId, exercises })),

//     getOptimisticUpdate: (old, { exercises }) => {
//       if (!old) return old;
//       const orderMap = Object.fromEntries(
//         exercises.map((ex) => [ex.id, ex.order])
//       );
//       return {
//         ...old,
//         exercises: (old.exercises || []).map((ex) => ({
//           ...ex,
//           order: orderMap[ex.id] ?? ex.order,
//         })),
//       };
//     },
//     getSuccessUpdate: (old, newData) => newData,
//   });
// }
