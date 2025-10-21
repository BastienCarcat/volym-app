"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { SelectWorkoutDialog } from "./SelectWorkoutDialog";
import { DayOfWeek } from "../types";

interface WorkoutDayCardProps {
  day: DayOfWeek;
  workoutId: string | null;
  workoutName: string | null;
  onWorkoutSelect: (workoutId: string | null) => void;
}

export function WorkoutDayCard({
  day,
  workoutId,
  workoutName,
  onWorkoutSelect,
}: WorkoutDayCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleWorkoutSelected = (selectedWorkoutId: string) => {
    onWorkoutSelect(selectedWorkoutId);
    setDialogOpen(false);
  };

  const handleRemoveWorkout = () => {
    onWorkoutSelect(null);
  };

  return (
    <>
      <Card className="min-h-[400px]">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>{day}</CardTitle>
            {workoutId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveWorkout}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {!workoutId ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-muted-foreground mb-4">
                No workout scheduled for this day
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Workout
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{workoutName}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDialogOpen(true)}
                >
                  Change
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <SelectWorkoutDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onWorkoutSelect={handleWorkoutSelected}
      />
    </>
  );
}
