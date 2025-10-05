"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { addExerciseSet } from "../../_actions/exerciseSet/addExerciseSet.action";
import { updateExerciseSet } from "../../_actions/exerciseSet/updateExerciseSet.action";
import { removeExerciseSet } from "../../_actions/exerciseSet/removeExerciseSet.action";
import { useCallback, useRef } from "react";
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
  sets: SetData[];
}

interface SetData {
  id: string;
  weight?: number | null;
  reps?: number | null;
  rest?: number | null;
  order: number;
  type?: "WarmUp" | "Normal" | "DropsSet" | "Failure";
  rpe?: number | null;
}

export function useAddExerciseSet(workoutId: string) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (setData: {
      workoutExerciseId: string;
      order: number;
      weight?: number;
      reps?: number;
      rest?: number;
      type?: "WarmUp" | "Normal" | "DropsSet" | "Failure";
      rpe?: number;
    }) => {
      return await resolveActionResult<SetData>(addExerciseSet(setData));
    },
    onMutate: async (setData) => {
      const previousWorkout = queryClient.getQueryData<WorkoutData>([
        "workout",
        workoutId,
      ]);

      const tempSet = {
        id: `temp-set-${Date.now()}`,
        weight: setData.weight || null,
        reps: setData.reps || null,
        rest: setData.rest || null,
        order: setData.order,
        type: setData.type || "Normal",
        rpe: setData.rpe || null,
      };

      queryClient.setQueryData<WorkoutData>(["workout", workoutId], (old) => {
        if (!old) return old;
        return {
          ...old,
          exercises: (old.exercises || []).map((ex) => {
            if (ex.id === setData.workoutExerciseId) {
              return {
                ...ex,
                sets: [...ex.sets, tempSet],
              };
            }
            return ex;
          }),
        };
      });

      return { previousWorkout, tempSetId: tempSet.id };
    },
    onError: (error, _variables, context) => {
      console.error("Failed to add set:", error);
      if (context?.previousWorkout) {
        queryClient.setQueryData(
          ["workout", workoutId],
          context.previousWorkout
        );
      }
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<WorkoutData>(["workout", workoutId], (old) => {
        if (!old) return old;
        return {
          ...old,
          exercises: (old.exercises || []).map((ex) => {
            if (ex.id === variables.workoutExerciseId) {
              return {
                ...ex,
                sets: ex.sets.map((set) =>
                  set.id === context?.tempSetId ? data : set
                ),
              };
            }
            return ex;
          }),
        };
      });
    },
  });

  return {
    addSet: mutate,
    isAdding: isPending,
  };
}

export function useUpdateExerciseSet(workoutId: string) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (setData: {
      id: string;
      weight?: number;
      reps?: number;
      rest?: number;
      type?: "WarmUp" | "Normal" | "DropsSet" | "Failure";
      rpe?: number;
    }) => {
      return await resolveActionResult<SetData>(updateExerciseSet(setData));
    },
    onSuccess: (data) => {
      queryClient.setQueryData<WorkoutData>(["workout", workoutId], (old) => {
        if (!old) return old;
        return {
          ...old,
          exercises: (old.exercises || []).map((ex) => ({
            ...ex,
            sets: ex.sets.map((set) => (set.id === data.id ? data : set)),
          })),
        };
      });
    },
    onError: (error) => {
      console.error("Failed to update set:", error);
      queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
    },
  });

  const updateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const updateSetOptimistic = useCallback(
    (
      setId: string,
      data: {
        weight?: number;
        reps?: number;
        rest?: number;
        type?: "WarmUp" | "Normal" | "DropsSet" | "Failure";
        rpe?: number;
      }
    ) => {
      // Clear previous timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Optimistic update
      queryClient.setQueryData<WorkoutData>(["workout", workoutId], (old) => {
        if (!old) return old;
        return {
          ...old,
          exercises: (old.exercises || []).map((ex) => ({
            ...ex,
            sets: ex.sets.map((set) =>
              set.id === setId ? { ...set, ...data } : set
            ),
          })),
        };
      });

      // Debounced server update
      updateTimeoutRef.current = setTimeout(() => {
        mutate({ id: setId, ...data });
      }, 300);
    },
    [workoutId, queryClient, mutate]
  );

  return {
    updateSet: updateSetOptimistic,
    isUpdating: isPending,
  };
}

export function useRemoveExerciseSet(workoutId: string) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (setId: string) => {
      await resolveActionResult(removeExerciseSet({ id: setId }));
      return setId;
    },
    onMutate: async (setId) => {
      const previousWorkout = queryClient.getQueryData<WorkoutData>([
        "workout",
        workoutId,
      ]);

      queryClient.setQueryData<WorkoutData>(["workout", workoutId], (old) => {
        if (!old) return old;
        return {
          ...old,
          exercises: (old.exercises || []).map((ex) => ({
            ...ex,
            sets: ex.sets.filter((set) => set.id !== setId),
          })),
        };
      });

      return { previousWorkout };
    },
    onError: (error, _variables, context) => {
      console.error("Failed to remove set:", error);
      if (context?.previousWorkout) {
        queryClient.setQueryData(
          ["workout", workoutId],
          context.previousWorkout
        );
      }
    },
  });

  return {
    removeSet: mutate,
    isRemoving: isPending,
  };
}
