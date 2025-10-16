"use client";

import * as React from "react";
import { Controller, Control } from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface FieldWrapperProps {
  name: string;
  control: Control<any>;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: (renderProps: {
    field: any;
    fieldState: any;
    formState: any;
  }) => React.ReactNode;
}

/**
 * FieldWrapper - Modern wrapper using shadcn Field components with React Hook Form Controller
 *
 * Provides a clean interface for custom inputs with automatic field state management.
 * Just wrap your custom input and use {...renderProps} to get field, fieldState, and formState.
 *
 * Usage:
 * <FieldWrapper name="note" control={control} label="Note">
 *   {(renderProps) => <CustomInput {...renderProps} />}
 * </FieldWrapper>
 *
 * Or even simpler:
 * <FieldWrapper name="note" control={control} label="Note">
 *   {(props) => <Textarea {...props.field} aria-invalid={props.fieldState.invalid} />}
 * </FieldWrapper>
 */
export function FieldWrapper({
  name,
  control,
  label,
  description,
  required,
  className,
  children,
}: FieldWrapperProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState, formState }) => (
        <Field className={className} data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={field.name}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FieldLabel>
          )}

          {children({ field, fieldState, formState })}

          {description && <FieldDescription>{description}</FieldDescription>}

          {fieldState.invalid && fieldState.error && (
            <FieldError errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  );
}
