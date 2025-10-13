"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/form/fields/inputs/input";
import { DurationInput } from "@/components/form/fields/inputs/duration-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/form/form";
import {
  exerciseSetSchema,
  type ExerciseSetFormData,
} from "../../../_schemas/exerciseSet.schema";
import { useUpdateExerciseSet } from "../../../_hooks/exerciseSet/use-exercise-set";
import type { ExerciseSet } from "@/generated/prisma";
import { useAutoSaveForm } from "@/hooks/use-auto-save-form";

interface WorkoutData {
  id: string;
  name: string;
  note?: string | null;
  exercises?: ExerciseData[];
}

interface ExerciseData {
  id: string;
  exerciseId: string;
  order: number;
  sets: SetData[];
}

interface SetData {
  id: string;
  weight?: number | null;
  reps?: number | null;
  rest?: number | null;
  order: number;
  type?: "WarmUp" | "Normal" | "DropsSet" | "Failure";
  rpe?: number | null;
}

interface ExerciseSetRowProps {
  set: ExerciseSet;
  index: number;
  onAddSet: (insertAfterIndex: number) => void;
  onRemoveSet: (setId: string) => void;
  canRemove: boolean;
  workoutId: string;
}

interface FormValues {
  weight?: number | null;
  reps?: number | null;
  rest?: number | null;
  rpe?: number | null;
}

export function ExerciseSetRow({
  set,
  index,
  onAddSet,
  onRemoveSet,
  canRemove,
  workoutId,
}: ExerciseSetRowProps) {
  const queryClient = useQueryClient();

  // Read current set data from cache
  // const getSetFromCache = useMemo(() => {
  //   return () => {
  //     const workoutData = queryClient.getQueryData<WorkoutData>(["workout", workoutId]);
  //     const currentSet = workoutData?.exercises
  //       ?.flatMap(ex => ex.sets)
  //       ?.find(s => s.id === set.id);

  //     return currentSet || set;
  //   };
  // }, [queryClient, workoutId, set]);

  const form = useForm<FormValues>({
    resolver: zodResolver(exerciseSetSchema),
    defaultValues: {
      weight: set.weight,
      reps: set.reps,
      rest: set.rest,
      rpe: set.rpe,
    },
  });

  const { mutate: updateSet, isPending: isUpdating } =
    useUpdateExerciseSet(workoutId);

  const handleSave = useCallback(
    (vals: FormValues) => {
      updateSet({ id: set.id, ...vals });
    },
    [updateSet, set.id]
  );

  useAutoSaveForm({
    form,
    names: ["weight", "rest", "reps"],
    onSave: handleSave,
    delay: 100,
  });

  return (
    <div className="contents">
      <Badge
        variant="outline"
        className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
      >
        {index + 1}
      </Badge>

      <Form {...form}>
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0"
                    min={0}
                    className="text-right"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : undefined;
                      field.onChange(value);
                    }}
                    value={field.value?.toString() || ""}
                  />
                  {isUpdating && (
                    <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reps"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  className="text-right"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value
                      ? Number(e.target.value)
                      : undefined;
                    field.onChange(value);
                  }}
                  value={field.value?.toString() || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rest"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DurationInput
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  placeholder="0:00"
                  className="text-right"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddSet(index)}
          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemoveSet(set.id)}
          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
          disabled={!canRemove}
        >
          <Minus className="w-4 h-4" />
        </Button>
        {isUpdating && (
          <div className="text-xs text-muted-foreground">Saving...</div>
        )}
      </div>
    </div>
  );
}
