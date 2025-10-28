"use client";

import { notFound, useParams } from "next/navigation";
import { useProgram } from "../_hooks/use-programs";
import { ProgramHeader } from "./_components/ProgramHeader";
import { WeekTabs } from "./_components/week-tabs";
import { ContentContainer } from "@/components/layout/page/content";
import { ProgramPageSkeleton } from "./_components/loaders/program-page-skeleton";
import { ProgramProvider } from "./_providers/program-provider";

export default function ProgramPage() {
  const { id } = useParams<{ id: string }>();
  const { data: program, isLoading } = useProgram(id);

  if (isLoading) {
    return <ProgramPageSkeleton />;
  }
  if (!program) {
    notFound();
  }

  return (
    <ProgramProvider programId={id}>
      <ContentContainer>
        <ProgramHeader program={program} />
        <WeekTabs program={program} />
      </ContentContainer>
    </ProgramProvider>
  );
}
