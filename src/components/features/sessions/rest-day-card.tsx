"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Moon } from "lucide-react";
import { Session } from "@/hooks/use-sessions";

interface RestDayCardProps {
  session: Session;
  programId: string;
}

export function RestDayCard({ session }: RestDayCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{session.name}</CardTitle>
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
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-medium">Note:</p>
              <p>{session.note}</p>
            </div>
          )}
        </Empty>
      </CardContent>
    </Card>
  );
}
