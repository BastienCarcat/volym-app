"use client";

import * as React from "react";
import { Control } from "react-hook-form";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldWrapperV2 } from "../field-wrapper-v2";

interface TitleInputProps {
  name: string;
  control: Control<any>;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  titleClassName?: string;
  placeholder?: string;
  maxLength?: number;
  showCharCount?: boolean;
  rows?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
}

/**
 * TitleInput - Editable title component that displays as a heading when not editing
 * and shows a textarea when editing.
 * 
 * Controlled via FieldWrapperV2 for form integration with React Hook Form.
 * 
 * Usage:
 * <TitleInput
 *   name="title"
 *   control={control}
 *   placeholder="Enter title"
 *   as="h1"
 *   maxLength={70}
 *   showCharCount
 *   rows={1}
 * />
 */
export function TitleInput({
  name,
  control,
  label,
  description,
  required,
  className,
  titleClassName,
  placeholder = "Enter title",
  maxLength = 100,
  showCharCount = false,
  rows = 1,
  as: Component = "h1",
  ...props
}: TitleInputProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const titleStyles = {
    h1: "text-3xl font-semibold",
    h2: "text-2xl font-semibold", 
    h3: "text-xl font-semibold",
    h4: "text-lg font-semibold",
    h5: "text-base font-semibold",
    h6: "text-sm font-semibold",
    p: "text-base",
  };

  return (
    <FieldWrapperV2
      name={name}
      control={control}
      label={label}
      description={description}
      required={required}
      className={className}
    >
      {({ field, fieldState }) => {
        const handleSubmit = () => {
          setIsEditing(false);
          if (!field.value?.trim()) {
            field.onChange("");
          }
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          } else if (e.key === "Escape") {
            setIsEditing(false);
          }
        };

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
          if (e.target.value.length <= maxLength) {
            field.onChange(e.target.value);
          }
        };

        if (isEditing) {
          return (
            <div className="space-y-1">
              <textarea
                {...field}
                ref={textareaRef}
                onChange={handleChange}
                onBlur={handleSubmit}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                maxLength={maxLength}
                rows={rows}
                aria-invalid={fieldState.invalid}
                className={cn(
                  "bg-transparent border-none outline-none w-full p-0 m-0 focus-visible:ring-0 focus-visible:border-none resize-none overflow-hidden",
                  titleStyles[Component],
                  titleClassName
                )}
                {...props}
              />
              {showCharCount && (
                <div className="text-xs text-muted-foreground">
                  {(field.value || "").length}/{maxLength}
                </div>
              )}
            </div>
          );
        }

        return (
          <Component
            className={cn(
              "cursor-pointer hover:bg-muted/50 rounded-md px-1 py-0.5 -mx-1 transition-colors group truncate",
              titleStyles[Component],
              titleClassName
            )}
            onClick={() => setIsEditing(true)}
            title={field.value || placeholder}
          >
            {field.value || placeholder}
            <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity inline ml-2" />
          </Component>
        );
      }}
    </FieldWrapperV2>
  );
}