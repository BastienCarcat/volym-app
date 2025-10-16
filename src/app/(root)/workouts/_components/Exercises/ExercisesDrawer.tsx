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
import { ExerciseListItem } from "@/app/(root)/workouts/_components/Exercises/ExercisesListItem";
import { exercisesData } from "../../MockData";

interface ExercisesDrawerProps {
  onExerciseAdd: (exerciseId: string) => void;
}

export function ExercisesDrawer({ onExerciseAdd }: ExercisesDrawerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleExerciseSelect = (id: string) => {
    const fullExercise = exercisesData.find((ex) => ex.id === id);
    if (fullExercise) {
      onExerciseAdd(id);
    }
    setIsDrawerOpen(false);
  };

  return (
    <div className="flex justify-center">
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="border-2 border-dashed border-gray-300 px-6 py-2 text-gray-600 hover:border-gray-400 hover:text-gray-700"
          >
            + Add exercise
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>Select an Exercise</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-2">
            {exercisesData.map((exercise) => (
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
