"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./_components/columns";
import { ContentContainer } from "@/components/layout/page/content";
import { useTemplates } from "./_hooks/use-templates";
import { Loader2 } from "lucide-react";

export default function TemplatesPage() {
  const { data: templates, isLoading } = useTemplates();

  if (isLoading) {
    return (
      <ContentContainer>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground">Manage your workout templates</p>
        </div>
        <DataTable columns={columns} data={templates || []} />
      </div>
    </ContentContainer>
  );
}
