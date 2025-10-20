"use client";
import * as React from "react";
import { Control } from "react-hook-form";
import { cn } from "@/lib/utils";
import { TitleInput, FieldWrapper } from "@/components/form";

interface PageTitleProps extends React.ComponentProps<"div"> {
  control: Control<any>;
  titleName?: string;
  descriptionName?: string;
  maxTitleChars?: number;
  maxDescriptionChars?: number;
}

export function PageTitle({
  control,
  titleName = "title",
  descriptionName = "description",
  maxTitleChars = 70,
  maxDescriptionChars = 500,
  className,
  ...props
}: PageTitleProps) {
  return (
    <div
      className={cn(
        "border-border flex w-full flex-col border-b-1 px-24 py-10",
        className
      )}
      {...props}
    >
      <div className="mb-2">
        <FieldWrapper name={titleName} control={control}>
          {(props) => (
            <TitleInput
              {...props.field}
              placeholder="Enter title"
              maxLength={maxTitleChars}
              showCharCount
              as="h1"
            />
          )}
        </FieldWrapper>
      </div>

      <div>
        <FieldWrapper name={descriptionName} control={control}>
          {(props) => (
            <TitleInput
              {...props.field}
              placeholder="Add a note"
              maxLength={maxDescriptionChars}
              showCharCount
              rows={3}
              as="p"
              titleClassName="text-muted-foreground"
            />
          )}
        </FieldWrapper>
      </div>
    </div>
  );
}
