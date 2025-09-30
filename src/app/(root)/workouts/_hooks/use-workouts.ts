import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../../lib/tanstack/query-keys";
import type { MutationOptions } from "../../../../lib/tanstack/types";
import { Workout } from "@/generated/prisma";
import { resolveActionResult } from "@/lib/utils";
import { createWorkout } from "../_actions/createWorkout.action";

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
