"use client";

import * as React from "react";
import { Control } from "react-hook-form";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "../field-wrapper";

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
 * Controlled via FieldWrapper for form integration with React Hook Form.
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
    <FieldWrapper
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
                  "m-0 w-full resize-none overflow-hidden border-none bg-transparent p-0 outline-none focus-visible:border-none focus-visible:ring-0",
                  titleStyles[Component],
                  titleClassName
                )}
                {...props}
              />
              {showCharCount && (
                <div className="text-muted-foreground text-xs">
                  {(field.value || "").length}/{maxLength}
                </div>
              )}
            </div>
          );
        }

        return (
          <Component
            className={cn(
              "hover:bg-muted/50 group -mx-1 cursor-pointer truncate rounded-md px-1 py-0.5 transition-colors",
              titleStyles[Component],
              titleClassName
            )}
            onClick={() => setIsEditing(true)}
            title={field.value || placeholder}
          >
            {field.value || placeholder}
            <Pencil className="ml-2 inline h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </Component>
        );
      }}
    </FieldWrapper>
  );
}
