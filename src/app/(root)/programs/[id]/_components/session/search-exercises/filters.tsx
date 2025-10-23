"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import {
  Input,
  SelectInput,
  FieldWrapper,
  useZodForm,
} from "@/components/form";
import { BodyPart } from "@/app/(root)/programs/types";
import { SearchExercisesFiltersSchema } from "@/app/(root)/programs/schemas";
import z from "zod";

export type SearchExercisesFiltersValues = z.infer<
  typeof SearchExercisesFiltersSchema
>;

interface SearchExercisesFiltersProps {
  onFiltersChange: (filters: SearchExercisesFiltersValues) => void;
}

const BODY_PART_OPTIONS = [
  { value: BodyPart.Legs, label: "Legs" },
  { value: BodyPart.Back, label: "Back" },
  { value: BodyPart.Chest, label: "Chest" },
  { value: BodyPart.Shoulders, label: "Shoulders" },
  { value: BodyPart.Arms, label: "Arms" },
  { value: BodyPart.Core, label: "Core" },
];

const EQUIPMENT_OPTIONS = [
  { value: "barbell", label: "Barbell" },
  { value: "dumbbell", label: "Dumbbell" },
  { value: "cable", label: "Cable" },
  { value: "machine", label: "Machine" },
  { value: "bodyweight", label: "Bodyweight" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "resistance_band", label: "Resistance Band" },
];

/**
 * ExercisesFilters - Filter component for exercises search
 *
 * Provides search input and filter selects for bodyPart and equipment.
 * Uses React Hook Form to manage filter state without a form submission.
 *
 * Usage:
 * <ExercisesFilters
 *   onFiltersChange={(filters) => console.log(filters)}
 * />
 */
export function SearchExercisesFilters({
  onFiltersChange,
}: SearchExercisesFiltersProps) {
  const { control, watch } = useZodForm({
    schema: SearchExercisesFiltersSchema,
  });

  // Watch all form values and call onFiltersChange whenever they change
  React.useEffect(() => {
    const subscription = watch((formValues) => {
      onFiltersChange(formValues);
    });

    return () => subscription.unsubscribe();
  }, [watch, onFiltersChange]);

  return (
    <div className="space-y-4 px-6">
      <FieldWrapper name="query" control={control}>
        {(props) => (
          <Input
            {...props.field}
            aria-invalid={props.fieldState.invalid}
            type="text"
            placeholder="Search exercises..."
          />
        )}
      </FieldWrapper>

      <div className="grid grid-cols-2 gap-3">
        <FieldWrapper name="bodyPart" control={control}>
          {(props) => (
            <SelectInput
              {...props.field}
              aria-invalid={props.fieldState.invalid}
              placeholder="All Body Parts"
              options={BODY_PART_OPTIONS}
              size="sm"
              clearable
            />
          )}
        </FieldWrapper>

        <FieldWrapper name="equipment" control={control}>
          {(props) => (
            <SelectInput
              {...props.field}
              aria-invalid={props.fieldState.invalid}
              placeholder="All Equipment"
              options={EQUIPMENT_OPTIONS}
              size="sm"
              clearable
            />
          )}
        </FieldWrapper>
      </div>
    </div>
  );
}
