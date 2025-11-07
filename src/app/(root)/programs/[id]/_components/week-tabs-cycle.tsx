"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SessionCard } from "@/components/features/sessions/session-card";
import { SessionEmptyCard } from "@/components/features/sessions/session-empty-card";
import { SessionRestDayCard } from "@/components/features/sessions/session-rest-day-card";
import { ProgramInsights } from "./insights/program-insights";
import { ProgramWithFullSessions } from "../../_hooks/use-programs";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface WeekTabsCycleProps {
  program: ProgramWithFullSessions;
}

export function WeekTabsCycle({ program }: WeekTabsCycleProps) {
  const [activeTab, setActiveTab] = useState("cycle-1");
  const programId = program.id;

  // Get all cycle days sorted (no week filter)
  const cycleDays = useMemo(() => {
    const days = program.sessions.sort(
      (a, b) => (a.cycleDay ?? 0) - (b.cycleDay ?? 0)
    );
    return days;
  }, [program.sessions]);

  const maxCycleDay = useMemo(() => {
    const days = cycleDays.map((s) => s.cycleDay ?? 0);
    return days.length > 0 ? Math.max(...days) : 0;
  }, [cycleDays]);

  // State to manage the number of days to display (including virtual days without sessions)
  const [displayedDaysCount, setDisplayedDaysCount] = useState(
    Math.max(maxCycleDay, 1)
  );

  // Update displayedDaysCount when maxCycleDay changes (e.g., when a new session is created)
  useEffect(() => {
    if (maxCycleDay > displayedDaysCount) {
      setDisplayedDaysCount(maxCycleDay);
    }
  }, [maxCycleDay]);

  // Build an array of all days to display (1 to displayedDaysCount)
  const allDays = useMemo(() => {
    const days = [];
    for (let i = 1; i <= displayedDaysCount; i++) {
      const session = cycleDays.find((s) => s.cycleDay === i);
      days.push({
        cycleDay: i,
        session: session || null,
      });
    }
    return days;
  }, [displayedDaysCount, cycleDays]);

  const totalDays = displayedDaysCount;
  const lastDaySession = cycleDays.find(
    (s) => s.cycleDay === displayedDaysCount
  );

  const handleAddDay = () => {
    // Add new day and auto-select it
    const newDay = displayedDaysCount + 1;
    setDisplayedDaysCount(newDay);
    setActiveTab(`cycle-${newDay}`);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="min-h-0 flex-1"
      >
        <div className="flex items-center gap-2">
          <TabsList className="bg-muted/30 flex h-auto w-full gap-1 overflow-x-auto p-1">
            {allDays.map((day) => (
              <TabsTrigger
                key={`day-${day.cycleDay}`}
                value={`cycle-${day.cycleDay}`}
                className="data-[state=active]:bg-background data-[state=active]:ring-primary/20 relative h-auto shrink-0 cursor-pointer rounded-lg px-3 py-3 transition-all hover:bg-gray-100 data-[state=active]:shadow-sm data-[state=active]:ring-2"
              >
                <div className="flex min-h-[3rem] flex-col items-center gap-1.5">
                  <span className="text-muted-foreground data-[state=active]:text-primary text-xs font-medium">
                    Day {day.cycleDay}
                  </span>
                  {day.session ? (
                    day.session.isRestDay ? (
                      <span className="bg-muted rounded px-2 py-0.5 text-xs font-medium">
                        Rest
                      </span>
                    ) : (
                      <span className="data-[state=active]:text-foreground line-clamp-2 text-center text-sm leading-tight font-semibold">
                        {day.session.name}
                      </span>
                    )
                  ) : (
                    <span className="text-muted-foreground/40 text-xs italic">
                      Empty
                    </span>
                  )}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddDay}
            className="shrink-0"
            disabled={!lastDaySession}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Day
          </Button>
        </div>

        <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="overflow-auto lg:col-span-1">
            <ProgramInsights program={program} />
          </div>

          {allDays.map((day) => (
            <TabsContent
              key={`content-${day.cycleDay}`}
              value={`cycle-${day.cycleDay}`}
              className="h-full min-h-0 lg:col-span-2"
            >
              <div className="h-full min-h-0">
                {day.session ? (
                  day.session.isRestDay ? (
                    <SessionRestDayCard
                      session={day.session}
                      programId={programId}
                    />
                  ) : (
                    <SessionCard session={day.session} programId={programId} />
                  )
                ) : (
                  <SessionEmptyCard
                    programId={programId}
                    cycleDay={day.cycleDay}
                    totalDays={totalDays}
                  />
                )}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
