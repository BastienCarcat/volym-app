"use client";
import * as React from "react";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageTitleProps extends React.ComponentProps<"div"> {
  title: string;
  description?: string;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
  maxTitleChars?: number;
  maxDescriptionChars?: number;
}

export function PageTitle({
  title,
  description = "",
  onTitleChange,
  onDescriptionChange,
  maxTitleChars = 70,
  maxDescriptionChars = 500,
  className,
  ...props
}: PageTitleProps) {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [isEditingDescription, setIsEditingDescription] = React.useState(false);
  const [titleValue, setTitleValue] = React.useState(title);
  const [descriptionValue, setDescriptionValue] = React.useState(description);
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const descriptionInputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  React.useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  }, [isEditingDescription]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    // If title is empty, restore the previous value
    if (titleValue.trim() === "") {
      setTitleValue(title);
      return;
    }
    if (onTitleChange && titleValue !== title) {
      onTitleChange(titleValue);
    }
  };

  const handleDescriptionSubmit = () => {
    setIsEditingDescription(false);
    if (onDescriptionChange && descriptionValue !== description) {
      onDescriptionChange(descriptionValue);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSubmit();
    } else if (e.key === "Escape") {
      setTitleValue(title);
      setIsEditingTitle(false);
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleDescriptionSubmit();
    } else if (e.key === "Escape") {
      setDescriptionValue(description);
      setIsEditingDescription(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col w-full py-10 px-24 border-b-1 border-border",
        className
      )}
      {...props}
    >
      <div className="mb-2">
        {isEditingTitle ? (
          <div className="space-y-1">
            <input
              ref={titleInputRef}
              value={titleValue}
              onChange={(e) => {
                if (e.target.value.length <= maxTitleChars) {
                  setTitleValue(e.target.value);
                }
              }}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              className="text-3xl font-semibold bg-transparent border-none outline-none w-full p-0 m-0"
              maxLength={maxTitleChars}
            />
            <div className="text-xs text-muted-foreground">
              {titleValue.length}/{maxTitleChars}
            </div>
          </div>
        ) : (
          <h1
            className="text-3xl font-semibold cursor-pointer hover:bg-muted/50 rounded-md px-1 py-0.5 -mx-1 transition-colors group truncate"
            onClick={() => setIsEditingTitle(true)}
            title={titleValue}
          >
            {titleValue}
            <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity inline ml-2" />
          </h1>
        )}
      </div>

      <div>
        {isEditingDescription ? (
          <div className="space-y-1">
            <textarea
              ref={descriptionInputRef}
              value={descriptionValue}
              onChange={(e) => {
                if (e.target.value.length <= maxDescriptionChars) {
                  setDescriptionValue(e.target.value);
                }
              }}
              onBlur={handleDescriptionSubmit}
              onKeyDown={handleDescriptionKeyDown}
              placeholder="Add a note"
              className="text-muted-foreground bg-transparent border-none outline-none w-full p-0 m-0 placeholder:text-muted-foreground/60 resize-none overflow-y-auto max-h-20"
              rows={3}
              maxLength={maxDescriptionChars}
            />
            <div className="text-xs text-muted-foreground">
              {descriptionValue.length}/{maxDescriptionChars}
            </div>
          </div>
        ) : (
          <p
            className="text-muted-foreground cursor-pointer hover:bg-muted/50 rounded-md px-1 py-0.5 -mx-1 transition-colors min-h-[1.5rem] group"
            onClick={() => setIsEditingDescription(true)}
          >
            {descriptionValue || "Add a note"}
            <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity inline ml-2" />
          </p>
        )}
      </div>
    </div>
  );
}
