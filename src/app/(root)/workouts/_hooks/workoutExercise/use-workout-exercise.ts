"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { addWorkoutExercise } from "../../_actions/workoutExercise/addWorkoutExercise.action";
import { removeWorkoutExercise } from "../../_actions/workoutExercise/removeWorkoutExercise.action";
import { reorderWorkoutExercises } from "../../_actions/workoutExercise/reorderWorkoutExercises.action";
import { updateWorkoutExercise } from "../../_actions/workoutExercise/updateWorkoutExercise.action";
import { resolveActionResult } from "@/lib/utils";

interface WorkoutData {
  id: string;
  name: string;
  note?: string | null;
  exercises?: ExerciseData[];
}

interface ExerciseData {
  id: string;
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
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (exerciseData: {
      workoutId: string;
      exerciseId: string;
      order: number;
    }) => {
      return await resolveActionResult<ExerciseData>(
        addWorkoutExercise(exerciseData)
      );
    },
    onMutate: async (exerciseData) => {
      const previousWorkout = queryClient.getQueryData<WorkoutData>([
        "workout",
        workoutId,
      ]);

      const tempExercise = {
        id: `temp-${exerciseData.exerciseId}`,
        exerciseId: exerciseData.exerciseId,
        order: exerciseData.order,
        note: null,
        sets: [
          {
            id: `temp-set-${Date.now()}`,
            weight: null,
            reps: null,
            rest: null,
            order: 0,
            type: "Normal",
            rpe: null,
          },
        ],
      };

      queryClient.setQueryData<WorkoutData>(["workout", workoutId], (old) => {
        if (!old) return old;
        return {
          ...old,
          exercises: [...(old.exercises || []), tempExercise],
        };
      });

      return { previousWorkout };
    },
    onError: (error, _variables, context) => {
      console.error("Failed to add exercise:", error);
      if (context?.previousWorkout) {
        queryClient.setQueryData(
          ["workout", workoutId],
          context.previousWorkout
        );
      }
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData<WorkoutData>(["workout", workoutId], (old) => {
        if (!old) return old;
        return {
          ...old,
          exercises: (old.exercises || []).map((ex) =>
            ex.id === `temp-${variables.exerciseId}` ? data : ex
          ),
        };
      });
    },
  });

  return {
    addExercise: mutate,
    isAdding: isPending,
  };
}

export function useRemoveWorkoutExercise(workoutId: string) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (exerciseId: string) => {
      await resolveActionResult(removeWorkoutExercise({ id: exerciseId }));

      return exerciseId;
    },
    onMutate: async (exerciseId) => {
      const previousWorkout = queryClient.getQueryData<WorkoutData>([
        "workout",
        workoutId,
      ]);

      queryClient.setQueryData<WorkoutData>(["workout", workoutId], (old) => {
        if (!old) return old;
        return {
          ...old,
          exercises: (old.exercises || []).filter((ex) => ex.id !== exerciseId),
        };
      });

      return { previousWorkout };
    },
    onError: (error, _variables, context) => {
      console.error("Failed to remove exercise:", error);
      if (context?.previousWorkout) {
        queryClient.setQueryData(
          ["workout", workoutId],
          context.previousWorkout
        );
      }
    },
  });

  return {
    removeExercise: mutate,
    isRemoving: isPending,
  };
}

export function useReorderWorkoutExercises(workoutId: string) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (exerciseOrders: { id: string; order: number }[]) => {
      await resolveActionResult(
        reorderWorkoutExercises({
          workoutId,
          exerciseOrders,
        })
      );

      return exerciseOrders;
    },
    onMutate: async (exerciseOrders) => {
      const previousWorkout = queryClient.getQueryData<WorkoutData>([
        "workout",
        workoutId,
      ]);

      queryClient.setQueryData<WorkoutData>(["workout", workoutId], (old) => {
        if (!old) return old;

        const reorderedExercises = [...(old.exercises || [])];
        exerciseOrders.forEach(({ id, order }) => {
          const index = reorderedExercises.findIndex((ex) => ex.id === id);
          if (index !== -1) {
            reorderedExercises[index] = { ...reorderedExercises[index], order };
          }
        });

        reorderedExercises.sort((a, b) => a.order - b.order);

        return { ...old, exercises: reorderedExercises };
      });

      return { previousWorkout };
    },
    onError: (error, _variables, context) => {
      console.error("Failed to reorder exercises:", error);
      if (context?.previousWorkout) {
        queryClient.setQueryData(
          ["workout", workoutId],
          context.previousWorkout
        );
      }
    },
  });

  return {
    reorderExercises: mutate,
    isReordering: isPending,
  };
}

export function useUpdateWorkoutExercise(workoutId: string) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (exerciseData: {
      id: string;
      note?: string;
      order?: number;
    }) => {
      return await resolveActionResult<ExerciseData>(
        updateWorkoutExercise(exerciseData)
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData<WorkoutData>(["workout", workoutId], (old) => {
        if (!old) return old;
        return {
          ...old,
          exercises: (old.exercises || []).map((ex) =>
            ex.id === data.id ? { ...ex, ...data } : ex
          ),
        };
      });
    },
    onError: (error) => {
      console.error("Failed to update workout exercise:", error);
      queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
    },
  });

  return {
    updateWorkoutExercise: mutate,
    isUpdating: isPending,
  };
}
