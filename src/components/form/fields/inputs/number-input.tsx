"use client";

import * as React from "react";
import { useController } from "react-hook-form";
import { Input, InputProps } from "./input";

export interface NumberInputProps extends Omit<InputProps, "type"> {
  min?: number;
  max?: number;
  step?: number;
  allowDecimals?: boolean;
}

/**
 * NumberInput - Number input component based on Input
 *
 * A wrapper around Input that handles number conversion automatically.
 * Converts string input values to numbers and handles number-specific validation.
 *
 * Usage:
 * <NumberInput
 *   name="exercises.0.sets.1.weight"
 *   control={control}
 *   label="Weight"
 *   placeholder="0"
 *   min={0}
 *   allowDecimals={true}
 * />
 */
export function NumberInput({
  name,
  control,
  min,
  max,
  step,
  allowDecimals = false,
  ...inputProps
}: NumberInputProps) {
  const { field, fieldState } = useController({
    name,
    control,
  });

  // Local state for display value (string)
  const [displayValue, setDisplayValue] = React.useState<string>("");

  // Sync local state with field value on mount and when field value changes
  React.useEffect(() => {
    const value = field.value;
    if (value === null || value === undefined) {
      setDisplayValue("");
    } else {
      setDisplayValue(value.toString());
    }
  }, [field.value]);

  const stepValue = React.useMemo(() => {
    return step || (allowDecimals ? "0.01" : "1");
  }, [step, allowDecimals]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const stringValue = e.target.value;
      setDisplayValue(stringValue);

      // Convert to number and update field
      if (stringValue === "") {
        field.onChange(null);
      } else {
        const numberValue = allowDecimals
          ? parseFloat(stringValue)
          : parseInt(stringValue, 10);
        if (!isNaN(numberValue)) {
          field.onChange(numberValue);
        }
      }
    },
    [field.onChange, allowDecimals]
  );

  return (
    <Input
      {...inputProps}
      name={name}
      control={control}
      type="number"
      value={displayValue}
      onChange={handleChange}
      onBlur={field.onBlur}
      min={min}
      max={max}
      step={stepValue}
    />
  );
}
