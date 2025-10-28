"use client";

import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormContext } from "react-hook-form";
import type { SessionFormValues } from "./session-card";
import { Badge } from "@/components/ui/badge";
import { NumberInput } from "@/components/ui/number-input";
import { FieldWrapper } from "@/components/ui/form";
import { DurationInput } from "@/components/ui/duration-input";

interface SessionExerciseSetProps {
  exerciseIndex: number;
  setIndex: number;
  onAddSet: (insertAfterIndex: number) => void;
  onRemoveSet: () => void;
  canRemove: boolean;
}

export function SessionExerciseSet({
  exerciseIndex,
  setIndex,
  onAddSet,
  onRemoveSet,
  canRemove,
}: SessionExerciseSetProps) {
  const { control } = useFormContext<SessionFormValues>();

  return (
    <div className="contents">
      {/* Set Number Badge */}
      <Badge
        variant="outline"
        className="flex h-6 w-6 items-center justify-center rounded-full p-0 text-xs"
      >
        {setIndex + 1}
      </Badge>

      <FieldWrapper
        name={`exercises.${exerciseIndex}.sets.${setIndex}.weight`}
        control={control}
      >
        {(props) => (
          <NumberInput
            {...props.field}
            aria-invalid={props.fieldState.invalid}
            placeholder="10"
            min={1}
            className="text-right"
          />
        )}
      </FieldWrapper>

      <FieldWrapper
        name={`exercises.${exerciseIndex}.sets.${setIndex}.reps`}
        control={control}
      >
        {(props) => (
          <NumberInput
            {...props.field}
            aria-invalid={props.fieldState.invalid}
            placeholder="10"
            min={1}
            className="text-right"
          />
        )}
      </FieldWrapper>

      <FieldWrapper
        name={`exercises.${exerciseIndex}.sets.${setIndex}.rest`}
        control={control}
      >
        {(props) => (
          <DurationInput
            {...props.field}
            aria-invalid={props.fieldState.invalid}
            placeholder="0:00"
            min={0}
            className="text-right"
          />
        )}
      </FieldWrapper>

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
  );
}
