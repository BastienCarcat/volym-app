"use client";

import React, { useState, useEffect } from "react";
import { PageTitle } from "@/components/layout/page/page-title";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { workoutWithExercisesSchema } from "../schemas";
import { saveWorkout } from "../_actions/save-workout.action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertCircle, Save } from "lucide-react";
import WorkoutExercisesList from "./WorkoutExercises/WorkoutExercisesList";
import { FormProvider } from "react-hook-form";
import {
  useWorkout,
  useRefreshWorkouts,
  useUpdateWorkoutCache,
} from "../_hooks/use-workouts";

interface WorkoutEditorPageProps {
  workoutId: string;
}

export default function WorkoutEditorPage({
  workoutId,
}: WorkoutEditorPageProps) {
  const { data: workout, isLoading } = useWorkout(workoutId);
  const refreshWorkouts = useRefreshWorkouts();
  const updateWorkoutCache = useUpdateWorkoutCache();
  const [isSyncing, setIsSyncing] = useState(false);

  const {
    form,
    action: { isExecuting },
    handleSubmitWithAction,
  } = useHookFormAction(saveWorkout, zodResolver(workoutWithExercisesSchema), {
    formProps: {
      reValidateMode: "onChange",
      values: workout,
    },
    actionProps: {
      onExecute: () => {
        setIsSyncing(true);
      },
      onSuccess: ({ data }) => {
        if (data) {
          const nameChanged = workout?.name !== data.name;
          const noteChanged = workout?.note !== data.note;

          updateWorkoutCache(workoutId, data);

          if (nameChanged || noteChanged) {
            refreshWorkouts();
          }
        }
      },
      onError: ({ error }) => {
        const errorMessage =
          typeof error.serverError === "string"
            ? error.serverError
            : "An error occurred while saving the workout";
        toast.error(errorMessage);
      },
    },
  });

  useEffect(() => {
    if (isSyncing && !form.formState.isDirty) {
      setIsSyncing(false);
    }
  }, [isSyncing, form.formState.isDirty]);

  const canSave = form.formState.isDirty && !isExecuting && !isSyncing;

  if (isLoading || !workout) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative">
      <FormProvider {...form}>
        <PageTitle
          control={form.control}
          titleName="name"
          descriptionName="note"
        />
        <WorkoutExercisesList />
      </FormProvider>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleSubmitWithAction}
          disabled={!canSave}
          size="lg"
          className="shadow-lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {isExecuting ? "Saving..." : "Save Workout"}
        </Button>

        {canSave && (
          <div className="flex items-center mt-2 text-sm text-orange-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unsaved changes
          </div>
        )}
      </div>
    </div>
  );
}
