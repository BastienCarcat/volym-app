"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { CreateCycleSessionDialog } from "./create-cycle-session-dialog";

interface CycleSessionEmptyCardProps {
  programId: string;
  weekNumber: number;
  nextCycleDay: number;
}

export function CycleSessionEmptyCard({
  programId,
  weekNumber,
  nextCycleDay,
}: CycleSessionEmptyCardProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="shrink-0"
      >
        <Plus className="mr-1 h-4 w-4" />
        Add Day
      </Button>
      <CreateCycleSessionDialog
        programId={programId}
        weekNumber={weekNumber}
        cycleDay={nextCycleDay}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
