"use client";

import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Spinner } from "@/components/ui/spinner";
import { BodyPart } from "../../../../types";
import {
  SearchExercisesFilters,
  type SearchExercisesFiltersValues,
} from "./filters";
import {
  useAllExercises,
  useExerciseCache,
} from "@/app/(root)/programs/_hooks/use-exercise";
import { SearchExerciseListItem } from "./exercise-item";

interface SearchExercisesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExerciseAdd: (exerciseId: string) => void;
}

export function SearchExercisesDrawer({
  open,
  onOpenChange,
  onExerciseAdd,
}: SearchExercisesDrawerProps) {
  const [filters, setFilters] = useState<SearchExercisesFiltersValues>();

  const handleFiltersChange = useCallback(
    (newFilters: SearchExercisesFiltersValues) => {
      setFilters(newFilters);
    },
    []
  );

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset filters when drawer closes
        setFilters(undefined);
      }
    },
    [onOpenChange]
  );

  const { exercises, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useAllExercises({
      query: filters?.query,
      bodyPart: filters?.bodyPart,
      equipment: filters?.equipment,
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

        <SearchExercisesFilters onFiltersChange={handleFiltersChange} />

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
                <SearchExerciseListItem
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
