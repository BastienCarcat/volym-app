"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Plus, Dumbbell } from "lucide-react";
import type { DayOfWeek } from "@/generated/prisma";
import { CreateSessionDialog } from "./create-session-dialog";

interface SessionEmptyCardProps {
  day: DayOfWeek;
  programId: string;
}

export function SessionEmptyCard({ day, programId }: SessionEmptyCardProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <>
      <Card className="h-full">
        <CardContent className="flex h-full items-center py-16">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Dumbbell />
              </EmptyMedia>
              <EmptyTitle>No session scheduled</EmptyTitle>
              <EmptyDescription>
                Create a new session for {day} to get started.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Session
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
      <CreateSessionDialog
        programId={programId}
        day={day}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
