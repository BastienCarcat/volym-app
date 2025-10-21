import React from "react";
import { ProgramInsightsCard } from "../_components/program-insights-card";

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-3xl font-semibold">Program Builder</h1>
      <p className="text-muted-foreground mb-2">Program ID: {id}</p>
      <p className="text-muted-foreground">
        This is where you will be able to build and schedule your training
        program.
      </p>
      <ProgramInsightsCard />
    </div>
  );
}
