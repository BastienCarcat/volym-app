"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ExerciseListItem } from "./ExerciseListItem";
import type { Exercise } from "../types";

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

interface AddExerciseSectionProps {
  onExerciseAdd: (exercise: Exercise) => void;
}

export function AddExerciseSection({ onExerciseAdd }: AddExerciseSectionProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleExerciseSelect = (exercise: { id: string; name: string }) => {
    const fullExercise = mockExercises.find((ex) => ex.id === exercise.id);
    if (fullExercise) {
      onExerciseAdd(fullExercise);
    }
    setIsDrawerOpen(false);
  };

  return (
    <div className="flex justify-center">
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="border-dashed border-2 border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 px-6 py-2 "
          >
            + Add exercise
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>Select an Exercise</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-2">
            {mockExercises.map((exercise) => (
              <ExerciseListItem
                key={exercise.id}
                exercise={exercise}
                onSelect={handleExerciseSelect}
              />
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
