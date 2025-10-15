"use client";

import React from "react";
import { PageTitle } from "@/components/layout/page/page-title";
import { WorkoutWithExercisesAndSets } from "../types";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveWorkoutSchema } from "../schemas";
import { saveWorkout } from "../_actions/save-workout.action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertCircle, Save } from "lucide-react";
import WorkoutExercisesList from "./WorkoutExercises/WorkoutExercisesList";
import { FormProvider } from "react-hook-form";

interface WorkoutEditorPageProps {
  workout: WorkoutWithExercisesAndSets;
}

export default function WorkoutEditorPage({ workout }: WorkoutEditorPageProps) {
  const {
    form,
    action: { isExecuting },
    handleSubmitWithAction,
  } = useHookFormAction(saveWorkout, zodResolver(saveWorkoutSchema), {
    formProps: {
      reValidateMode: "onChange",
      defaultValues: workout,
    },
    actionProps: {
      onSuccess: ({ data }) => {
        if (data) {
          form.reset(data);
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError);
      },
    },
  });

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
          disabled={!form.formState.isDirty || isExecuting}
          size="lg"
          className="shadow-lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {isExecuting ? "Saving..." : "Save Workout"}
        </Button>

        {form.formState.isDirty && !isExecuting && (
          <div className="flex items-center mt-2 text-sm text-orange-600">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unsaved changes
          </div>
        )}
      </div>
    </div>
  );
}
