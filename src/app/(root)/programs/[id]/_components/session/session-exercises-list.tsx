"use client";

import React, { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { SessionFormValues } from "./session-card";
import { SessionExerciseItem } from "./session-exercise-item";
import { SearchExercisesDrawer } from "./search-exercises/exercises-drawer";

export default function SessionExercisesList() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { control } = useFormContext<SessionFormValues>();

  const {
    fields: sessionExercises,
    remove,
    append,
  } = useFieldArray({
    control,
    name: "exercises",
  });

  const handleExerciseRemove = (index: number) => {
    remove(index);
  };

  const handleExerciseAdd = (exerciseId: string) => {
    const newExercise = {
      exerciseId,
      note: null,
      order: sessionExercises.length,
      supersetId: null,
      sets: [
        {
          weight: 0,
          reps: 0,
          rest: null,
          type: "Normal" as const,
          rpe: null,
          order: 0,
        },
      ],
    };
    append(newExercise);
  };

  return (
    <div className="space-y-4">
      {sessionExercises.map((exerciseField, exerciseIndex) => (
        <SessionExerciseItem
          key={exerciseField.id}
          exerciseIndex={exerciseIndex}
          exerciseId={exerciseField.exerciseId}
          onRemove={() => handleExerciseRemove(exerciseIndex)}
        />
      ))}

      <div
        className={cn("flex justify-center", {
          "mt-10": sessionExercises.length === 0,
        })}
      >
        <Button
          onClick={() => setIsDrawerOpen(true)}
          size="sm"
          variant="outline"
          className="border-2 border-dashed border-gray-300 px-6 py-2 text-gray-600 hover:border-gray-400 hover:text-gray-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add exercise
        </Button>
      </div>
      <SearchExercisesDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onExerciseAdd={handleExerciseAdd}
      />
    </div>
  );
}
