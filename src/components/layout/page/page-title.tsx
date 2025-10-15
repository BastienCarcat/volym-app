"use client";
import * as React from "react";
import { Control } from "react-hook-form";
import { cn } from "@/lib/utils";
import { TitleInput } from "@/components/form";

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
        "flex flex-col w-full py-10 px-24 border-b-1 border-border",
        className
      )}
      {...props}
    >
      <div className="mb-2">
        <TitleInput
          name={titleName}
          control={control}
          placeholder="Enter title"
          maxLength={maxTitleChars}
          showCharCount
          as="h1"
        />
      </div>

      <div>
        <TitleInput
          name={descriptionName}
          control={control}
          placeholder="Add a note"
          maxLength={maxDescriptionChars}
          showCharCount
          rows={3}
          as="p"
          titleClassName="text-muted-foreground"
        />
      </div>
    </div>
  );
}
