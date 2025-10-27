"use client";

import { notFound, useParams } from "next/navigation";
import { useProgram } from "../_hooks/use-programs";
import { ProgramHeader } from "./_components/ProgramHeader";
import { WeekTabs } from "./_components/week-tabs";
import { ContentContainer } from "@/components/layout/page/content";
import { ProgramPageSkeleton } from "./_components/loaders/program-page-skeleton";

export default function ProgramPage() {
  const { id } = useParams<{ id: string }>();
  const { data: program, isLoading, error } = useProgram(id);

  if (isLoading) {
    return <ProgramPageSkeleton />;
  }
  if (!program) {
    notFound();
  }

  return (
    <ContentContainer>
      <ProgramHeader program={program} />
      <WeekTabs sessions={program.sessions} programId={id} />
    </ContentContainer>
  );
}
