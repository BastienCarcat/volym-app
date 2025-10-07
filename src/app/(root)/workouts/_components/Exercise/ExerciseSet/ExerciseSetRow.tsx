"use client";

import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/form/fields/inputs/input";
import { DurationInput } from "@/components/form/fields/inputs/duration-input";
import { useValidatedAutoSave } from "../../../../../../hooks/useValidatedAutoSave";
import {
  exerciseSetSchema,
  type ExerciseSetFormData,
} from "../../../_schemas/exerciseSet.schema";
import type { ExerciseSet } from "@/generated/prisma";

interface ExerciseSetRowProps {
  set: ExerciseSet;
  index: number;
  onUpdate: (setId: string, updates: Partial<ExerciseSetFormData>) => void;
  onAddSet: (insertAfterIndex: number) => void;
  onRemoveSet: (setId: string) => void;
  canRemove: boolean;
}

export function ExerciseSetRow({
  set,
  index,
  onUpdate,
  onAddSet,
  onRemoveSet,
  canRemove,
}: ExerciseSetRowProps) {
  const initialValue: ExerciseSetFormData = {
    weight: set.weight || undefined,
    reps: set.reps || undefined,
    rest: set.rest || undefined,
    rpe: set.rpe || undefined,
  };

  const setAutoSave = useValidatedAutoSave({
    initialValue,
    schema: exerciseSetSchema,
    onSave: (validSet) => onUpdate(set.id, validSet),
    delay: 500,
  });

  return (
    <div className="contents">
      <Badge
        variant="outline"
        className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
      >
        {index + 1}
      </Badge>
      <Input
        type="number"
        value={setAutoSave.value.weight?.toString() || ""}
        onChange={(e) => {
          const newValue = e.target.value ? Number(e.target.value) : undefined;
          setAutoSave.setValue({
            ...setAutoSave.value,
            weight: newValue,
          });
        }}
        placeholder="0"
        min={0}
        className="text-right"
        error={setAutoSave.fieldErrors?.weight}
      />
      <Input
        type="number"
        value={setAutoSave.value.reps?.toString() || ""}
        onChange={(e) => {
          const newValue = e.target.value ? Number(e.target.value) : undefined;
          setAutoSave.setValue({
            ...setAutoSave.value,
            reps: newValue,
          });
        }}
        placeholder="0"
        min={0}
        className="text-right"
        error={setAutoSave.fieldErrors?.reps}
      />
      <DurationInput
        value={setAutoSave.value.rest}
        onChange={(value) => {
          setAutoSave.setValue({
            ...setAutoSave.value,
            rest: value,
          });
        }}
        placeholder="0:00"
        className="text-right"
        error={setAutoSave.fieldErrors?.rest}
      />
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddSet(index)}
          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveSet(set.id)}
          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
          disabled={!canRemove}
        >
          <Minus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
