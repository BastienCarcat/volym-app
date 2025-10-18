import WorkoutEditorPage from "../_components/WorkoutEditor";
import React from "react";
import { prefetchWorkout } from "../_hooks/use-workouts";
import { prefetchExercises } from "../_hooks/use-exercises";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const queryClient = new QueryClient();

  // 1. Prefetch the workout first
  await prefetchWorkout(queryClient, id);

  // 2. Get the workout data from cache to extract exercise IDs
  const workout = queryClient.getQueryData(["workout", id]) as any;

  // 3. Prefetch all exercises in parallel
  if (workout?.exercises && workout.exercises.length > 0) {
    const exerciseIds = workout.exercises.map(
      (ex: any) => ex.exerciseId
    ) as string[];
    await prefetchExercises(queryClient, exerciseIds);
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkoutEditorPage workoutId={id} />
    </HydrationBoundary>
  );
}
