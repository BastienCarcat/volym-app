"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input, InputProps } from "@/components/ui/input";
import { 
  cn, 
  formatDigitsToTimeDisplay, 
  parseDigitsToSeconds, 
  secondsToDigitsString 
} from "@/lib/utils";

interface DurationInputProps {
  value?: number; // durée en secondes
  onChange?: (seconds: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  inputProps?: Omit<InputProps, "value" | "onChange">;
}

export function DurationInput({
  value,
  onChange,
  placeholder = "0:00",
  className,
  disabled = false,
  inputProps,
}: DurationInputProps) {
  const [digits, setDigits] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced function to call onChange
  const debouncedOnChange = useCallback((seconds: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      if (onChange) {
        onChange(seconds);
      }
    }, 1000);
  }, [onChange]);

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

  // Sync with value prop
  useEffect(() => {
    if (typeof value === "number" && !isNaN(value) && value >= 0) {
      const newDigits = secondsToDigitsString(value);
      setDigits(newDigits);
    } else if (value === 0) {
      setDigits("");
    }
  }, [value]);

  // Keep cursor at the end
  useEffect(() => {
    if (inputRef.current) {
      const input = inputRef.current;
      const length = input.value.length;
      input.setSelectionRange(length, length);
    }
  });

  const displayValue = formatDigitsToTimeDisplay(digits);

  return (
    <Input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      {...inputProps}
      className={cn("font-mono text-center tabular-nums", className)}
    />
  );
}
