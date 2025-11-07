"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Moon, Dumbbell } from "lucide-react";
import { useConvertRestDayToSession } from "@/hooks/use-sessions";
import { toast } from "sonner";
import type { ProgramWithFullSessions } from "@/app/(root)/programs/_hooks/use-programs";

interface SessionRestDayCardProps {
  session: ProgramWithFullSessions["sessions"][0];
  programId: string;
}

export function SessionRestDayCard({
  session,
  programId,
}: SessionRestDayCardProps) {
  const { mutate: convertToSession, isPending } = useConvertRestDayToSession();

  const handleConvertToSession = () => {
    convertToSession(
      { sessionId: session.id, programId },
      {
        onSuccess: () => {
          toast.success("Rest day converted to session");
        },
        onError: () => {
          toast.error("Failed to convert rest day to session");
        },
      }
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          <h2 className="py-0.5 text-2xl font-semibold">{session.name}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-full items-center py-16">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Moon />
            </EmptyMedia>
            <EmptyTitle>Rest Day</EmptyTitle>
            <EmptyDescription>
              This is a scheduled rest day in your training cycle. Use this time
              for recovery and preparation.
            </EmptyDescription>
          </EmptyHeader>
          {session.note && (
            <div className="text-muted-foreground mt-4 text-sm">
              <p className="font-medium">Note:</p>
              <p>{session.note}</p>
            </div>
          )}
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={handleConvertToSession}
              disabled={isPending}
            >
              <Dumbbell className="mr-2 h-4 w-4" />
              Convert to Training Session
            </Button>
          </div>
        </Empty>
      </CardContent>
    </Card>
  );
}
