"use client";

import { useEffect } from "react";
import { ExerciseCard } from "./ExerciseCard";
import { AddExerciseSection } from "./AddExerciseSection";
import { useWorkoutStore } from "../_stores/workout-store";
import { Separator } from "@/components/ui/separator";
import type { Exercise } from "../types";
import { cn } from "@/lib/utils";

interface WorkoutExercisesListProps {
  workoutId: string;
}

export function WorkoutExercisesList({ workoutId }: WorkoutExercisesListProps) {
  const { exercises, addExercise, removeExercise, setWorkoutId, isLoading, lastSaved } =
    useWorkoutStore();

  // Initialize the workout ID when component mounts
  useEffect(() => {
    setWorkoutId(workoutId);
  }, [workoutId, setWorkoutId]);

  const handleExerciseAdd = (exercise: Exercise) => {
    addExercise(exercise);
  };

  const handleExerciseRemove = (exerciseId: string) => {
    removeExercise(exerciseId);
  };

  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Auto-save status indicator */}
      {isLoading && (
        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 mb-4 rounded-md">
          💾 Saving workout...
        </div>
      )}

      {lastSaved && !isLoading && (
        <div className="text-sm text-green-600 bg-green-50 px-3 py-2 mb-4 rounded-md">
          ✅ Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Exercise Cards */}
      {exercises.map((exercise, index) => (
        <div key={exercise.id} className="relative">
          <ExerciseCard
            id={exercise.id}
            name={exercise.name}
            image={exercise.image}
            targetMuscles={exercise.targetMuscles}
            secondaryMuscles={exercise.secondaryMuscles}
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
      ))}

      {/* Vertical dashed line before add exercise button */}
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
