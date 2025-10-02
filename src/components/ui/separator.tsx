"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const separatorVariants = cva("shrink-0", {
  variants: {
    variant: {
      solid: "",
      dashed: "border-dashed border-border bg-transparent",
    },
    orientation: {
      horizontal: "",
      vertical: "",
    },
  },
  compoundVariants: [
    {
      variant: "solid",
      orientation: "horizontal",
      class: "bg-border h-px w-full",
    },
    {
      variant: "solid",
      orientation: "vertical",
      class: "bg-border w-px h-full",
    },
    {
      variant: "dashed",
      orientation: "horizontal",
      class: "border-t h-px w-full",
    },
    {
      variant: "dashed",
      orientation: "vertical",
      class: "border-l w-px h-full",
    },
  ],
  defaultVariants: {
    variant: "solid",
    orientation: "horizontal",
  },
});

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  variant = "solid",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> &
  VariantProps<typeof separatorVariants>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(separatorVariants({ variant, orientation }), className)}
      {...props}
    />
  );
}

export { Separator };
