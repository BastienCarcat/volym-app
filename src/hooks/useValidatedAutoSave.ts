import { useState, useEffect, useCallback } from "react";
import { z } from "zod";

interface UseValidatedAutoSaveOptions<T> {
  initialValue: T;
  schema: z.ZodSchema<T>;
  onSave: (value: T) => void;
  delay?: number;
}

interface UseValidatedAutoSaveReturn<T> {
  value: T;
  setValue: (value: T) => void;
  error: string | null;
  fieldErrors: Record<string, string> | null;
  isValid: boolean;
  isDirty: boolean;
}

export function useValidatedAutoSave<T>({
  initialValue,
  schema,
  onSave,
  delay = 500,
}: UseValidatedAutoSaveOptions<T>): UseValidatedAutoSaveReturn<T> {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(
    null
  );
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  const validateAndSave = useCallback(
    (currentValue: T) => {
      const result = schema.safeParse(currentValue);

      if (!result.success) {
        const firstError = result.error.issues[0]?.message || "Invalid value";
        setError(firstError);
        setIsValid(false);

        // Create field-specific errors for nested objects
        const errors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          const fieldPath = issue.path.join(".");
          if (fieldPath) {
            errors[fieldPath] = issue.message;
          }
        });
        setFieldErrors(Object.keys(errors).length > 0 ? errors : null);
        return;
      }

      setError(null);
      setFieldErrors(null);
      setIsValid(true);

      if (isDirty) {
        onSave(result.data);
      }
    },
    [schema, onSave, isDirty]
  );

  useEffect(() => {
    if (!isDirty) return;

    const timeout = setTimeout(() => {
      validateAndSave(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay, isDirty]);

  const handleSetValue = useCallback((newValue: T) => {
    console.log("newValue :>> ", newValue);
    setValue(newValue);
    setIsDirty(true);
  }, []);

  // Update value when initialValue changes (external updates)
  useEffect(() => {
    if (!isDirty && JSON.stringify(value) !== JSON.stringify(initialValue)) {
      setValue(initialValue);
    }
  }, [initialValue, isDirty, value]);

  return {
    value,
    setValue: handleSetValue,
    error,
    fieldErrors,
    isValid,
    isDirty,
  };
}
