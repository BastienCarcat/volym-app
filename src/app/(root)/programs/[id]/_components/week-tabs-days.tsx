"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { DayOfWeek } from "@/generated/prisma";
import { SessionCard } from "@/components/features/sessions/session-card";
import { SessionEmptyCard } from "@/components/features/sessions/session-empty-card";
import { ProgramInsights } from "./insights/program-insights";
import { ProgramWithFullSessions } from "../../_hooks/use-programs";
import { useProgramContext } from "../_providers/program-provider";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS_OF_WEEK: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface WeekTabsDaysProps {
  program: ProgramWithFullSessions;
}

export function WeekTabsDays({ program }: WeekTabsDaysProps) {
  const { currentWeek, setCurrentWeek } = useProgramContext();
  const programId = program.id;

  // Get sessions for the current week
  const currentWeekSessions = useMemo(() => {
    const sessionsMap = new Map<DayOfWeek, typeof program.sessions[0]>();
    program.sessions
      .filter((s) => s.weekNumber === currentWeek && s.day)
      .forEach((s) => {
        if (s.day) {
          sessionsMap.set(s.day, s);
        }
      });
    return sessionsMap;
  }, [program.sessions, currentWeek]);

  // Navigation handlers
  const handlePreviousWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const handleNextWeek = () => {
    setCurrentWeek(currentWeek + 1);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousWeek}
          disabled={currentWeek === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous Week
        </Button>
        <div className="text-sm font-semibold">Week {currentWeek}</div>
        <Button variant="outline" size="sm" onClick={handleNextWeek}>
          Next Week
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="Monday" className="min-h-0 flex-1">
        <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-7 gap-1 p-1">
          {DAYS_OF_WEEK.map((day) => {
            const session = currentWeekSessions.get(day);

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

        <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="overflow-auto lg:col-span-1">
            <ProgramInsights program={program} />
          </div>

          {DAYS_OF_WEEK.map((day) => {
            const session = currentWeekSessions.get(day);

            return (
              <TabsContent
                key={day}
                value={day}
                className="h-full min-h-0 lg:col-span-2"
              >
                <div className="h-full min-h-0">
                  {session ? (
                    <SessionCard session={session} programId={programId} />
                  ) : (
                    <SessionEmptyCard
                      day={day}
                      programId={programId}
                      weekNumber={currentWeek}
                    />
                  )}
                </div>
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
    </div>
  );
}
