"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectInputProps {
  value?: string | null;
  onChange?: (value: string | null) => void;
  onBlur?: () => void;
  className?: string;
  placeholder?: string;
  options: SelectOption[];
  size?: "sm" | "default";
  clearable?: boolean;
  "aria-invalid"?: boolean;
}

/**
 * SelectInput - Select component integrated for forms
 *
 * A wrapper around shadcn Select component with form-friendly API.
 * Use with FieldWrapper or Controller for form integration.
 *
 * @example
 * // With FieldWrapper
 * <FieldWrapper name="bodyPart" control={control} label="Body Part">
 *   {(props) => (
 *     <SelectInput
 *       {...props.field}
 *       aria-invalid={props.fieldState.invalid}
 *       placeholder="Select body part"
 *       options={bodyPartOptions}
 *     />
 *   )}
 * </FieldWrapper>
 */
export const SelectInput = React.forwardRef<HTMLButtonElement, SelectInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      className,
      placeholder = "Select an option",
      options,
      size = "default",
      clearable = false,
      "aria-invalid": ariaInvalid,
    },
    ref
  ) => {
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(null);
    };

    return (
      <div className={cn("relative", className)}>
        <Select
          value={value || ""}
          onValueChange={(newValue) => {
            onChange?.(newValue === "" ? null : newValue);
          }}
        >
          <SelectTrigger
            ref={ref}
            size={size}
            className={cn("w-full", ariaInvalid && "border-destructive")}
            aria-invalid={ariaInvalid}
            onBlur={onBlur}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {clearable && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear selection"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    );
  }
);

SelectInput.displayName = "SelectInput";
