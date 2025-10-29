"use client";

import React, { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import type { SessionFormValues } from "./session-card";
import { SessionExerciseItem } from "./session-exercise-item";
import { SearchExercisesDrawer } from "@/components/features/exercises/exercises-drawer";
import { SetType } from "@/generated/prisma";

export const DEFAULT_SET_VALUES = {
  weight: null as unknown as number, // Hack to set a null default value without type breaking
  reps: null as unknown as number,
  rest: null,
  type: SetType.Normal,
  rpe: null,
  order: 1,
};

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
      order: sessionExercises.length + 1,
      supersetId: null,
      sets: [DEFAULT_SET_VALUES],
    };
    append(newExercise);
  };

  return (
    <>
      <ScrollArea className="h-full">
        <div className="space-y-4">
          {sessionExercises.map((exerciseField, exerciseIndex) => (
            <SessionExerciseItem
              key={exerciseField.id}
              exerciseIndex={exerciseIndex}
              exerciseId={exerciseField.exerciseId}
              onRemove={() => handleExerciseRemove(exerciseIndex)}
            />
          ))}
          <div className="flex flex-col items-center justify-center">
            {sessionExercises.length === 0 && (
              <div className="text-muted-foreground mt-10 mb-4">
                Add an exercise to your session
              </div>
            )}
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
        </div>
      </ScrollArea>
      <SearchExercisesDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onExerciseAdd={handleExerciseAdd}
      />
    </>
  );
}
