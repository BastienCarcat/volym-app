"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TitleInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
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
 * Use with FieldWrapper or Controller for form integration.
 *
 * @example
 * // With FieldWrapper
 * <FieldWrapper name="title" control={control}>
 *   {(props) => (
 *     <TitleInput
 *       {...props.field}
 *       as="h1"
 *       placeholder="Enter title"
 *       maxLength={70}
 *     />
 *   )}
 * </FieldWrapper>
 */
export const TitleInput = React.forwardRef<HTMLTextAreaElement, TitleInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      className,
      titleClassName,
      placeholder = "Enter title",
      maxLength = 100,
      showCharCount = false,
      rows = 1,
      as: Component = "h1",
    },
    ref
  ) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

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

    const handleSubmit = () => {
      setIsEditing(false);
      if (!value?.trim()) {
        onChange?.("");
      }
      onBlur?.();
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
        onChange?.(e.target.value);
      }
    };

    if (isEditing) {
      return (
        <div className={cn("space-y-1", className)}>
          <textarea
            ref={textareaRef}
            value={value || ""}
            onChange={handleChange}
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={rows}
            className={cn(
              "m-0 w-full resize-none overflow-hidden border-none bg-transparent p-0 outline-none focus-visible:border-none focus-visible:ring-0",
              titleStyles[Component],
              titleClassName
            )}
          />
          {showCharCount && (
            <div className="text-muted-foreground text-xs">
              {(value || "").length}/{maxLength}
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
          titleClassName,
          className
        )}
        onClick={() => setIsEditing(true)}
        title={value || placeholder}
      >
        {value || placeholder}
        <Pencil className="ml-2 inline h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </Component>
    );
  }
);

TitleInput.displayName = "TitleInput";
