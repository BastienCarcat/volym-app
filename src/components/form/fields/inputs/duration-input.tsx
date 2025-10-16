"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  cn,
  formatDigitsToTimeDisplay,
  parseDigitsToSeconds,
  secondsToDigitsString,
} from "@/lib/utils";
import { Input, InputProps } from "./input";

export interface DurationInputProps
  extends Omit<InputProps, "onChange" | "value"> {}

/**
 * DurationInput - Duration input component extending Input
 *
 * Inherits all Input functionality while adding duration-specific behavior.
 * Accepts input in seconds and displays as MM:SS format.
 *
 * Usage:
 * <DurationInput
 *   name="exercises.0.sets.1.rest"
 *   control={control}
 *   label="Rest time"
 *   placeholder="0:00"
 * />
 */
export function DurationInput({
  className,
  placeholder = "0:00",
  ...props
}: DurationInputProps) {
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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    onChange: (value: number) => void
  ) => {
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
    <Input
      {...props}
      className={className}
      placeholder={placeholder}
      renderInput={({ field, inputProps: baseInputProps }) => {
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
            {...baseInputProps}
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={formatDigitsToTimeDisplay(digits)}
            onBeforeInput={(e) => e.preventDefault()}
            onKeyDown={(e) => handleKeyDown(e, field.onChange)}
            onBlur={field.onBlur}
            className={cn(baseInputProps.className, "tabular-nums")}
          />
        );
      }}
    />
  );
}
