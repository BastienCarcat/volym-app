"use client";

import { Dumbbell, Info } from "lucide-react";
import type { ExerciseMetrics } from "../../../_hooks/insights/types";
import { InsightStatus } from "../../../_hooks/insights/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface ExerciseMetricsSectionProps {
  metrics: ExerciseMetrics;
}

function getSliderColor(status: InsightStatus): string {
  switch (status) {
    case InsightStatus.Excellent:
    case InsightStatus.Good:
      return "#22c55e";
    case InsightStatus.Warning:
      return "#f97316";
    case InsightStatus.Critical:
      return "#ef4444";
  }
}

export function ExerciseMetricsSection({
  metrics,
}: ExerciseMetricsSectionProps) {
  const { compoundIsolationRatio, totalExercises, uniqueExercises } = metrics;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Exercise Selection</h4>
      </div>

      <div className="space-y-3">
        {/* Compound/Isolation ratio */}
        <Card className="gap-2 py-3 shadow-none">
          <CardHeader className="px-4 pb-0">
            <CardTitle className="text-muted-foreground text-xs">
              Compound/Isolation Balance
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2 px-4">
            {/* Labels */}
            <div>
              <div className="text-foreground flex items-center justify-between text-[11px] font-medium">
                <span>Compound</span>
                <span>Isolation</span>
              </div>
              <div className="text-muted-foreground flex items-center justify-between text-[11px] font-medium">
                <span>
                  {compoundIsolationRatio.compound} exercises (
                  {compoundIsolationRatio.compoundPercentage.toFixed(0)}%)
                </span>
                <span>
                  {compoundIsolationRatio.isolation} exercises (
                  {compoundIsolationRatio.isolationPercentage.toFixed(0)}%)
                </span>
              </div>
            </div>

            {/* Slider */}
            <div
              style={{
                // @ts-ignore - CSS custom properties
                "--slider-range-color": getSliderColor(
                  compoundIsolationRatio.status
                ),
                "--slider-thumb-color": getSliderColor(
                  compoundIsolationRatio.status
                ),
              }}
            >
              <Slider
                value={[compoundIsolationRatio.compoundPercentage]}
                readOnly
                className="cursor-default"
              />
            </div>

            {/* Recommendations */}
            {compoundIsolationRatio.recommendations.length > 0 && (
              <div className="space-y-1 pt-1">
                {compoundIsolationRatio.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="bg-background/50 text-muted-foreground flex gap-1.5 rounded-md p-1.5 text-[11px] leading-tight"
                  >
                    <Info className="h-3 w-3" />
                    {rec}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercise variety */}
        <div className="grid grid-cols-2 gap-2">
          <Card className="gap-1 py-3 shadow-none">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-muted-foreground text-xs">
                Total Exercises
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div className="mt-1 text-2xl font-bold">{totalExercises}</div>
            </CardContent>
          </Card>
          <Card className="gap-1 py-3 shadow-none">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-muted-foreground text-xs">
                Unique Exercises
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div className="mt-1 text-2xl font-bold">{uniqueExercises}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
