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
import mockExercises from "../mockData";

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
