"use client";

import React, { useState } from "react";
import { useFieldArray, useFormContext, UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { WorkoutExerciseCard } from "./WorkoutExerciseCard";
import { ExercisesDrawer } from "../Exercises/ExercisesDrawer";
import { WorkoutFormValues } from "../../types";
import { Button } from "@/components/ui/button";

export default function WorkoutExercisesList() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  //TODO: Make better typing
  const { control } = useFormContext<WorkoutFormValues>();

  const {
    fields: workoutExercises,
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
      note: "",
      order: workoutExercises.length,
      sets: [
        {
          weight: 0,
          reps: 0,
          rest: 0,
          type: "Normal" as const,
          rpe: null,
          order: 0,
        },
      ],
    };
    append(newExercise);
  };

  return (
    <div className="mx-auto max-w-4xl px-6">
      <div className="mt-8">
        {workoutExercises.map((workoutExercise, index: number) => {
          return (
            <div key={`exercise-${index}`} className="relative">
              <WorkoutExerciseCard
                workoutExercise={workoutExercise}
                workoutExerciseIndex={index}
                onDelete={() => handleExerciseRemove(index)}
              />
              {index < workoutExercises.length - 1 && (
                <div className="my-4 flex justify-center">
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
      </div>

      {workoutExercises.length > 0 && (
        <div className="my-4 flex justify-center">
          <Separator variant="dashed" orientation="vertical" className="h-8" />
        </div>
      )}
      <div
        className={cn("mb-10 flex justify-center", {
          "mt-10": workoutExercises.length === 0,
        })}
      >
        <Button
          onClick={() => setIsDrawerOpen(true)}
          variant="outline"
          className="border-2 border-dashed border-gray-300 px-6 py-2 text-gray-600 hover:border-gray-400 hover:text-gray-700"
        >
          + Add exercise
        </Button>
        <ExercisesDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onExerciseAdd={handleExerciseAdd}
        />
      </div>
    </div>
  );
}
