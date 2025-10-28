"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ProgramWithFullSessions } from "../../../_hooks/use-programs";
import { useMuscleDistribution } from "../../../_hooks/use-muscle-distribution";
import { useProgramContext } from "../../_providers/program-provider";

interface MuscleDistributionProps {
  program: ProgramWithFullSessions;
}

const chartConfig = {
  sets: {
    label: "Sets",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function MuscleDistribution({ program }: MuscleDistributionProps) {
  const { activeSessionId, activeSessionFormValues } = useProgramContext();

  const chartData = useMuscleDistribution({
    program,
    activeSessionId,
    activeSessionFormValues,
  });
  return (
    <div className="space-y-3 border-t pt-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Muscle distribution</h4>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-2 text-sm">
          {chartData.map((muscle) => (
            <div
              key={muscle.muscle}
              className="flex items-center justify-between"
            >
              <span className="text-muted-foreground">{muscle.muscle}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{muscle.sets} sets</span>
              </div>
            </div>
          ))}
        </div>
        <ChartContainer config={chartConfig} className="max-h-[150px] w-1/2">
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarGrid strokeDasharray="2" />
            <PolarAngleAxis dataKey="muscle" tick={{ fontSize: 12 }} />
            <Radar
              dataKey="sets"
              fill="var(--color-sets)"
              stroke="var(--color-sets)"
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </div>
    </div>
  );
}
