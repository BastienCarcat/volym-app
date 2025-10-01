import { PageTitle } from "@/components/layout/page/page-title";
import type { Workout, WorkoutExercise, ExerciseSet } from "@/generated/prisma";

type WorkoutWithExercises = Workout & {
  exercises: (WorkoutExercise & {
    sets: ExerciseSet[];
  })[];
};

interface WorkoutServerDetailProps {
  workout: WorkoutWithExercises;
}

export function WorkoutServerDetail({ workout }: WorkoutServerDetailProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <PageTitle title={workout.name} />
        {workout.note && (
          <p className="text-muted-foreground">{workout.note}</p>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Exercises</h3>
        
        {workout.exercises && workout.exercises.length > 0 ? (
          <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
              <div key={exercise.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Exercise {index + 1}</h4>
                  <span className="text-sm text-muted-foreground">
                    Order: {exercise.order}
                  </span>
                </div>
                
                {exercise.note && (
                  <p className="text-sm text-muted-foreground">{exercise.note}</p>
                )}
                
                {exercise.sets && exercise.sets.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Sets</h5>
                    <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground">
                      <span>Set</span>
                      <span>Weight</span>
                      <span>Reps</span>
                      <span>Rest</span>
                    </div>
                    {exercise.sets.map((set, setIndex) => (
                      <div key={set.id} className="grid grid-cols-4 gap-2 text-sm">
                        <span>{setIndex + 1}</span>
                        <span>{set.weight ? `${set.weight}kg` : '-'}</span>
                        <span>{set.reps || '-'}</span>
                        <span>{set.rest ? `${set.rest}s` : '-'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No exercises added to this workout yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}