"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { updateWorkout } from "../../_actions/workout/updateWorkout.action";
import { createWorkout } from "../../_actions/workout/createWorkout.action";
import { getWorkouts } from "../../_actions/workout/getWorkouts.action";
import { queryKeys } from "../../../../../lib/tanstack/query-keys";
import type {
  MutationOptions,
  QueryOptions,
} from "../../../../../lib/tanstack/types";
import { Workout } from "@/generated/prisma";
import { resolveActionResult } from "@/lib/utils";
import { z } from "zod";
import { createWorkoutSchema } from "../../_schemas/createWorkout.schema";
import { useCallback, useRef } from "react";

type CreateWorkoutDto = z.infer<typeof createWorkoutSchema>;

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
}

export function useUpdateWorkout(workoutId: string) {
  const queryClient = useQueryClient();

  const { execute, isExecuting } = useAction(updateWorkout, {
    onSuccess: ({ data }) => {
      queryClient.setQueryData(["workout", workoutId], data);
    },
    onError: (error) => {
      console.error("Failed to update workout:", error);
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
    },
  });

  const updateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const updateWorkoutOptimistic = useCallback(
    (data: { name?: string; note?: string }) => {
      // Clear previous timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Optimistic update
      queryClient.setQueryData(
        ["workout", workoutId],
        (old: WorkoutData | undefined) => {
          if (!old) return old;
          return { ...old, ...data };
        }
      );

      // Debounced server update
      updateTimeoutRef.current = setTimeout(() => {
        if (data.name !== undefined || data.note !== undefined) {
          const updatePayload: { id: string; name?: string; note?: string } = {
            id: workoutId,
          };

          if (data.name !== undefined) {
            updatePayload.name = data.name;
          }

          if (data.note !== undefined) {
            updatePayload.note = data.note;
          }

          execute(updatePayload);
        }
      }, 500);
    },
    [workoutId, queryClient, execute]
  );

  return {
    updateWorkout: updateWorkoutOptimistic,
    isUpdating: isExecuting,
  };
}

export function useGetWorkouts(options?: QueryOptions<Workout[]>) {
  return useQuery({
    queryKey: queryKeys.workouts.lists(),
    queryFn: async (): Promise<Workout[]> => {
      return resolveActionResult(getWorkouts());
    },
    ...options,
  });
}

export function useCreateWorkout(
  options?: MutationOptions<Workout, CreateWorkoutDto>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (props: CreateWorkoutDto): Promise<Workout> => {
      return resolveActionResult(createWorkout(props));
    },
    onSuccess: (data: Workout) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.lists() });
      queryClient.setQueryData(queryKeys.workouts.detail(data.id), data);
    },
    ...options,
  });
}
