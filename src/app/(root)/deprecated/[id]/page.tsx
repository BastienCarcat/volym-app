import { WorkoutPageClient } from "./WorkoutPageClient";
import { getWorkoutById } from "../_actions/workout/getWorkoutById.action";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await getWorkoutById(id);

  return <WorkoutPageClient initialWorkout={workout} />;
}
