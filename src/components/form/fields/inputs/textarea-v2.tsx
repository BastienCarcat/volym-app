"use client";

import * as React from "react";
import { Control } from "react-hook-form";
import { cn } from "@/lib/utils";
import { FieldWrapperV2 } from "../field-wrapper-v2";

export interface TextareaV2Props extends Omit<React.ComponentProps<"textarea">, "name"> {
  name: string;
  control: Control<any>;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
}

/**
 * TextareaV2 - Modern textarea component using FieldWrapperV2
 * 
 * Automatically handles field state, validation, and error display.
 * Perfect for use with React Hook Form and useFieldArray.
 * 
 * Usage:
 * <TextareaV2 
 *   name="exercises.0.note" 
 *   control={control} 
 *   label="Exercise Note"
 *   placeholder="Add a note..."
 * />
 */
export function TextareaV2({
  name,
  control,
  label,
  description,
  required,
  className,
  ...textareaProps
}: TextareaV2Props) {
  return (
    <FieldWrapperV2
      name={name}
      control={control}
      label={label}
      description={description}
      required={required}
    >
      {({ field, fieldState }) => (
        <textarea
          {...field}
          {...textareaProps}
          id={field.name}
          aria-invalid={fieldState.invalid}
          data-slot="textarea"
          className={cn(
            "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
        />
      )}
    </FieldWrapperV2>
  );
}