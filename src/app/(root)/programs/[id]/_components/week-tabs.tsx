"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { DayOfWeek } from "@/generated/prisma";
import { SessionCard } from "@/components/features/sessions/session-card";
import { SessionEmptyCard } from "@/components/features/sessions/session-empty-card";
import { ProgramInsights } from "./insights/program-insights";
import { ProgramWithFullSessions } from "../../_hooks/use-programs";
import { useProgramContext } from "../_providers/program-provider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMemo } from "react";
import { CycleSessionEmptyCard } from "@/components/features/sessions/cycle-session-empty-card";
import { RestDayCard } from "@/components/features/sessions/rest-day-card";

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
  program: ProgramWithFullSessions;
}

export function WeekTabs({ program }: WeekTabsProps) {
  const { currentWeek, setCurrentWeek } = useProgramContext();
  const programId = program.id;
  const isTypeDay = program.type === "Days";

  const weeks = useMemo(() => {
    const weekSet = new Set<number>();
    program.sessions.forEach((session) => {
      weekSet.add(session.weekNumber ?? 1);
    });
    return Array.from(weekSet).sort((a, b) => a - b);
  }, [program.sessions]);

  const maxWeek = weeks.length > 0 ? Math.max(...weeks) : 1;

  const handleAddWeek = () => {
    setCurrentWeek(maxWeek + 1);
  };

  // For Days type: Map by day
  const sessionsMapByDay = useMemo(() => {
    if (!isTypeDay) return new Map();
    const map = new Map();
    program.sessions
      .filter((session) => (session.weekNumber ?? 1) === currentWeek)
      .forEach((session) => {
        if (session.day) {
          map.set(session.day, session);
        }
      });
    return map;
  }, [program.sessions, currentWeek, isTypeDay]);

  // For Cycle type: Get all cycle days sorted
  const cycleDays = useMemo(() => {
    if (isTypeDay) return [];
    const days = program.sessions
      .filter((session) => (session.weekNumber ?? 1) === currentWeek)
      .sort((a, b) => (a.cycleDay ?? 0) - (b.cycleDay ?? 0));
    return days;
  }, [program.sessions, currentWeek, isTypeDay]);

  const maxCycleDay = useMemo(() => {
    if (isTypeDay) return 0;
    const days = cycleDays.map((s) => s.cycleDay ?? 0);
    return days.length > 0 ? Math.max(...days) : 0;
  }, [cycleDays, isTypeDay]);

  // Get the first tab value
  const defaultTabValue = isTypeDay
    ? "Monday"
    : cycleDays.length > 0
      ? `cycle-${cycleDays[0].cycleDay}`
      : "cycle-1";

  if (isTypeDay) {
    // Days type rendering
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {weeks.map((week) => (
              <Button
                key={week}
                variant={currentWeek === week ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentWeek(week)}
                className="shrink-0"
              >
                Week {week}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddWeek}
            className="shrink-0"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Week
          </Button>
        </div>

        <Tabs defaultValue={defaultTabValue} className="min-h-0 flex-1">
          <TabsList className="bg-muted/30 grid h-auto w-full grid-cols-7 gap-1 p-1">
            {DAYS_OF_WEEK.map((day) => {
              const session = sessionsMapByDay.get(day);

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
            const session = sessionsMapByDay.get(day);

            return (
              <TabsContent key={day} value={day} className="mt-6 min-h-0">
                <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-1">
                    <ProgramInsights program={program} />
                  </div>

                  <div className="min-h-0 lg:col-span-2">
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
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    );
  }

  // Cycle type rendering
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {weeks.map((week) => (
            <Button
              key={week}
              variant={currentWeek === week ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentWeek(week)}
              className="shrink-0"
            >
              Week {week}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddWeek}
          className="shrink-0"
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Week
        </Button>
      </div>

      <Tabs defaultValue={defaultTabValue} className="min-h-0 flex-1">
        <div className="flex items-center gap-2">
          <TabsList className="bg-muted/30 flex h-auto w-full gap-1 overflow-x-auto p-1">
            {cycleDays.map((session) => (
              <TabsTrigger
                key={session.id}
                value={`cycle-${session.cycleDay}`}
                className="data-[state=active]:bg-background data-[state=active]:ring-primary/20 relative h-auto shrink-0 cursor-pointer rounded-lg px-3 py-3 transition-all hover:bg-gray-100 data-[state=active]:shadow-sm data-[state=active]:ring-2"
              >
                <div className="flex min-h-[3rem] flex-col items-center gap-1.5">
                  <span className="text-muted-foreground data-[state=active]:text-primary text-xs font-medium">
                    Day {session.cycleDay}
                  </span>
                  {session.isRestDay ? (
                    <span className="bg-muted rounded px-2 py-0.5 text-xs font-medium">
                      Rest
                    </span>
                  ) : (
                    <span className="data-[state=active]:text-foreground line-clamp-2 text-center text-sm leading-tight font-semibold">
                      {session.name}
                    </span>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          <CycleSessionEmptyCard
            programId={programId}
            weekNumber={currentWeek}
            nextCycleDay={maxCycleDay + 1}
          />
        </div>

        {cycleDays.map((session) => (
          <TabsContent
            key={session.id}
            value={`cycle-${session.cycleDay}`}
            className="mt-6 min-h-0"
          >
            <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <ProgramInsights program={program} />
              </div>

              <div className="min-h-0 lg:col-span-2">
                {session.isRestDay ? (
                  <RestDayCard session={session} programId={programId} />
                ) : (
                  <SessionCard session={session} programId={programId} />
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
