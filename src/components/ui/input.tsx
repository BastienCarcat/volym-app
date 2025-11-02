"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-white shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
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

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  size?: "default" | "small";
}

/**
 * Input - Base input component with consistent styling
 *
 * A low-level input component that provides consistent styling and variants.
 * Use with FieldWrapper or Controller for form integration.
 *
 * @example
 * // With FieldWrapper
 * <FieldWrapper name="email" control={control} label="Email">
 *   {(props) => <Input {...props.field} type="email" aria-invalid={props.fieldState.invalid} />}
 * </FieldWrapper>
 *
 * @example
 * // With Controller directly
 * <Controller
 *   name="email"
 *   control={control}
 *   render={({ field, fieldState }) => (
 *     <Field data-invalid={fieldState.invalid}>
 *       <FieldLabel>Email</FieldLabel>
 *       <Input {...field} type="email" aria-invalid={fieldState.invalid} />
 *       {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
 *     </Field>
 *   )}
 * />
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = "default", ...props }, ref) => {
    return (
      <input
        ref={ref}
        data-slot="input"
        className={cn(inputVariants({ size }), className)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
