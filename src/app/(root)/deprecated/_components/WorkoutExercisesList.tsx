"use client";

import { ExerciseCard } from "./ExerciseCard";
import { AddExerciseSection } from "./AddExerciseSection";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Exercise } from "../types";
import type { WorkoutData, ExerciseData } from "../[id]/WorkoutPageClient";

// Données mock des exercices (à terme, à récupérer depuis une API)
const mockExercises: Exercise[] = [
  {
    id: "1",
    name: "Bench Press (Barbell)",
    bodyPart: "Chest",
    image: "/barbell_bench_press.png",
    equipment: "Barbell",
    targetMuscles: [
      {
        id: "ffd76ee8-7633-4062-9c91-9092d637567a",
        name: "Pectoralis major",
        bodyPart: "Chest",
        group: null,
      },
    ],
    secondaryMuscles: [
      {
        id: "dec5954e-80b5-493b-8911-a73ef54d96ee",
        name: "Triceps brachii",
        bodyPart: "Arms",
        group: null,
      },
      {
        id: "d0f075f6-831c-43b9-9749-15e1b74987be",
        name: "Deltoid",
        bodyPart: "Shoulders",
        group: null,
      },
    ],
  },
  {
    id: "2",
    name: "Squat (Barbell)",
    bodyPart: "Legs",
    image: "/barbell_bench_press.png",
    equipment: "Barbell",
    targetMuscles: [
      {
        id: "quad-1",
        name: "Quadriceps",
        bodyPart: "Legs",
        group: null,
      },
      {
        id: "glutes-1",
        name: "Glutes",
        bodyPart: "Legs",
        group: null,
      },
    ],
    secondaryMuscles: [
      {
        id: "ham-1",
        name: "Hamstrings",
        bodyPart: "Legs",
        group: null,
      },
    ],
  },
  {
    id: "3",
    name: "Deadlift (Barbell)",
    bodyPart: "Back",
    image: "/barbell_bench_press.png",
    equipment: "Barbell",
    targetMuscles: [
      {
        id: "ham-1",
        name: "Hamstrings",
        bodyPart: "Legs",
        group: null,
      },
      {
        id: "glutes-1",
        name: "Glutes",
        bodyPart: "Legs",
        group: null,
      },
    ],
    secondaryMuscles: [
      {
        id: "erector-1",
        name: "Erector Spinae",
        bodyPart: "Back",
        group: null,
      },
    ],
  },
  {
    id: "4",
    name: "Overhead Press (Barbell)",
    bodyPart: "Shoulders",
    image: "/barbell_bench_press.png",
    equipment: "Barbell",
    targetMuscles: [
      {
        id: "d0f075f6-831c-43b9-9749-15e1b74987be",
        name: "Deltoid",
        bodyPart: "Shoulders",
        group: null,
      },
    ],
    secondaryMuscles: [
      {
        id: "dec5954e-80b5-493b-8911-a73ef54d96ee",
        name: "Triceps brachii",
        bodyPart: "Arms",
        group: null,
      },
    ],
  },
  {
    id: "5",
    name: "Pull-ups",
    bodyPart: "Back",
    image: "/barbell_bench_press.png",
    equipment: "Bodyweight",
    targetMuscles: [
      {
        id: "lat-1",
        name: "Latissimus Dorsi",
        bodyPart: "Back",
        group: null,
      },
    ],
    secondaryMuscles: [
      {
        id: "biceps-1",
        name: "Biceps",
        bodyPart: "Arms",
        group: null,
      },
    ],
  },
];

interface WorkoutExercisesListProps {
  workoutData: WorkoutData;
  onWorkoutChange: (workout: WorkoutData) => void;
}

export function WorkoutExercisesList({ workoutData, onWorkoutChange }: WorkoutExercisesListProps) {
  const handleExerciseAdd = (exercise: Exercise) => {
    const newOrder = workoutData.exercises.length;
    const newExercise: ExerciseData = {
      exerciseId: exercise.id,
      order: newOrder,
      sets: [],
    };

    onWorkoutChange({
      ...workoutData,
      exercises: [...workoutData.exercises, newExercise],
    });
  };

  const handleExerciseRemove = (exerciseIndex: number) => {
    const updatedExercises = workoutData.exercises
      .filter((_, index) => index !== exerciseIndex)
      .map((ex, index) => ({ ...ex, order: index }));

    onWorkoutChange({
      ...workoutData,
      exercises: updatedExercises,
    });
  };

  const handleExerciseChange = (exerciseIndex: number, updatedExercise: ExerciseData) => {
    const updatedExercises = workoutData.exercises.map((ex, index) =>
      index === exerciseIndex ? updatedExercise : ex
    );

    onWorkoutChange({
      ...workoutData,
      exercises: updatedExercises,
    });
  };

  const exercises = workoutData.exercises;

  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Exercise Cards */}
      {exercises.map((exercise, index: number) => {
        // Récupérer les données complètes de l'exercice depuis le mock
        const exerciseData = mockExercises.find(
          (ex) => ex.id === exercise.exerciseId
        );

        return (
          <div key={`exercise-${index}`} className="relative">
            <ExerciseCard
              exerciseData={exercise}
              exerciseInfo={exerciseData}
              onExerciseChange={(updatedExercise) => handleExerciseChange(index, updatedExercise)}
              onDelete={() => handleExerciseRemove(index)}
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
