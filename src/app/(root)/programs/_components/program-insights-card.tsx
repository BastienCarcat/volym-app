"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from "lucide-react";

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

export function ProgramInsightsCard() {
  const [showProgramDetails, setShowProgramDetails] = useState(false);
  const [showWorkoutDetails, setShowWorkoutDetails] = useState(false);

  const programScore = 85;
  const workoutScore = 92;

  return (
    <Card className="w-full max-w-[350px]">
      <CardHeader>
        <CardTitle>Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="program" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="program">Program</TabsTrigger>
            <TabsTrigger value="workout">Workout</TabsTrigger>
          </TabsList>

          <TabsContent value="program" className="space-y-4 mt-4">
            <div className={`p-4 rounded-lg ${getScoreBgColor(programScore)} flex items-center justify-between`}>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Program Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(programScore)}`}>
                  {programScore}
                  <span className="text-base">/100</span>
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Good quality</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Overview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Workouts</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">4 / week</span>
                    <MetricIndicator isGood={true} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg duration</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">75 min</span>
                    <MetricIndicator isGood={true} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg intensity</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">RPE 7.5</span>
                    <MetricIndicator isGood={true} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Progressive load</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">+2% / week</span>
                    <MetricIndicator isGood={true} />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold">Weekly distribution</h4>
                <MetricIndicator isGood={true} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex gap-1">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                    <div
                      key={day}
                      className={`flex-1 h-8 rounded flex items-center justify-center text-xs ${
                        [0, 2, 4, 6].includes(i)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {day[0]}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  No overtraining detected
                </p>
              </div>
            </div>

            <div className="border-t pt-3 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold">Muscle distribution</h4>
                <MetricIndicator isGood={false} />
              </div>
              <div className="h-40 bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
                Radar chart here
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Chest</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">12 sets</span>
                    <MetricIndicator isGood={true} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Back</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">16 sets</span>
                    <MetricIndicator isGood={true} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Legs</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">18 sets</span>
                    <MetricIndicator isGood={true} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Shoulders</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">10 sets</span>
                    <MetricIndicator isGood={true} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
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
                <div className="border-t pt-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-semibold">Balance & Coherence</h4>
                    <MetricIndicator isGood={true} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Squat pattern</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">60/40</span>
                        <MetricIndicator isGood={true} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Pull pattern</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">55/45</span>
                        <MetricIndicator isGood={true} />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Push pattern</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">50/50</span>
                        <MetricIndicator isGood={true} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-green-500/10 text-green-700 dark:text-green-400 text-xs rounded">
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
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show details
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="workout" className="space-y-4 mt-4">
            <div className={`p-4 rounded-lg ${getScoreBgColor(workoutScore)} flex items-center justify-between`}>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Workout Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(workoutScore)}`}>
                  {workoutScore}
                  <span className="text-base">/100</span>
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Excellent</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Session overview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Duration</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">80 min</span>
                    <MetricIndicator isGood={true} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total sets</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">24 sets</span>
                    <MetricIndicator isGood={true} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Density index</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">0.30</span>
                    <MetricIndicator isGood={true} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Intensity factor</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">High</span>
                    <MetricIndicator isGood={true} />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold">Muscle distribution</h4>
                <MetricIndicator isGood={true} />
              </div>
              <div className="h-40 bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
                Radar chart here
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Chest</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">8 sets</span>
                    <MetricIndicator isGood={true} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Shoulders</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">6 sets</span>
                    <MetricIndicator isGood={true} />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Triceps</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">4 sets</span>
                    <MetricIndicator isGood={true} />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Compound / Isolation</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">60% / 40%</span>
                  <MetricIndicator isGood={true} />
                </div>
              </div>
            </div>

            {showWorkoutDetails && (
              <>
                <div className="border-t pt-3 space-y-3">
                  <h4 className="text-sm font-semibold">Alerts & Recommendations</h4>
                  <div className="space-y-2">
                    <div className="p-2 bg-green-500/10 text-green-700 dark:text-green-400 text-xs rounded">
                      Exercise order is optimal
                    </div>
                    <div className="p-2 bg-green-500/10 text-green-700 dark:text-green-400 text-xs rounded">
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
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show alerts
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
