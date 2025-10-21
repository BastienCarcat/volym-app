"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWorkouts } from "@/app/(root)/workouts/_hooks/use-workouts";
import { Loader2 } from "lucide-react";

interface SelectWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWorkoutSelect: (workoutId: string) => void;
}

export function SelectWorkoutDialog({
  open,
  onOpenChange,
  onWorkoutSelect,
}: SelectWorkoutDialogProps) {
  const { data, isLoading } = useWorkouts();

  const handleWorkoutClick = (workoutId: string) => {
    onWorkoutSelect(workoutId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Select Workout</DialogTitle>
          <DialogDescription>
            Choose a workout to schedule for this day.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : data?.workouts && data.workouts.length > 0 ? (
            <div className="space-y-2">
              {data.workouts.map((workout) => (
                <Button
                  key={workout.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => handleWorkoutClick(workout.id)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{workout.name}</span>
                    {workout.note && (
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {workout.note}
                      </span>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                No workouts found. Create a workout first.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
