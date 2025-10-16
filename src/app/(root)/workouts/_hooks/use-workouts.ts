import { upfetch } from "@/lib/up-fetch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { workoutWithExercisesSchema } from "../schemas";

const workoutListItemSchema = z.object({
  id: z.uuidv4(),
  name: z.string(),
  note: z.string().nullable(),
});

export type Workout = z.infer<typeof workoutListItemSchema>;
export type WorkoutWithExercises = z.infer<typeof workoutWithExercisesSchema>;

// Fetch operations

const fetchWorkouts = async () => {
  const result = await upfetch(`/api/workouts/`, {
    schema: z.object({
      workouts: z.array(workoutListItemSchema),
    }),
  });
  return result;
};

const fetchWorkoutById = async (workoutId: string) => {
  const result = await upfetch(`/api/workouts/${workoutId}`, {
    schema: z.object({
      workout: workoutWithExercisesSchema,
    }),
  });
  return result.workout;
};

// useQueries

export const useWorkouts = () => {
  const query = useQuery({
    queryKey: ["workouts"],
    queryFn: async () => {
      return fetchWorkouts();
    },
  });

  return query;
};

export const useWorkout = (workoutId: string) => {
  const query = useQuery({
    queryKey: ["workout", workoutId],
    queryFn: () => fetchWorkoutById(workoutId),
  });

  return query;
};

export const useRefreshWorkouts = () => {
  const queryClient = useQueryClient();

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["workouts"] });
  };

  return refresh;
};

// Cache handlers

export const prefetchWorkout = async (
  queryClient: ReturnType<typeof useQueryClient>,
  workoutId: string
) => {
  await queryClient.prefetchQuery({
    queryKey: ["workout", workoutId],
    queryFn: () => fetchWorkoutById(workoutId),
  });
};

export const useRefreshWorkout = () => {
  const queryClient = useQueryClient();

  const refresh = (workoutId: string) => {
    void queryClient.invalidateQueries({ queryKey: ["workout", workoutId] });
  };

  return refresh;
};

export const useUpdateWorkoutCache = () => {
  const queryClient = useQueryClient();

  const updateCache = (workoutId: string, data: WorkoutWithExercises) => {
    queryClient.setQueryData(["workout", workoutId], data);
  };

  return updateCache;
};
