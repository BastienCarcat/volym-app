"use client";

import * as React from "react";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { BaseFieldProps } from "./types";

export interface FieldWrapperProps extends BaseFieldProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * FieldWrapper - A reusable wrapper for form inputs that provides consistent styling,
 * labels, error messages, and accessibility features using shadcn Field components.
 * Works standalone without requiring React Hook Form context.
 *
 * @param label - The label text for the field
 * @param error - Error message to display
 * @param required - Whether the field is required (adds * to label)
 * @param description - Optional description text below the field
 * @param className - Additional CSS classes for the wrapper
 * @param children - The input component to wrap
 */
export function FieldWrapper({
  label,
  error,
  required,
  description,
  className,
  children,
}: FieldWrapperProps) {
  return (
    <Field className={cn("space-y-2", className)} data-invalid={!!error}>
      {label && (
        <FieldLabel className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </FieldLabel>
      )}
      {children}
      {description && (
        <FieldDescription>{description}</FieldDescription>
      )}
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
