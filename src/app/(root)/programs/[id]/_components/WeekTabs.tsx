"use client";

import { Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { DayOfWeek } from "@/generated/prisma";
import type { DbProgram } from "@/lib/database/get-program-by-id";
import { SessionCard } from "./session/session-card";
import { SessionInsights } from "./SessionInsights";
import { SessionEmptyCard } from "./session/session-empty-card";

const DAYS_OF_WEEK: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAY_ABBREVIATIONS: Record<DayOfWeek, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

interface WeekTabsProps {
  sessions: NonNullable<DbProgram>["sessions"];
  programId: string;
}

export function WeekTabs({ sessions, programId }: WeekTabsProps) {
  const sessionsMap = new Map(
    sessions.map((session) => [session.day, session])
  );

  return (
    <Tabs defaultValue="Monday" className="w-full">
      <TabsList className="grid w-full grid-cols-7">
        {DAYS_OF_WEEK.map((day) => {
          const hasSession = sessionsMap.has(day);

          return (
            <TabsTrigger
              key={day}
              value={day}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium">
                  {DAY_ABBREVIATIONS[day]}
                </span>
                {hasSession && (
                  <div className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </div>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {DAYS_OF_WEEK.map((day) => {
        const session = sessionsMap.get(day);

        return (
          <TabsContent key={day} value={day} className="mt-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <SessionInsights session={session} />
              </div>

              <div className="lg:col-span-2">
                {session ? (
                  <Suspense fallback={<div>Loading session...</div>}>
                    <SessionCard
                      day={day}
                      sessionId={session.id}
                      programId={programId}
                    />
                  </Suspense>
                ) : (
                  <SessionEmptyCard day={day} programId={programId} />
                )}
              </div>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
