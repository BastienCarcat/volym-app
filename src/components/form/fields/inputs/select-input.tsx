"use client";

import * as React from "react";
import { Control, useController } from "react-hook-form";
import { FieldWrapper } from "../field-wrapper";
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
  name: string;
  control: Control<any>;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  options: SelectOption[];
  size?: "sm" | "default";
  clearable?: boolean;
}

/**
 * SelectInput - Select input component integrated with React Hook Form
 *
 * A wrapper around shadcn Select component that works with React Hook Form.
 * Handles field state, validation, and error display automatically.
 *
 * Usage:
 * <SelectInput
 *   name="bodyPart"
 *   control={control}
 *   label="Body Part"
 *   placeholder="Select body part"
 *   options={[
 *     { value: "chest", label: "Chest" },
 *     { value: "back", label: "Back" }
 *   ]}
 * />
 */
export function SelectInput({
  name,
  control,
  label,
  description,
  required,
  className,
  placeholder = "Select an option",
  options,
  size = "default",
  clearable = false,
}: SelectInputProps) {
  const { field, fieldState } = useController({
    name,
    control,
  });

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    field.onChange(null);
  };

  return (
    <FieldWrapper
      name={name}
      control={control}
      label={label}
      description={description}
      required={required}
      className={className}
    >
      {() => (
        <div className="relative">
          <Select
            value={field.value || ""}
            onValueChange={(value) => {
              field.onChange(value === "" ? null : value);
            }}
          >
            <SelectTrigger
              size={size}
              className={cn("w-full", fieldState.invalid && "border-destructive")}
              aria-invalid={fieldState.invalid}
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
          {clearable && field.value && (
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
      )}
    </FieldWrapper>
  );
}
