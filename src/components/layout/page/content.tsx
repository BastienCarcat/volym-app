import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

const ContentContainerVariants = cva(
  "p-6 flex container overflow-hidden w-full",
  {
    variants: {
      spacing: {
        default: "space-y-6 h-full",
      },
      orientation: {
        default: "flex-col",
      },
    },
    defaultVariants: {
      spacing: "default",
      orientation: "default",
    },
  }
);

export const ContentContainer = (
  props: ComponentProps<"div"> & VariantProps<typeof ContentContainerVariants>
) => {
  return (
    <div
      {...props}
      className={cn(
        ContentContainerVariants({
          spacing: props.spacing,
          orientation: props.orientation,
        }),
        props.className
      )}
    />
  );
};
