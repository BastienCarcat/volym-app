"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Plus, Dumbbell, Moon, Calendar } from "lucide-react";
import type { DayOfWeek } from "@/generated/prisma";
import { CreateSessionDialog } from "./create-session-dialog";
import { useCreateSession } from "@/hooks/use-sessions";
import { toast } from "sonner";

interface SessionEmptyCardProps {
  programId: string;
  // For Days type
  day?: DayOfWeek;
  weekNumber?: number;
  // For Cycle type
  cycleDay?: number;
  totalDays?: number;
}

export function SessionEmptyCard({
  programId,
  day,
  weekNumber,
  cycleDay,
  totalDays,
}: SessionEmptyCardProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { mutate: createSession, isPending } = useCreateSession();

  const isCycleType = cycleDay !== undefined;
  const isDay1Only = isCycleType && totalDays === 1;
  const showRestDayButton = isCycleType && !isDay1Only;

  const handleAddRestDay = () => {
    if (!isCycleType || !cycleDay) return;

    createSession(
      {
        programId,
        cycleDay,
        name: "Rest Day",
        isRestDay: true,
      },
      {
        onSuccess: () => {
          toast.success("Rest day added successfully");
        },
        onError: () => {
          toast.error("Failed to add rest day");
        },
      }
    );
  };

  const title = isCycleType ? `Day ${cycleDay}` : undefined;
  const description = isCycleType
    ? isDay1Only
      ? "Create your first training session"
      : "Create a training session or add a rest day"
    : undefined;

  const emptyTitle = isCycleType ? "No Session Yet" : "No session scheduled";
  const emptyDescription = isCycleType
    ? isDay1Only
      ? "Start building your cycle by creating your first training session."
      : "Add a training session or mark this day as a rest day."
    : `Create a new session for ${day} to get started.`;

  return (
    <>
      <Card className="h-full">
        {/* {isCycleType && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        )} */}
        <CardContent className="flex h-full items-center py-16">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                {isCycleType ? <Calendar /> : <Dumbbell />}
              </EmptyMedia>
              <EmptyTitle>{emptyTitle}</EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  disabled={isPending}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Session
                </Button>
                {showRestDayButton && (
                  <Button
                    variant="outline"
                    onClick={handleAddRestDay}
                    disabled={isPending}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Add Rest Day
                  </Button>
                )}
              </div>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
      <CreateSessionDialog
        programId={programId}
        day={day}
        weekNumber={weekNumber}
        cycleDay={cycleDay}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
