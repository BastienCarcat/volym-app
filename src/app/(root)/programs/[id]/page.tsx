"use client";

import { notFound, useParams } from "next/navigation";
import { useProgram } from "../_hooks/use-programs";
import { ProgramHeader } from "./_components/ProgramHeader";
import { WeekTabs } from "./_components/WeekTabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentContainer } from "@/components/layout/page/content";

export default function ProgramPage() {
  const { id } = useParams<{ id: string }>();
  const { data: program, isLoading, error } = useProgram(id);

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 py-6">
        <ProgramLoadingSkeleton />
      </div>
    );
  }
  if (error || !program) {
    notFound();
  }

  return (
    <ContentContainer>
      <ProgramHeader program={program} />
      <WeekTabs sessions={program.sessions} programId={id} />
    </ContentContainer>
  );
}

function ProgramLoadingSkeleton() {
  return (
    <>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-96 w-full" />
    </>
  );
}
