"use client";

import * as React from "react";
import { Control } from "react-hook-form";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
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

export interface InputV2Props
  extends Omit<React.ComponentProps<"input">, "name" | "size">,
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
 * InputV2 - Modern input component using FieldWrapperV2
 *
 * Automatically handles field state, validation, and error display.
 * Perfect for use with React Hook Form and useFieldArray.
 *
 * Usage:
 * <InputV2
 *   name="exercises.0.sets.1.weight"
 *   control={control}
 *   type="number"
 *   label="Weight"
 *   placeholder="0"
 * />
 */
export function InputV2({
  name,
  control,
  label,
  description,
  required,
  className,
  size = "default",
  ...inputProps
}: InputV2Props) {
  return (
    <FieldWrapperV2
      name={name}
      control={control}
      label={label}
      description={description}
      required={required}
    >
      {({ field, fieldState }) => (
        <input
          {...field}
          {...inputProps}
          id={field.name}
          aria-invalid={fieldState.invalid}
          data-slot="input"
          className={cn(inputVariants({ size }), className)}
        />
      )}
    </FieldWrapperV2>
  );
}
