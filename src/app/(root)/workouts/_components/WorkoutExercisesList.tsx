"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

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

  const { addExercise, isAdding } = useAddWorkoutExercise(workoutId);
  const { removeExercise, isRemoving } = useRemoveWorkoutExercise(workoutId);

  const handleExerciseAdd = (exercise: Exercise) => {
    const currentExercises = workout?.exercises || [];
    const newOrder = currentExercises.length;

    addExercise({
      workoutId,
      exerciseId: exercise.id,
      order: newOrder,
    });
  };

  const handleExerciseRemove = (exerciseId: string) => {
    removeExercise(exerciseId);
  };

  const exercises = workout?.exercises || [];

  return (
    <div className="max-w-4xl mx-auto px-6">
      {/* Loading indicators */}
      {(isAdding || isRemoving) && (
        <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 mb-4 rounded-md">
          💾 Saving workout...
        </div>
      )}

      {/* Exercise Cards */}
      {exercises.map((exercise: any, index: number) => {
        // Récupérer les données complètes de l'exercice depuis le mock
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
              note={exercise.note}
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
