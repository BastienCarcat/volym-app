"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.ComponentProps<"textarea"> {}

/**
 * Textarea - Base textarea component with consistent styling
 *
 * A low-level textarea component that provides consistent styling.
 * Use with FieldWrapper or Controller for form integration.
 *
 * @example
 * // With FieldWrapper
 * <FieldWrapper name="note" control={control} label="Note">
 *   {(props) => <Textarea {...props.field} aria-invalid={props.fieldState.invalid} />}
 * </FieldWrapper>
 *
 * @example
 * // With Controller directly
 * <Controller
 *   name="note"
 *   control={control}
 *   render={({ field, fieldState }) => (
 *     <Field data-invalid={fieldState.invalid}>
 *       <FieldLabel>Note</FieldLabel>
 *       <Textarea {...field} aria-invalid={fieldState.invalid} />
 *       {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
 *     </Field>
 *   )}
 * />
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
