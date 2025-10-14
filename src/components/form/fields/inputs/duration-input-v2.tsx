"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Control } from "react-hook-form";
import { cva, type VariantProps } from "class-variance-authority";
import {
  cn,
  formatDigitsToTimeDisplay,
  parseDigitsToSeconds,
  secondsToDigitsString,
} from "@/lib/utils";
import { FieldWrapperV2 } from "../field-wrapper-v2";

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      size: {
        default: "h-9 px-3 py-1 text-base file:h-7 file:text-sm md:text-sm",
        small: "h-7 px-2 py-0.5 text-xs file:h-5 file:text-xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface DurationInputV2Props 
  extends Omit<React.ComponentProps<"input">, "name" | "size" | "onChange" | "value">,
    VariantProps<typeof inputVariants> {
  name: string;
  control: Control<any>;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  size?: "default" | "small";
}

/**
 * DurationInputV2 - Modern duration input component using FieldWrapperV2
 * 
 * Automatically handles field state, validation, and error display.
 * Perfect for use with React Hook Form and useFieldArray.
 * Accepts input in seconds and displays as MM:SS format.
 * 
 * Usage:
 * <DurationInputV2 
 *   name="exercises.0.sets.1.rest" 
 *   control={control} 
 *   label="Rest time"
 *   placeholder="0:00"
 * />
 */
export function DurationInputV2({
  name,
  control,
  label,
  description,
  required,
  className,
  size = "default",
  placeholder = "0:00",
  ...inputProps
}: DurationInputV2Props) {
  const [digits, setDigits] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced function to call onChange
  const debouncedOnChange = useCallback(
    (seconds: number, onChange: (value: number) => void) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onChange(seconds);
      }, 1000);
    },
    []
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, onChange: (value: number) => void) => {
    // Handle deletion
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      const newDigits = digits.slice(0, -1);
      setDigits(newDigits);
      debouncedOnChange(parseDigitsToSeconds(newDigits), onChange);
      return;
    }

    // Allow navigation keys
    const navigationKeys = [
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ];

    if (navigationKeys.includes(e.key)) {
      return;
    }

    // Handle digit input
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();

      // Limit to 4 digits (max 99:59)
      if (digits.length >= 4) {
        return;
      }

      const newDigits = digits + e.key;
      setDigits(newDigits);
      debouncedOnChange(parseDigitsToSeconds(newDigits), onChange);

      return;
    }

    // Block all other keys
    e.preventDefault();
  };

  // Keep cursor at the end
  useEffect(() => {
    if (inputRef.current) {
      const input = inputRef.current;
      const length = input.value.length;
      input.setSelectionRange(length, length);
    }
  });

  return (
    <FieldWrapperV2
      name={name}
      control={control}
      label={label}
      description={description}
      required={required}
    >
      {({ field, fieldState }) => {
        // Sync with field value
        useEffect(() => {
          const value = field.value;
          if (typeof value === "number" && !isNaN(value) && value >= 0) {
            const newDigits = secondsToDigitsString(value);
            setDigits(newDigits);
          } else if (value === 0 || value === null || value === undefined) {
            setDigits("");
          }
        }, [field.value]);

        return (
          <input
            {...inputProps}
            ref={inputRef}
            type="text"
            inputMode="numeric"
            id={field.name}
            name={field.name}
            value={formatDigitsToTimeDisplay(digits)}
            onBeforeInput={(e) => e.preventDefault()}
            onKeyDown={(e) => handleKeyDown(e, field.onChange)}
            onBlur={field.onBlur}
            placeholder={placeholder}
            aria-invalid={fieldState.invalid}
            data-slot="input"
            className={cn("font-mono text-center tabular-nums", inputVariants({ size }), className)}
          />
        );
      }}
    </FieldWrapperV2>
  );
}