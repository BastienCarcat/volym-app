import WorkoutEditorPage from "../_components/WorkoutEditor";
import React from "react";
import { prefetchWorkout } from "../_hooks/use-workouts";
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

  await prefetchWorkout(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkoutEditorPage workoutId={id} />
    </HydrationBoundary>
  );
}
