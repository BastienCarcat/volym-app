"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DayOfWeek } from "../types";

interface WeekTimelineProps {
  selectedDay: DayOfWeek;
  onDaySelect: (day: DayOfWeek) => void;
  scheduledDays: Set<DayOfWeek>;
}

const DAYS_OF_WEEK = [
  DayOfWeek.Monday,
  DayOfWeek.Tuesday,
  DayOfWeek.Wednesday,
  DayOfWeek.Thursday,
  DayOfWeek.Friday,
  DayOfWeek.Saturday,
  DayOfWeek.Sunday,
];

const DAY_ABBREVIATIONS: Record<DayOfWeek, string> = {
  [DayOfWeek.Monday]: "Mon",
  [DayOfWeek.Tuesday]: "Tue",
  [DayOfWeek.Wednesday]: "Wed",
  [DayOfWeek.Thursday]: "Thu",
  [DayOfWeek.Friday]: "Fri",
  [DayOfWeek.Saturday]: "Sat",
  [DayOfWeek.Sunday]: "Sun",
};

export function WeekTimeline({
  selectedDay,
  onDaySelect,
  scheduledDays,
}: WeekTimelineProps) {
  return (
    <div className="flex gap-2 mb-6">
      {DAYS_OF_WEEK.map((day) => {
        const isSelected = selectedDay === day;
        const hasWorkout = scheduledDays.has(day);

        return (
          <Button
            key={day}
            onClick={() => onDaySelect(day)}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "flex-1 relative",
              !isSelected && "hover:bg-accent"
            )}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-medium">
                {DAY_ABBREVIATIONS[day]}
              </span>
              {hasWorkout && (
                <Badge
                  variant={isSelected ? "secondary" : "default"}
                  className="h-1.5 w-1.5 rounded-full p-0"
                />
              )}
            </div>
          </Button>
        );
      })}
    </div>
  );
}
