"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";
import type { DayOfWeek } from "@/generated/prisma";
import {
  useSession,
  type SessionWithExercises,
} from "../../../_hooks/use-sessions";

interface SessionCardProps {
  day: DayOfWeek;
  sessionId: string;
  programId: string;
}

export function SessionCard({ day, sessionId, programId }: SessionCardProps) {
  const { data: session } = useSession(sessionId);

  if (!session) {
    return <div>bog</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{session.name}</h2>
            {session.note && (
              <p className="text-muted-foreground mt-1 text-sm">
                {session.note}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm">
            Edit Session
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {session.exercises.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4 text-sm">
              No exercises added yet
            </p>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Exercise
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {session.exercises.map(
              (
                exercise: SessionWithExercises["exercises"][number],
                index: number
              ) => (
                <div
                  key={exercise.id}
                  className="space-y-3 rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm font-medium">
                          #{index + 1}
                        </span>
                        <h4 className="font-semibold">
                          Exercise {exercise.exerciseId}
                        </h4>
                      </div>
                      {exercise.note && (
                        <p className="text-muted-foreground mt-1 text-sm">
                          {exercise.note}
                        </p>
                      )}
                    </div>
                    {exercise.supersetId && (
                      <span className="bg-primary/10 text-primary rounded px-2 py-1 text-xs">
                        Superset
                      </span>
                    )}
                  </div>

                  {/* Sets */}
                  <div className="space-y-2">
                    <div className="text-muted-foreground grid grid-cols-5 gap-2 text-xs font-medium">
                      <span>Set</span>
                      <span>Weight (kg)</span>
                      <span>Reps</span>
                      <span>RPE</span>
                      <span>Rest (s)</span>
                    </div>
                    {exercise.sets.map(
                      (
                        set: SessionWithExercises["exercises"][number]["sets"][number],
                        setIndex: number
                      ) => (
                        <div
                          key={set.id}
                          className="grid grid-cols-5 items-center gap-2 border-t py-2 text-sm"
                        >
                          <span className="font-medium">{setIndex + 1}</span>
                          <span>{set.weight} kg</span>
                          <span>{set.reps}</span>
                          <span>{set.rpe || "-"}</span>
                          <span>{set.rest ? `${set.rest}s` : "-"}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            )}

            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Exercise
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
