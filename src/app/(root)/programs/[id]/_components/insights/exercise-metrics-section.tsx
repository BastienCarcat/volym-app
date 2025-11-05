"use client";

import { cn } from "@/lib/utils";
import { Dumbbell, TrendingUp } from "lucide-react";
import type { ExerciseMetrics } from "../../../_hooks/insights/types";

interface ExerciseMetricsSectionProps {
  metrics: ExerciseMetrics;
}

function getStatusColor(status: string): string {
  if (status === "excellent") return "text-green-600 dark:text-green-400";
  if (status === "good") return "text-blue-600 dark:text-blue-400";
  if (status === "warning") return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function getStatusBgColor(status: string): string {
  if (status === "excellent") return "bg-green-50 dark:bg-green-950/20";
  if (status === "good") return "bg-blue-50 dark:bg-blue-950/20";
  if (status === "warning") return "bg-orange-50 dark:bg-orange-950/20";
  return "bg-red-50 dark:bg-red-950/20";
}

export function ExerciseMetricsSection({
  metrics,
}: ExerciseMetricsSectionProps) {
  const { compoundIsolationRatio, totalExercises, uniqueExercises } = metrics;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Exercise Selection</h4>
        <span className="text-muted-foreground text-xs">
          {totalExercises} total exercises
        </span>
      </div>

      <div className="space-y-3">
        {/* Compound/Isolation ratio */}
        <div
          className={cn(
            "space-y-2 rounded-lg border p-3",
            getStatusBgColor(compoundIsolationRatio.status)
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="text-muted-foreground h-4 w-4" />
              <span className="text-xs font-medium">
                Compound/Isolation Balance
              </span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp
                className={cn(
                  "h-3.5 w-3.5",
                  getStatusColor(compoundIsolationRatio.status)
                )}
              />
              <span
                className={cn(
                  "text-xs font-semibold",
                  getStatusColor(compoundIsolationRatio.status)
                )}
              >
                {compoundIsolationRatio.score.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Progress bars */}
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Compound</span>
                <span className="font-medium">
                  {compoundIsolationRatio.compound} exercises (
                  {compoundIsolationRatio.compoundPercentage.toFixed(0)}%)
                </span>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{
                    width: `${compoundIsolationRatio.compoundPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Isolation</span>
                <span className="font-medium">
                  {compoundIsolationRatio.isolation} exercises (
                  {compoundIsolationRatio.isolationPercentage.toFixed(0)}%)
                </span>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="h-full bg-purple-500 transition-all"
                  style={{
                    width: `${compoundIsolationRatio.isolationPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {compoundIsolationRatio.recommendations.length > 0 && (
            <div className="space-y-1 pt-1">
              {compoundIsolationRatio.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="bg-background/50 text-muted-foreground rounded-md p-1.5 text-[11px] leading-tight"
                >
                  {rec}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exercise variety */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-card rounded-lg border p-3">
            <div className="text-muted-foreground text-xs">Total Exercises</div>
            <div className="mt-1 text-2xl font-bold">{totalExercises}</div>
          </div>
          <div className="bg-card rounded-lg border p-3">
            <div className="text-muted-foreground text-xs">
              Unique Exercises
            </div>
            <div className="mt-1 text-2xl font-bold">{uniqueExercises}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
