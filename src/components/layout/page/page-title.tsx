import * as React from "react";

export function PageTitle({
  title,
}: React.ComponentProps<"div"> & { title: string }) {
  return (
    <div className="flex w-full py-10 px-24 border-b-1 border-border">
      <h1 className="text-3xl font-semibold">{title}</h1>
    </div>
  );
}
