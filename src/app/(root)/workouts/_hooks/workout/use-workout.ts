"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateWorkout } from "../../_actions/workout/updateWorkout.action";
import { createWorkout } from "../../_actions/workout/createWorkout.action";
import { getWorkouts } from "../../_actions/workout/getWorkouts.action";
import { getWorkoutById } from "../../_actions/workout/getWorkoutById.action";
import { queryKeys } from "../../../../../lib/tanstack/query-keys";
import type {
  MutationOptions,
  QueryOptions,
} from "../../../../../lib/tanstack/types";
import { Workout } from "@/generated/prisma";
import { resolveActionResult } from "@/lib/utils";
import { z } from "zod";
import { createWorkoutSchema } from "../../_schemas/createWorkout.schema";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";

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
  return useOptimisticMutation<
    WorkoutData,
    { name?: string; note?: string },
    WorkoutData
  >({
    mutationFn: async (data) => {
      return resolveActionResult(updateWorkout({ id: workoutId, ...data }));
    },
    queryKey: ["workout", workoutId],
    getOptimisticUpdate: (oldData, variables) => {
      if (!oldData) return oldData;
      return { ...oldData, ...variables };
    },
    getSuccessUpdate: (_oldData, newData) => newData,
  });
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
