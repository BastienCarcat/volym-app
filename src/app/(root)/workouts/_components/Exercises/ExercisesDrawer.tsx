"use client";

import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ExerciseListItem } from "@/app/(root)/workouts/_components/Exercises/ExercisesListItem";
import { useAllExercises, useExerciseCache } from "../../_hooks/use-exercises";
import { ExercisesFilters, ExercisesFiltersValues } from "./ExercisesFilters";
import type { BodyPart } from "../../types";
import { Spinner } from "@/components/ui/spinner";

interface ExercisesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExerciseAdd: (exerciseId: string) => void;
}

export function ExercisesDrawer({
  open,
  onOpenChange,
  onExerciseAdd,
}: ExercisesDrawerProps) {
  const [filters, setFilters] = useState<ExercisesFiltersValues>({
    query: "",
    bodyPart: null,
    equipment: null,
  });

  const handleFiltersChange = useCallback(
    (newFilters: ExercisesFiltersValues) => {
      setFilters(newFilters);
    },
    []
  );

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset filters when drawer closes
        setFilters({
          query: "",
          bodyPart: null,
          equipment: null,
        });
      }
    },
    [onOpenChange]
  );

  const { exercises, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useAllExercises({
      query: filters.query || undefined,
      bodyPart: (filters.bodyPart as BodyPart) || undefined,
      equipment: filters.equipment || undefined,
    });
  const { setExerciseCache } = useExerciseCache();

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleExerciseSelect = (id: string) => {
    const exercise = exercises.find((ex) => ex.id === id);
    if (exercise) {
      // Cache the minimal exercise data immediately
      setExerciseCache({
        id: exercise.id,
        name: exercise.name,
        image: exercise.image,
        bodyPart: exercise.bodyPart,
      });

      onExerciseAdd(id);
    }
    handleOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader className="px-6">
          <SheetTitle>Select an Exercise</SheetTitle>
        </SheetHeader>

        <ExercisesFilters onFiltersChange={handleFiltersChange} />

        <div className="my-4 overflow-y-auto px-6">
          {status === "pending" && (
            <p className="flex items-center justify-center gap-3 text-gray-500">
              <Spinner className="size-4" />
              Loading exercises
            </p>
          )}
          {status === "error" && (
            <p className="text-center text-red-500">Error loading exercises</p>
          )}
          {status === "success" && (
            <div className="space-y-2">
              {exercises.map((exercise) => (
                <ExerciseListItem
                  key={exercise.id}
                  exercise={exercise}
                  onSelect={handleExerciseSelect}
                />
              ))}
              {hasNextPage && (
                <div ref={ref} className="py-4">
                  {isFetchingNextPage && (
                    <p className="flex items-center justify-center gap-3 text-gray-500">
                      <Spinner className="size-4" />
                      Loading more exercises
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
