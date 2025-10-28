"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  cn,
  formatDigitsToTimeDisplay,
  parseDigitsToSeconds,
  secondsToDigitsString,
} from "@/lib/utils";
import { Input, InputProps } from "./input";

export interface DurationInputProps extends Omit<InputProps, "type" | "value" | "onChange"> {
  value?: number | null;
  onChange?: (value: number) => void;
}

/**
 * DurationInput - Duration input component with MM:SS format
 *
 * Accepts input in seconds and displays as MM:SS format.
 * Use with FieldWrapper or Controller for form integration.
 *
 * @example
 * // With FieldWrapper
 * <FieldWrapper name="rest" control={control} label="Rest time">
 *   {(props) => (
 *     <DurationInput
 *       {...props.field}
 *       aria-invalid={props.fieldState.invalid}
 *       placeholder="0:00"
 *     />
 *   )}
 * </FieldWrapper>
 */
export const DurationInput = React.forwardRef<HTMLInputElement, DurationInputProps>(
  ({ value, onChange, onBlur, className, placeholder = "0:00", ...props }, ref) => {
    const [digits, setDigits] = useState<string>("");
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    // Sync with value prop
    useEffect(() => {
      if (typeof value === "number" && !isNaN(value) && value >= 0) {
        const newDigits = secondsToDigitsString(value);
        setDigits(newDigits);
      } else if (value === 0 || value === null || value === undefined) {
        setDigits("");
      }
    }, [value]);

    // Debounced onChange
    const debouncedOnChange = useCallback(
      (seconds: number) => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
          onChange?.(seconds);
        }, 1000);
      },
      [onChange]
    );

    // Cleanup timer on unmount
    useEffect(() => {
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle deletion
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        const newDigits = digits.slice(0, -1);
        setDigits(newDigits);
        debouncedOnChange(parseDigitsToSeconds(newDigits));
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
        debouncedOnChange(parseDigitsToSeconds(newDigits));

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
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={formatDigitsToTimeDisplay(digits)}
        onChange={() => {}} // Prevent read-only warning (input is controlled via onKeyDown)
        onBeforeInput={(e) => e.preventDefault()}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(className, "tabular-nums")}
      />
    );
  }
);

DurationInput.displayName = "DurationInput";
