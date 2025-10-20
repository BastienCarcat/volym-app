import React from "react";

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-4">Program Builder</h1>
      <p className="text-muted-foreground mb-2">
        Program ID: {id}
      </p>
      <p className="text-muted-foreground">
        This is where you will be able to build and schedule your training program.
      </p>
    </div>
  );
}
