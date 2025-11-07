"use client";

import { ProgramWithFullSessions } from "../../_hooks/use-programs";
import { WeekTabsDays } from "./week-tabs-days";
import { WeekTabsCycle } from "./week-tabs-cycle";

interface WeekTabsProps {
  program: ProgramWithFullSessions;
}

export function WeekTabs({ program }: WeekTabsProps) {
  const isTypeDay = program.type === "Days";

  if (isTypeDay) {
    return <WeekTabsDays program={program} />;
  }

  return <WeekTabsCycle program={program} />;
}
