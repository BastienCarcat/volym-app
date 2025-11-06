"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BadgeAlert, BadgeCheck, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  InsightStatus,
  type MuscleDetailedMetrics,
} from "../../../_hooks/insights/types";

interface MuscleDistributionSectionProps {
  metrics: MuscleDetailedMetrics[];
}

const chartConfig = {
  volume: {
    label: "Total Sets",
    color: "hsl(var(--chart-1))",
  },
  label: {
    color: "hsl(var(--background))",
  },
  critical: {
    label: "Critical",
    color: "#ef4444", // red-500
  },
  warning: {
    label: "Warning",
    color: "#f97316", // orange-500
  },
  good: {
    label: "Good",
    color: "#22c55e", // green-500
  },
} satisfies ChartConfig;

// Transform MuscleDetailedMetrics to chart data format
interface ChartData {
  muscle: string;
  volume: number;
  fill: string;
  originalData: MuscleDetailedMetrics;
}

const DAYS_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getBarColor(muscleData: MuscleDetailedMetrics): string {
  // Check if any metric is Critical
  if (
    muscleData.volume.status === InsightStatus.Critical ||
    muscleData.frequency.status === InsightStatus.Critical ||
    muscleData.recovery?.consecutiveDays?.status === InsightStatus.Critical
  ) {
    return "var(--color-critical)";
  }

  // Check if any metric is Warning
  if (
    muscleData.volume.status === InsightStatus.Warning ||
    muscleData.frequency.status === InsightStatus.Warning ||
    muscleData.recovery?.consecutiveDays?.status === InsightStatus.Warning
  ) {
    return "var(--color-warning)";
  }

  // Otherwise, it's Good or Excellent
  return "var(--color-good)";
}

function getStatusIcon(status: InsightStatus) {
  switch (status) {
    case InsightStatus.Excellent:
      return <BadgeCheck className="h-3.5 w-3.5 text-green-500" />;
    case InsightStatus.Good:
      return <BadgeCheck className="h-3.5 w-3.5 text-green-500" />;
    case InsightStatus.Warning:
      return <BadgeAlert className="h-3.5 w-3.5 text-orange-500" />;
    case InsightStatus.Critical:
      return <BadgeAlert className="h-3.5 w-3.5 text-red-500" />;
  }
}

function getStatusColor(status: InsightStatus): string {
  switch (status) {
    case InsightStatus.Excellent:
      return "text-green-600 dark:text-green-400";
    case InsightStatus.Good:
      return "text-green-600 dark:text-green-400";
    case InsightStatus.Warning:
      return "text-orange-600 dark:text-orange-400";
    case InsightStatus.Critical:
      return "text-red-600 dark:text-red-400";
  }
}

