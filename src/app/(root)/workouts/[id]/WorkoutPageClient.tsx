"use client";

import { PageTitle } from "@/components/layout/page/page-title";
import { WorkoutExercisesList } from "../_components/WorkoutExercisesList";
import { useUpdateWorkout } from "../_hooks/workout";
import { useQueryClient } from "@tanstack/react-query";
import type { Workout, WorkoutExercise, ExerciseSet } from "@/generated/prisma";

interface WorkoutWithRelations extends Workout {
  exercises: (WorkoutExercise & {
    sets: ExerciseSet[];
  })[];
}

interface WorkoutPageClientProps {
  workoutId: string;
  initialWorkout: WorkoutWithRelations;
}

export function WorkoutPageClient({ workoutId, initialWorkout }: WorkoutPageClientProps) {
  const queryClient = useQueryClient();
  const { updateWorkout, isUpdating } = useUpdateWorkout(workoutId);

  // Initialize the query cache with the initial data
  queryClient.setQueryData(["workout", workoutId], initialWorkout);

  const handleTitleChange = (name: string) => {
    updateWorkout({ name });
  };

  const handleDescriptionChange = (note: string) => {
    updateWorkout({ note });
  };

  return (
    <div>
      <PageTitle 
        title={initialWorkout.name} 
        description={initialWorkout.note || ""}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
      />
      <WorkoutExercisesList workoutId={workoutId} />
      {isUpdating && (
        <div className="fixed bottom-4 right-4 bg-muted px-3 py-2 rounded-md text-sm">
          Saving...
        </div>
      )}
    </div>
  );
}