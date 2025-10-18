"use client";

import { Dumbbell, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/form/fields/inputs/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExerciseSetRow } from "./ExerciseSetRow";
import type { WorkoutFormValues } from "../../types";
import { useExercise } from "../../_hooks/use-exercises";
import {
  FieldArrayWithId,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { useMemo } from "react";

interface WorkoutExerciseCardProps {
  workoutExercise: FieldArrayWithId<WorkoutFormValues, "exercises", "id">;
  onDelete?: () => void;
  workoutExerciseIndex: number;
}

export function WorkoutExerciseCard({
  workoutExercise,
  onDelete,
  workoutExerciseIndex,
}: WorkoutExerciseCardProps) {
  const { control } = useFormContext<WorkoutFormValues>();

  const {
    fields: sets,
    remove,
    append,
  } = useFieldArray({
    control,
    name: `exercises.${workoutExerciseIndex}.sets`,
  });

  const { data: exerciseInfo, isLoading: isLoadingExercise } = useExercise(
    workoutExercise.exerciseId
  );

  const handleSetRemove = (index: number) => {
    remove(index);
  };

  const handleSetAdd = (insertAfterIndex: number) => {
    const newSet = {
      weight: 0,
      reps: 0,
      rest: 0,
      type: "Normal" as const,
      rpe: null,
      order: insertAfterIndex,
    };
    append(newSet);
  };

  // These fields are available immediately from cache (MinimalExercise)
  const name = exerciseInfo?.name;
  const bodyPart = exerciseInfo?.bodyPart;
  const image =
    exerciseInfo?.image && exerciseInfo.image !== "image_coming_soon"
      ? exerciseInfo.image
      : null;

  const watchedSets = useWatch({
    control,
    name: `exercises.${workoutExerciseIndex}.sets`,
  });

  const calculateVolume = useMemo(() => {
    if (!watchedSets) return 0;
    return watchedSets.reduce((total, set) => {
      const weight = set.weight || 0;
      const reps = set.reps || 0;
      return total + weight * reps;
    }, 0);
  }, [watchedSets]);

  const calculateEstimatedDuration = useMemo(() => {
    const totalRestTime = watchedSets.reduce(
      (total, set) => total + (set.rest || 0),
      0
    );
    const executionTime = watchedSets.length * 30; // Assume 30 seconds per set
    return Math.round((totalRestTime + executionTime) / 60);
  }, [watchedSets]);

  // Only show skeleton if there's NO data at all (not even from cache)
  if (isLoadingExercise && !exerciseInfo) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex h-full gap-4">
            <div className="h-full flex-shrink-0">
              <div className="aspect-square h-full w-[120px] animate-pulse overflow-hidden rounded-lg bg-gray-200" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex h-full gap-4">
          {/* Exercise Image */}
          <div className="h-full flex-shrink-0">
            <div className="aspect-square h-full overflow-hidden rounded-lg bg-gray-100">
              {image ? (
                <Image
                  src={image}
                  alt={name || ""}
                  width={120}
                  height={120}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML =
                        '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg></div>';
                    }
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Dumbbell className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Exercise Info */}
          <div className="flex-1">
            <div className="flex justify-between">
              <CardTitle className="mb-2 text-xl text-gray-900">
                {name}
              </CardTitle>
              <CardAction>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4 hover:text-red-600" />
                      Remove exercise
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardAction>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1 text-xs">
                {bodyPart}
              </Badge>
            </div>
            <div>
              <Textarea
                name={`exercises.${workoutExerciseIndex}.note`}
                control={control}
                placeholder="Add a note"
                className="h-16 resize-none text-sm"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between">
          {/* Sets Table */}
          <div className="">
            <div className="grid grid-cols-[auto_80px_80px_80px_auto] items-center gap-x-2 gap-y-1">
              {/* Table Header */}
              <div className="contents">
                <div className="w-6"></div>
                <div className="rounded-md text-center text-xs font-semibold text-gray-700">
                  Kg
                </div>
                <div className="rounded-md text-center text-xs font-semibold text-gray-700">
                  Reps
                </div>
                <div className="rounded-md text-center text-xs font-semibold text-gray-700">
                  Rest
                </div>
                <div></div>
              </div>

              {/* Table Rows */}
              {sets.map((set, index) => (
                <ExerciseSetRow
                  key={`set-${index}`}
                  set={set}
                  setIndex={index}
                  workoutExerciseIndex={workoutExerciseIndex}
                  // onUpdate={(updates) => handleUpdateSet(index, updates)}
                  onAddSet={(index) => handleSetAdd(index)}
                  onRemoveSet={() => handleSetRemove(index)}
                  canRemove={sets.length > 1}
                />
              ))}
            </div>
          </div>

          {/* Stats Panel */}
          <div className="w-48 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Volume</span>
                <span className="text-sm font-medium">
                  {calculateVolume} <span className="text-gray-400">Kg</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Set count</span>
                <span className="text-sm font-medium">{sets.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Estimated duration
                </span>
                <span className="text-sm font-medium">
                  {calculateEstimatedDuration}{" "}
                  <span className="text-gray-400">min</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
