"use client";

import * as React from "react";
import { Input, InputProps } from "./input";

export interface NumberInputProps extends Omit<InputProps, "type" | "value" | "onChange"> {
  value?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  allowDecimals?: boolean;
}

/**
 * NumberInput - Number input component with automatic number conversion
 *
 * Handles conversion between string input and number values automatically.
 * Use with FieldWrapper or Controller for form integration.
 *
 * @example
 * // With FieldWrapper
 * <FieldWrapper name="weight" control={control} label="Weight">
 *   {(props) => (
 *     <NumberInput
 *       {...props.field}
 *       aria-invalid={props.fieldState.invalid}
 *       min={0}
 *       allowDecimals
 *     />
 *   )}
 * </FieldWrapper>
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      min,
      max,
      step,
      allowDecimals = false,
      ...inputProps
    },
    ref
  ) => {
    // Local state for display value (string)
    const [displayValue, setDisplayValue] = React.useState<string>("");

    // Sync local state with value prop
    React.useEffect(() => {
      if (value === null || value === undefined) {
        setDisplayValue("");
      } else {
        setDisplayValue(value.toString());
      }
    }, [value]);

    const stepValue = React.useMemo(() => {
      return step || (allowDecimals ? "0.01" : "1");
    }, [step, allowDecimals]);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const stringValue = e.target.value;
        setDisplayValue(stringValue);

        // Convert to number and call onChange
        if (stringValue === "") {
          onChange?.(null);
        } else {
          const numberValue = allowDecimals
            ? parseFloat(stringValue)
            : parseInt(stringValue, 10);
          if (!isNaN(numberValue)) {
            onChange?.(numberValue);
          }
        }
      },
      [onChange, allowDecimals]
    );

    return (
      <Input
        {...inputProps}
        ref={ref}
        type="number"
        value={displayValue}
        onChange={handleChange}
        onBlur={onBlur}
        min={min}
        max={max}
        step={stepValue}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";
