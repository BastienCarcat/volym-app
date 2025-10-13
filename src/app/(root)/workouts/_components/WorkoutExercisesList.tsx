"use client";

import { useQuery } from "@tanstack/react-query";
import { ExerciseCard } from "./ExerciseCard";
import { AddExerciseSection } from "./AddExerciseSection";
import {
  useAddWorkoutExercise,
  useRemoveWorkoutExercise,
} from "../_hooks/workoutExercise";
import { Separator } from "@/components/ui/separator";
import type { Exercise } from "../types";
import { cn } from "@/lib/utils";
import mockExercises from "../mockData";
import { useMemo } from "react";

interface WorkoutExercisesListProps {
  workoutId: string;
}

interface WorkoutData {
  exercises: Array<{
    id: string;
    exerciseId: string;
    note?: string | null;
    sets: any[];
  }>;
}

export function WorkoutExercisesList({ workoutId }: WorkoutExercisesListProps) {
  const { data: workout } = useQuery<WorkoutData>({
    queryKey: ["workout", workoutId],
    queryFn: () => Promise.resolve({} as WorkoutData),
    enabled: false,
    initialData: undefined,
  });

  const { mutate: addExercise, isPending: isAdding } =
    useAddWorkoutExercise(workoutId);
  const { mutate: removeExercise, isPending: isRemoving } =
    useRemoveWorkoutExercise(workoutId);

  const exercises = useMemo(() => {
    return workout?.exercises || [];
  }, [workout]);

  const handleExerciseAdd = (exercise: Exercise) => {
    const newOrder = exercises.length;

    addExercise({
      exerciseId: exercise.id,
      order: newOrder,
    });
  };

  const handleExerciseRemove = (exerciseId: string) => {
    removeExercise(exerciseId);
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      {(isAdding || isRemoving) && (
        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 mb-4 rounded-md">
          💾 Saving workout...
        </div>
      )}

      {exercises.map((exercise: any, index: number) => {
        const exerciseData = mockExercises.find(
          (ex) => ex.id === exercise.exerciseId
        );

        return (
          <div key={exercise.id} className="relative">
            <ExerciseCard
              workoutExerciseId={exercise.id}
              exerciseId={exercise.exerciseId}
              name={exerciseData?.name || exercise.exerciseId}
              image={exerciseData?.image}
              targetMuscles={exerciseData?.targetMuscles || []}
              secondaryMuscles={exerciseData?.secondaryMuscles || []}
              sets={exercise.sets}
              note={exercise.note || ""}
              workoutId={workoutId}
              onDelete={() => handleExerciseRemove(exercise.id)}
            />
            {index < exercises.length - 1 && (
              <div className="flex justify-center my-4">
                <Separator
                  variant="dashed"
                  orientation="vertical"
                  className="h-8"
                />
              </div>
            )}
          </div>
        );
      })}

      {exercises.length > 0 && (
        <div className="flex justify-center my-4">
          <Separator variant="dashed" orientation="vertical" className="h-8" />
        </div>
      )}
      <div
        className={cn("mb-10", {
          "mt-10": exercises.length === 0,
        })}
      >
        <AddExerciseSection onExerciseAdd={handleExerciseAdd} />
      </div>
    </div>
  );
}