export function MuscleDistributionSection({
  metrics,
}: MuscleDistributionSectionProps) {
  // Transform metrics to chart data format
  const chartData: ChartData[] = metrics.map((m) => ({
    muscle: m.muscle,
    volume: m.volume.setsPerWeek,
    fill: getBarColor(m),
    originalData: m,
  }));

  const totalSets = metrics.reduce((acc, m) => acc + m.volume.setsPerWeek, 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Muscle distribution</h4>
      </div>

      <ChartContainer config={chartConfig} className="min-h-0 flex-1 w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{
            right: 50,
          }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            dataKey="muscle"
            type="category"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            hide
          />
          <XAxis dataKey="volume" type="number" hide />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideIndicator
                labelClassName="text-lg"
                labelFormatter={(_, payload) => {
                  const data = payload[0]?.payload as ChartData;
                  return data?.muscle || "";
                }}
                formatter={(_, __, item) => {
                  const data = item.payload as ChartData;
                  const muscleData = data.originalData;

                  return (
                    <div className="w-44 space-y-3">
                      {/* Volume section */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground text-xs font-medium">
                            Volume
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "text-xs font-medium",
                                getStatusColor(muscleData.volume.status)
                              )}
                            >
                              {muscleData.volume.setsPerWeek} sets/week
                            </span>
                            {getStatusIcon(muscleData.volume.status)}
                          </div>
                        </div>
                        <div className="text-muted-foreground text-[10px]">
                          Recommended: {muscleData.volume.minRecommended}-
                          {muscleData.volume.maxRecommended} sets
                        </div>
                      </div>

                      {/* Frequency section with calendar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground text-xs font-medium">
                            Frequency
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "text-xs font-medium",
                                getStatusColor(muscleData.frequency.status)
                              )}
                            >
                              {muscleData.frequency.timesPerWeek}x/week
                            </span>
                            {getStatusIcon(muscleData.frequency.status)}
                          </div>
                        </div>

                        {/* Mini calendar - always show */}
                        <div className="flex items-center gap-1">
                          <CalendarDays className="text-muted-foreground h-3 w-3" />
                          {DAYS_LABELS.map((day, index) => {
                            const isActive =
                              muscleData.frequency.dayIndices.includes(index);
                            return (
                              <div
                                key={index}
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded text-[10px] font-medium",
                                  isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/50 text-muted-foreground"
                                )}
                              >
                                {day}
                              </div>
                            );
                          })}
                        </div>

                        {/* Consecutive days warning */}
                        {muscleData.frequency.timesPerWeek > 1 &&
                          muscleData.recovery?.consecutiveDays && (
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="text-muted-foreground">
                                Recovery:
                              </span>
                              <span
                                className={cn(
                                  "font-medium",
                                  getStatusColor(
                                    muscleData.recovery.consecutiveDays.status
                                  )
                                )}
                              >
                                {muscleData.recovery.consecutiveDays
                                  .minRestDays === 0
                                  ? "Consecutive days"
                                  : `${muscleData.recovery.consecutiveDays.minRestDays} day${muscleData.recovery.consecutiveDays.minRestDays > 1 ? "s" : ""} min rest`}
                              </span>
                            </div>
                          )}
                      </div>

                      {/* Recommendations section */}
                      {muscleData.recommendations.length > 0 && (
                        <div className="border-t pt-2">
                          <span className="text-muted-foreground text-xs font-medium">
                            Recommendations
                          </span>
                          <div className="space-y-2 pt-2">
                            {muscleData.recommendations.map((rec, index) => (
                              <span
                                key={index}
                                className={cn(
                                  "block rounded-md p-1.5 text-[11px] leading-tight",
                                  rec.priority === "high" &&
                                    "bg-red-50 text-red-900 dark:bg-red-950/20 dark:text-red-400",
                                  rec.priority === "medium" &&
                                    "bg-orange-50 text-orange-900 dark:bg-orange-950/20 dark:text-orange-400",
                                  rec.priority === "low" &&
                                    "bg-blue-50 text-blue-900 dark:bg-blue-950/20 dark:text-blue-400"
                                )}
                              >
                                <BadgeAlert className="mr-1 inline h-3 w-3 align-text-top" />
                                {rec.message}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            }
          />
          <Bar
            dataKey="volume"
            layout="vertical"
            radius={4}
            barSize={24}
            minPointSize={3}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="muscle"
              position="insideLeft"
              offset={8}
              className="fill-white"
              textBreakAll
              fontSize={12}
              content={(props) => {
                const { x, y, value, height, index } = props;

                if (
                  typeof x !== "number" ||
                  typeof y !== "number" ||
                  typeof height !== "number" ||
                  typeof index !== "number"
                ) {
                  return null;
                }

                // Get the actual data to check if volume is 0
                const data = chartData[index];

                if (data.volume === 0) {
                  return (
                    <text
                      x={x + 8}
                      y={y + height / 2}
                      className="fill-foreground"
                      fontSize={12}
                      dominantBaseline="middle"
                    >
                      {value}
                    </text>
                  );
                }

                return (
                  <text
                    x={x + 8}
                    y={y + height / 2}
                    className="fill-white"
                    fontSize={12}
                    dominantBaseline="middle"
                  >
                    {value}
                  </text>
                );
              }}
            />
            <LabelList
              dataKey="volume"
              position="right"
              offset={8}
              className="fill-foreground"
              fontSize={12}
              content={(props) => {
                const { x, y, value, height, width } = props;

                if (
                  value === 0 ||
                  typeof x !== "number" ||
                  typeof y !== "number" ||
                  typeof width !== "number" ||
                  typeof height !== "number"
                ) {
                  return null;
                }

                return (
                  <text
                    x={x + width + 6}
                    y={y + height / 2}
                    className="fill-foreground"
                    fontSize={12}
                    textAnchor="start"
                    dominantBaseline="middle"
                  >
                    {value} sets
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
