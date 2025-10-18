import { upfetch } from "@/lib/up-fetch";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { z } from "zod";
import type { BodyPart, GymFitExercise, GymFitMinimalExercise } from "../types";
import { queryKeys } from "@/lib/tanstack/query-keys";
import { gymFitMinimalExerciseSchema, gymFitExerciseSchema } from "../schemas";

interface FetchExercisesParams {
  bodyPart?: BodyPart;
  query?: string;
  equipment?: string;
  offset?: number;
  number?: number;
}

const fetchExercises = async (params: FetchExercisesParams) => {
  const searchParams = new URLSearchParams();

  if (params.bodyPart) searchParams.append("bodyPart", params.bodyPart);
  if (params.query) searchParams.append("query", params.query);
  if (params.equipment) searchParams.append("equipment", params.equipment);
  if (params.offset !== undefined)
    searchParams.append("offset", params.offset.toString());
  if (params.number !== undefined)
    searchParams.append("number", params.number.toString());

  const url = `/api/exercises/search${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const result = await upfetch(url, {
    schema: z.object({ exercises: z.array(gymFitMinimalExerciseSchema) }),
  });

  return result;
};

interface UseExercisesParams {
  bodyPart?: BodyPart;
  query?: string;
  equipment?: string;
  pageSize?: number;
}

export const useExercises = (params: UseExercisesParams = {}) => {
  const { bodyPart, query, equipment, pageSize = 20 } = params;

  return useInfiniteQuery({
    queryKey: queryKeys.exercises.list({
      bodyPart,
      query,
      equipment,
      number: pageSize,
    }),
    queryFn: ({ pageParam = 0 }) => {
      const data = fetchExercises({
        bodyPart,
        query,
        equipment,
        offset: pageParam,
        number: pageSize,
      });
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce(
        (acc, page) => acc + (page.exercises?.length ?? 0),
        0
      );

      if (!lastPage.exercises || lastPage.exercises.length === 0) {
        return undefined;
      }

      if (lastPage.exercises.length < pageSize) {
        return undefined;
      }

      if (totalLoaded >= 300) {
        return undefined;
      }

      return totalLoaded;
    },
    initialPageParam: 0,
  });
};

export const useAllExercises = (params: UseExercisesParams = {}) => {
  const query = useExercises(params);

  const exercises: GymFitMinimalExercise[] =
    query.data?.pages.flatMap((page) => page.exercises) ?? [];

  return {
    ...query,
    exercises,
  };
};

const fetchExercise = async (exerciseId: string) => {
  const url = `/api/exercises/${exerciseId}`;
  const result = await upfetch(url, {
    schema: z.object({ exercise: gymFitExerciseSchema }),
  });
  return result.exercise;
};

export const useExercise = (exerciseId: string) => {
  return useQuery({
    queryKey: queryKeys.exercises.detail(exerciseId),
    queryFn: () => fetchExercise(exerciseId),
    enabled: !!exerciseId,
    // Allow stale data to be shown while refetching
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    // Determine if data is stale based on whether it has full details
    staleTime: (query) => {
      const data = query.state.data as
        | GymFitExercise
        | GymFitMinimalExercise
        | undefined;
      // If data doesn't have targetMuscles, it's MinimalExercise -> stale immediately
      if (data && !("targetMuscles" in data)) {
        return 0;
      }

      return Infinity;
    },
  });
};

// Prefetch multiple exercises in parallel (server-side)
export const prefetchExercises = async (
  queryClient: any,
  exerciseIds: string[]
) => {
  // Prefetch all exercises in parallel
  await Promise.all(
    exerciseIds.map((exerciseId) =>
      queryClient.prefetchQuery({
        queryKey: queryKeys.exercises.detail(exerciseId),
        queryFn: () => fetchExercise(exerciseId),
      })
    )
  );
};

// Hook to manage exercise cache
export const useExerciseCache = () => {
  const queryClient = useQueryClient();

  // Set minimal exercise data in cache immediately
  const setExerciseCache = (exercise: GymFitMinimalExercise) => {
    queryClient.setQueryData(queryKeys.exercises.detail(exercise.id), exercise);
  };

  return { setExerciseCache };
};
