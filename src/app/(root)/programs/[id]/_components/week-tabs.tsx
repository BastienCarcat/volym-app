"use client";

import { Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { DayOfWeek } from "@/generated/prisma";
import type { DbProgram } from "@/lib/database/get-program-by-id";
import { SessionCard } from "./session/session-card";
import { SessionEmptyCard } from "./session/session-empty-card";
import { SessionInsights } from "./insights/SessionInsights";

const DAYS_OF_WEEK: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface WeekTabsProps {
  sessions: NonNullable<DbProgram>["sessions"];
  programId: string;
}

export function WeekTabs({ sessions, programId }: WeekTabsProps) {
  const sessionsMap = new Map(
    sessions.map((session) => [session.day, session])
  );

  return (
    <Tabs defaultValue="Monday" className="min-h-0 flex-1">
      <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-7 gap-1 p-1">
        {DAYS_OF_WEEK.map((day) => {
          const session = sessionsMap.get(day);

          return (
            <TabsTrigger
              key={day}
              value={day}
              className="data-[state=active]:bg-background data-[state=active]:ring-primary/20 relative h-auto cursor-pointer rounded-lg px-2 py-3 transition-all hover:bg-gray-100 data-[state=active]:shadow-sm data-[state=active]:ring-2"
            >
              <div className="flex min-h-[3rem] flex-col items-center gap-1.5">
                <span className="text-muted-foreground data-[state=active]:text-primary text-xs font-medium tracking-wider uppercase">
                  {day}
                </span>
                {session ? (
                  <span className="data-[state=active]:text-foreground line-clamp-2 text-center text-sm leading-tight font-semibold">
                    {session.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground/40 text-xs italic">
                    Rest
                  </span>
                )}
              </div>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {DAYS_OF_WEEK.map((day) => {
        const session = sessionsMap.get(day);

        return (
          <TabsContent key={day} value={day} className="mt-6 min-h-0">
            <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <SessionInsights session={session} />
              </div>

              <div className="min-h-0 lg:col-span-2">
                {session ? (
                  <Suspense fallback={<div>Loading session...</div>}>
                    <SessionCard sessionId={session.id} programId={programId} />
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
