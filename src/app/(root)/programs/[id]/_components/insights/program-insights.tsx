"use client";

import { useProgramContext } from "../../_providers/program-provider";
import { useProgramInsights } from "../../../_hooks/use-program-insights";
import type { ProgramWithFullSessions } from "../../../_hooks/use-programs";
import { ScoreBadge } from "./score-badge";
import { MuscleDistributionSection } from "./muscle-distribution-section";
import { ExerciseMetricsSection } from "./exercise-metrics-section";

interface ProgramInsightsProps {
  program: ProgramWithFullSessions;
}

export function ProgramInsights({ program }: ProgramInsightsProps) {
  const { activeSessionId, activeSessionFormValues, currentWeek } =
    useProgramContext();

  const insights = useProgramInsights({
    program,
    activeSessionId,
    activeSessionFormValues,
    currentWeek,
  });

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-bold">Insights</h2>
        <ScoreBadge score={insights.totalScore} size="sm" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <MuscleDistributionSection metrics={insights.muscleMetrics} />
        <ExerciseMetricsSection metrics={insights.exerciseMetrics} />
      </div>
    </div>
  );
}
