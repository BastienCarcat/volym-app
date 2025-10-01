import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../../lib/tanstack/query-keys";
import type { MutationOptions, QueryOptions } from "../../../../lib/tanstack/types";
import { Workout } from "@/generated/prisma";
import { resolveActionResult } from "@/lib/utils";
import { createWorkout } from "../_actions/createWorkout.action";
import { getWorkouts } from "../_actions/getWorkouts.action";
import { z } from "zod";
import { createWorkoutSchema } from "../_schemas/createWorkout.schema";

type CreateWorkoutDto = z.infer<typeof createWorkoutSchema>;

export function useGetWorkouts(
  options?: QueryOptions<Workout[]>
) {
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
