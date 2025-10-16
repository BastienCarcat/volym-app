"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2 } from "lucide-react";
import { WorkoutFormValues } from "../../types";
import { FieldArrayWithId, useFormContext } from "react-hook-form";
import { NumberInput, DurationInput } from "@/components/form";

interface ExerciseSetRowProps {
  set: FieldArrayWithId<WorkoutFormValues, `exercises.${number}.sets`, "id">;
  setIndex: number;
  workoutExerciseIndex: number;
  onAddSet: (insertAfterIndex: number) => void;
  onRemoveSet: () => void;
  canRemove: boolean;
}

export function ExerciseSetRow({
  set,
  setIndex,
  workoutExerciseIndex,
  onAddSet,
  onRemoveSet,
  canRemove,
}: ExerciseSetRowProps) {
  const { control } = useFormContext<WorkoutFormValues>();

  return (
    <>
      <div className="contents">
        {/* Set Number Badge */}
        <Badge
          variant="outline"
          className="flex h-6 w-6 items-center justify-center rounded-full p-0 text-xs"
        >
          {setIndex + 1}
        </Badge>

        <NumberInput
          name={`exercises.${workoutExerciseIndex}.sets.${setIndex}.weight`}
          control={control}
          placeholder="0"
          min={0}
          className="text-right"
        />

        <NumberInput
          name={`exercises.${workoutExerciseIndex}.sets.${setIndex}.reps`}
          control={control}
          placeholder="0"
          min={0}
          className="text-right"
        />

        <DurationInput
          name={`exercises.${workoutExerciseIndex}.sets.${setIndex}.rest`}
          control={control}
          placeholder="0:00"
          className="text-right"
        />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddSet(setIndex)}
            className="h-8 w-8 p-0 transition-colors hover:bg-green-50 hover:text-green-600"
          >
            <Plus className="h-3 w-3" />
          </Button>
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveSet}
              className="h-8 w-8 p-0 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Minus className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
