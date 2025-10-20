"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Input, SelectInput, FieldWrapper } from "@/components/form";
import { BodyPart } from "../../types";

export interface ExercisesFiltersValues {
  query: string;
  bodyPart: string | null;
  equipment: string | null;
}

interface ExercisesFiltersProps {
  onFiltersChange: (filters: ExercisesFiltersValues) => void;
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
export function ExercisesFilters({ onFiltersChange }: ExercisesFiltersProps) {
  const { control, watch } = useForm<ExercisesFiltersValues>({
    defaultValues: {
      query: "",
      bodyPart: null,
      equipment: null,
    },
  });

  // Watch all form values and call onFiltersChange whenever they change
  React.useEffect(() => {
    const subscription = watch((formValues) => {
      onFiltersChange(formValues as ExercisesFiltersValues);
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
