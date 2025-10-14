"use client";

import React from "react";
import { useFieldArray, useFormContext, UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { WorkoutExerciseCard } from "./WorkoutExerciseCard";
import { ExercisesDrawer } from "../Exercises/ExercisesDrawer";
import { WorkoutFormValues } from "../../types";

export default function WorkoutExercisesList() {
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
    <div className="max-w-4xl mx-auto px-6">
      {workoutExercises.map((workoutExercise, index: number) => {
        return (
          <div key={`exercise-${index}`} className="relative">
            <WorkoutExerciseCard
              workoutExercise={workoutExercise}
              workoutExerciseIndex={index}
              onDelete={() => handleExerciseRemove(index)}
            />
            {index < workoutExercises.length - 1 && (
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

      {workoutExercises.length > 0 && (
        <div className="flex justify-center my-4">
          <Separator variant="dashed" orientation="vertical" className="h-8" />
        </div>
      )}
      <div
        className={cn("mb-10", {
          "mt-10": workoutExercises.length === 0,
        })}
      >
        <ExercisesDrawer onExerciseAdd={handleExerciseAdd} />
      </div>
    </div>
  );
}
