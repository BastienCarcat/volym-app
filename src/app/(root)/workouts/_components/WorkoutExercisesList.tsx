"use client";

import { useEffect } from "react";
import { ExerciseCard } from "./ExerciseCard";
import { AddExerciseSection } from "./AddExerciseSection";
import { useWorkoutStore } from "../_stores/workout-store";
import type { Exercise } from "../types";

interface WorkoutExercisesListProps {
  workoutId: string;
}

export function WorkoutExercisesList({ workoutId }: WorkoutExercisesListProps) {
  const { exercises, addExercise, setWorkoutId, isLoading, lastSaved } = useWorkoutStore();

  // Initialize the workout ID when component mounts
  useEffect(() => {
    setWorkoutId(workoutId);
  }, [workoutId, setWorkoutId]);

  const handleExerciseAdd = (exercise: Exercise) => {
    addExercise(exercise);
  };

  return (
    <div className="space-y-6">
      {/* Auto-save status indicator */}
      {isLoading && (
        <div className="px-24">
          <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
            💾 Saving workout...
          </div>
        </div>
      )}
      
      {lastSaved && !isLoading && (
        <div className="px-24">
          <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
            ✅ Last saved: {lastSaved.toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Exercise Cards */}
      {exercises.map((exercise) => (
        <div key={exercise.id} className="px-24">
          <ExerciseCard
            id={exercise.id}
            name={exercise.name}
            bodyPart={exercise.bodyPart}
            image={exercise.image}
            equipment={exercise.equipment}
            targetMuscles={exercise.targetMuscles}
            secondaryMuscles={exercise.secondaryMuscles}
          />
        </div>
      ))}
      
      {/* Add Exercise Button - always below cards */}
      <AddExerciseSection onExerciseAdd={handleExerciseAdd} />
    </div>
  );
}