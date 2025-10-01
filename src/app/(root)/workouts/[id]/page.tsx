import { PageTitle } from "@/components/layout/page/page-title";
import { getWorkoutById } from "../_actions/getWorkoutById.action";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await getWorkoutById(id);

  return (
    <div>
      <PageTitle title="New workout" />
    </div>
  );
}
