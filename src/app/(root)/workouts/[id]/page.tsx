import { getWorkoutById } from "../_actions/get-workout-by-id.action";
import WorkoutEditorPage from "../_components/WorkoutEditor";
import React from "react";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await getWorkoutById(id);

  return <WorkoutEditorPage workout={workout} />;
}
