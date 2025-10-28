"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

function getScoreColor(score: number) {
  if (score >= 90) return "text-green-600 dark:text-green-500";
  if (score >= 80) return "text-yellow-600 dark:text-yellow-500";
  if (score >= 70) return "text-orange-600 dark:text-orange-500";
  return "text-red-600 dark:text-red-500";
}

function getScoreBgColor(score: number) {
  if (score >= 90) return "bg-green-500/10";
  if (score >= 80) return "bg-yellow-500/10";
  if (score >= 70) return "bg-orange-500/10";
  return "bg-red-500/10";
}

interface MetricIndicatorProps {
  isGood: boolean;
}

function MetricIndicator({ isGood }: MetricIndicatorProps) {
  return isGood ? (
    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
  ) : (
    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
  );
}

export function ProgramInsightsTabs() {
  const [showProgramDetails, setShowProgramDetails] = useState(false);
  const [showWorkoutDetails, setShowWorkoutDetails] = useState(false);

  const programScore = 85;
  const workoutScore = 92;

  return (
    <>
      <div
        className={`rounded-lg p-4 ${getScoreBgColor(programScore)} flex items-center justify-between`}
      >
        <div>
          <p className="text-muted-foreground mb-1 text-xs">Program Score</p>
          <p className={`text-3xl font-bold ${getScoreColor(programScore)}`}>
            {programScore}
            <span className="text-base">/100</span>
          </p>
        </div>
        <div className="text-muted-foreground text-right text-xs">
          <p>Good quality</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Overview</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Workouts</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">4 / week</span>
              <MetricIndicator isGood={true} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Avg duration</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">75 min</span>
              <MetricIndicator isGood={true} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Avg intensity</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">RPE 7.5</span>
              <MetricIndicator isGood={true} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Progressive load</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">+2% / week</span>
              <MetricIndicator isGood={true} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t pt-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Weekly distribution</h4>
          <MetricIndicator isGood={true} />
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex gap-1">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div
                key={day}
                className={`flex h-8 flex-1 items-center justify-center rounded text-xs ${
                  [0, 2, 4, 6].includes(i)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {day[0]}
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            No overtraining detected
          </p>
        </div>
      </div>

      <div className="space-y-3 border-t pt-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Muscle distribution</h4>
          <MetricIndicator isGood={false} />
        </div>
        <div className="bg-muted text-muted-foreground flex h-40 items-center justify-center rounded text-sm">
          Radar chart here
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Chest</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">12 sets</span>
              <MetricIndicator isGood={true} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Back</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">16 sets</span>
              <MetricIndicator isGood={true} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Legs</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">18 sets</span>
              <MetricIndicator isGood={true} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Shoulders</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">10 sets</span>
              <MetricIndicator isGood={true} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Arms</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">8 sets</span>
              <MetricIndicator isGood={false} />
            </div>
          </div>
        </div>
      </div>

      {showProgramDetails && (
        <>
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Balance & Coherence</h4>
              <MetricIndicator isGood={true} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Squat pattern</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">60/40</span>
                  <MetricIndicator isGood={true} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pull pattern</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">55/45</span>
                  <MetricIndicator isGood={true} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Push pattern</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">50/50</span>
                  <MetricIndicator isGood={true} />
                </div>
              </div>
            </div>
            <div className="mt-2 rounded bg-green-500/10 p-2 text-xs text-green-700 dark:text-green-400">
              All patterns balanced
            </div>
          </div>
        </>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => setShowProgramDetails(!showProgramDetails)}
      >
        {showProgramDetails ? (
          <>
            <ChevronUp className="mr-2 h-4 w-4" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="mr-2 h-4 w-4" />
            Show details
          </>
        )}
      </Button>

      <div
        className={`rounded-lg p-4 ${getScoreBgColor(workoutScore)} flex items-center justify-between`}
      >
        <div>
          <p className="text-muted-foreground mb-1 text-xs">Workout Score</p>
          <p className={`text-3xl font-bold ${getScoreColor(workoutScore)}`}>
            {workoutScore}
            <span className="text-base">/100</span>
          </p>
        </div>
        <div className="text-muted-foreground text-right text-xs">
          <p>Excellent</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Session overview</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Duration</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">80 min</span>
              <MetricIndicator isGood={true} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total sets</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">24 sets</span>
              <MetricIndicator isGood={true} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Density index</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">0.30</span>
              <MetricIndicator isGood={true} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Intensity factor</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">High</span>
              <MetricIndicator isGood={true} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t pt-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Muscle distribution</h4>
          <MetricIndicator isGood={true} />
        </div>
        <div className="bg-muted text-muted-foreground flex h-40 items-center justify-center rounded text-sm">
          Radar chart here
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Chest</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">8 sets</span>
              <MetricIndicator isGood={true} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Shoulders</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">6 sets</span>
              <MetricIndicator isGood={true} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Triceps</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">4 sets</span>
              <MetricIndicator isGood={true} />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Compound / Isolation</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">60% / 40%</span>
            <MetricIndicator isGood={true} />
          </div>
        </div>
      </div>

      {showWorkoutDetails && (
        <>
          <div className="space-y-3 border-t pt-3">
            <h4 className="text-sm font-semibold">Alerts & Recommendations</h4>
            <div className="space-y-2">
              <div className="rounded bg-green-500/10 p-2 text-xs text-green-700 dark:text-green-400">
                Exercise order is optimal
              </div>
              <div className="rounded bg-green-500/10 p-2 text-xs text-green-700 dark:text-green-400">
                Coherent with hypertrophy goal
              </div>
            </div>
          </div>
        </>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => setShowWorkoutDetails(!showWorkoutDetails)}
      >
        {showWorkoutDetails ? (
          <>
            <ChevronUp className="mr-2 h-4 w-4" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="mr-2 h-4 w-4" />
            Show alerts
          </>
        )}
      </Button>
    </>
  );
}
