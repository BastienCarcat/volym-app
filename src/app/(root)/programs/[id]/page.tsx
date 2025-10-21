import React from "react";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { prefetchProgramWithSchedule } from "../_hooks/use-programs";
import ProgramEditor from "../_components/ProgramEditor";

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = new QueryClient();

  await prefetchProgramWithSchedule(queryClient, id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProgramEditor programId={id} />
    </HydrationBoundary>
  );
}
