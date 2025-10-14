"use client";

import { useState, useMemo } from "react";
import { PageTitle } from "@/components/layout/page/page-title";
import { WorkoutExercisesList } from "../_components/WorkoutExercisesList";
import { updateWorkoutComplete } from "../_actions/updateWorkoutComplete.action";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@/components/ui/button";
import { Save, AlertCircle } from "lucide-react";
import type { Workout, WorkoutExercise, ExerciseSet } from "@/generated/prisma";

interface WorkoutWithRelations extends Workout {
  exercises: (WorkoutExercise & {
    sets: ExerciseSet[];
  })[];
}

interface WorkoutPageClientProps {
  initialWorkout: WorkoutWithRelations;
}

export interface WorkoutData {
  id: string;
  name: string;
  note?: string | null;
  exercises: ExerciseData[];
}

export interface ExerciseData {
  id?: string;
  exerciseId: string;
  note?: string | null;
  order: number;
  sets: SetData[];
}

export interface SetData {
  id?: string;
  weight?: number | null;
  reps?: number | null;
  rest?: number;
  type?: "WarmUp" | "Normal" | "DropsSet" | "Failure";
  rpe?: number | null;
  order: number;
}

function convertToWorkoutData(workout: WorkoutWithRelations): WorkoutData {
  return {
    id: workout.id,
    name: workout.name,
    note: workout.note,
    exercises: workout.exercises.map((ex) => ({
      id: ex.id,
      exerciseId: ex.exerciseId,
      note: ex.note,
      order: ex.order,
      sets: ex.sets.map((set) => ({
        id: set.id,
        weight: set.weight,
        reps: set.reps,
        rest: set.rest || 0,
        type: set.type,
        rpe: set.rpe,
        order: set.order,
      })),
    })),
  };
}

export function WorkoutPageClient({
  initialWorkout,
}: WorkoutPageClientProps) {
  const [workoutData, setWorkoutData] = useState<WorkoutData>(
    convertToWorkoutData(initialWorkout)
  );

  const { execute: saveWorkout, isExecuting: isSaving } = useAction(
    updateWorkoutComplete,
    {
      onSuccess: () => {
        console.log("Workout saved successfully!");
      },
      onError: (error) => {
        console.error("Failed to save workout:", error);
      },
    }
  );

  // Check if there are unsaved changes
  const isDirty = useMemo(() => {
    const initial = convertToWorkoutData(initialWorkout);
    return JSON.stringify(workoutData) !== JSON.stringify(initial);
  }, [workoutData, initialWorkout]);

  const handleTitleChange = (name: string) => {
    setWorkoutData((prev) => ({ ...prev, name }));
  };

  const handleDescriptionChange = (note: string) => {
    setWorkoutData((prev) => ({ ...prev, note }));
  };

  const handleSave = () => {
    saveWorkout(workoutData);
  };

  return (
    <div className="relative">
      <PageTitle
        title={workoutData.name}
        description={workoutData.note || ""}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
      />
      <WorkoutExercisesList 
        workoutData={workoutData}
        onWorkoutChange={setWorkoutData}
      />
      
      {/* Save Button - Fixed at bottom */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          size="lg"
          className="shadow-lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Workout"}
        </Button>
        
        {isDirty && !isSaving && (
          <div className="flex items-center mt-2 text-sm text-orange-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unsaved changes
          </div>
        )}
      </div>
    </div>
  );
}
