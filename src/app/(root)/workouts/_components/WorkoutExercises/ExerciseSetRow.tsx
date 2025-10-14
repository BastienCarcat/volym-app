"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2 } from "lucide-react";
import { WorkoutFormValues } from "../../types";
import { FieldArrayWithId, useFormContext } from "react-hook-form";
import { NumberInputV2, DurationInputV2 } from "@/components/form";

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
          className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {setIndex + 1}
        </Badge>

        <NumberInputV2
          name={`exercises.${workoutExerciseIndex}.sets.${setIndex}.weight`}
          control={control}
          placeholder="0"
          min={0}
          className="text-right"
        />

        <NumberInputV2
          name={`exercises.${workoutExerciseIndex}.sets.${setIndex}.reps`}
          control={control}
          placeholder="0"
          min={0}
          className="text-right"
        />

        <DurationInputV2
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
            className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </Button>
          {canRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveSet}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
