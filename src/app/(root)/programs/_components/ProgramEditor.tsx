"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PageTitle } from "@/components/layout/page/page-title";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveProgramSchema } from "../schemas";
import { saveProgram } from "../_actions/save-program.action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertCircle, Save } from "lucide-react";
import { FormProvider } from "react-hook-form";
import {
  useProgramWithSchedule,
  useRefreshPrograms,
  useUpdateProgramCache,
} from "../_hooks/use-programs";
import { WeekTimeline } from "./WeekTimeline";
import { WorkoutDayCard } from "./WorkoutDayCard";
import { DayOfWeek } from "../types";

interface ProgramEditorProps {
  programId: string;
}

export default function ProgramEditor({ programId }: ProgramEditorProps) {
  const { data: program, isLoading } = useProgramWithSchedule(programId);
  const refreshPrograms = useRefreshPrograms();
  const updateProgramCache = useUpdateProgramCache();
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DayOfWeek.Monday);

  const initialSchedules = useMemo(() => {
    if (!program) return [];

    const scheduleMap = new Map(
      program.schedules.map((s) => [s.day, s.workoutId])
    );

    return [
      DayOfWeek.Monday,
      DayOfWeek.Tuesday,
      DayOfWeek.Wednesday,
      DayOfWeek.Thursday,
      DayOfWeek.Friday,
      DayOfWeek.Saturday,
      DayOfWeek.Sunday,
    ].map((day) => ({
      day,
      workoutId: scheduleMap.get(day) || null,
    }));
  }, [program]);

  const {
    form,
    action: { isExecuting },
    handleSubmitWithAction,
  } = useHookFormAction(saveProgram, zodResolver(saveProgramSchema), {
    formProps: {
      reValidateMode: "onChange",
      values: program
        ? {
            id: program.id,
            name: program.name,
            note: program.note,
            schedules: initialSchedules,
          }
        : undefined,
    },
    actionProps: {
      onExecute: () => {
        setIsSyncing(true);
      },
      onSuccess: ({ data }) => {
        if (data) {
          const nameChanged = program?.name !== data.name;
          const noteChanged = program?.note !== data.note;

          updateProgramCache(programId, {
            id: data.id,
            name: data.name,
            note: data.note,
            schedules: data.schedules.map((s) => ({
              id: s.id,
              day: s.day as DayOfWeek,
              workoutId: s.workoutId,
            })),
          });

          if (nameChanged || noteChanged) {
            refreshPrograms();
          }
        }
      },
      onError: ({ error }) => {
        const errorMessage =
          typeof error.serverError === "string"
            ? error.serverError
            : "An error occurred while saving the program";
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

  const watchedSchedules = form.watch("schedules");

  const scheduledDays = useMemo(() => {
    return new Set(
      watchedSchedules?.filter((s) => s.workoutId).map((s) => s.day) || []
    );
  }, [watchedSchedules]);

  const selectedDaySchedule = useMemo(() => {
    return watchedSchedules?.find((s) => s.day === selectedDay);
  }, [watchedSchedules, selectedDay]);

  const selectedDayWorkout = useMemo(() => {
    if (!selectedDaySchedule?.workoutId || !program) return null;

    const schedule = program.schedules.find(
      (s) => s.workoutId === selectedDaySchedule.workoutId
    );
    return schedule?.workout || null;
  }, [selectedDaySchedule, program]);

  const handleWorkoutSelect = (workoutId: string | null) => {
    const schedules = form.getValues("schedules");
    const dayIndex = schedules.findIndex((s) => s.day === selectedDay);

    if (dayIndex !== -1) {
      form.setValue(`schedules.${dayIndex}.workoutId`, workoutId, {
        shouldDirty: true,
      });
    }
  };

  if (isLoading || !program) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative pb-24">
      <FormProvider {...form}>
        <PageTitle
          control={form.control}
          titleName="name"
          descriptionName="note"
        />

        <div className="mt-6">
          <WeekTimeline
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
            scheduledDays={scheduledDays}
          />

          <WorkoutDayCard
            day={selectedDay}
            workoutId={selectedDaySchedule?.workoutId || null}
            workoutName={selectedDayWorkout?.name || null}
            onWorkoutSelect={handleWorkoutSelect}
          />
        </div>
      </FormProvider>

      <div className="fixed right-6 bottom-6 z-50">
        <Button
          onClick={handleSubmitWithAction}
          disabled={!canSave}
          size="lg"
          className="shadow-lg"
        >
          <Save className="mr-2 h-4 w-4" />
          {isExecuting ? "Saving..." : "Save Program"}
        </Button>

        {canSave && (
          <div className="mt-2 flex items-center text-sm text-orange-600">
            <AlertCircle className="mr-1 h-3 w-3" />
            Unsaved changes
          </div>
        )}
      </div>
    </div>
  );
}
