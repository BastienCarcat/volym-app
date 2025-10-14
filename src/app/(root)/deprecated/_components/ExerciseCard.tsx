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
import { useState } from "react";
import { ExerciseSetRow } from "./Exercise/ExerciseSet/ExerciseSetRow";
import type { Exercise } from "../types";
import type { ExerciseData, SetData } from "../[id]/WorkoutPageClient";

interface ExerciseCardProps {
  exerciseData: ExerciseData;
  exerciseInfo?: Exercise;
  onExerciseChange: (exercise: ExerciseData) => void;
  onDelete?: () => void;
}

export function ExerciseCard({
  exerciseData,
  exerciseInfo,
  onExerciseChange,
  onDelete,
}: ExerciseCardProps) {
  const [note, setNote] = useState(exerciseData.note || "");

  const name = exerciseInfo?.name || exerciseData.exerciseId;
  const image = exerciseInfo?.image;
  const targetMuscles = exerciseInfo?.targetMuscles || [];
  const secondaryMuscles = exerciseInfo?.secondaryMuscles || [];
  const sets = exerciseData.sets;

  const handleNoteChange = (newNote: string) => {
    setNote(newNote);
    onExerciseChange({
      ...exerciseData,
      note: newNote,
    });
  };

  const handleAddSet = (insertAfterIndex?: number) => {
    const insertIndex = insertAfterIndex !== undefined ? insertAfterIndex + 1 : sets.length;
    const referenceSet = insertAfterIndex !== undefined
      ? sets[insertAfterIndex]
      : sets[sets.length - 1];

    const newSet: SetData = {
      weight: referenceSet?.weight || null,
      reps: referenceSet?.reps || null,
      rest: referenceSet?.rest || 0,
      type: "Normal",
      rpe: referenceSet?.rpe || null,
      order: insertIndex,
    };

    const updatedSets = [...sets];
    updatedSets.splice(insertIndex, 0, newSet);
    
    // Reorder all sets
    const reorderedSets = updatedSets.map((set, index) => ({
      ...set,
      order: index,
    }));

    onExerciseChange({
      ...exerciseData,
      sets: reorderedSets,
    });
  };

  const handleRemoveSet = (setIndex: number) => {
    if (sets.length <= 1) return;
    
    const updatedSets = sets
      .filter((_, index) => index !== setIndex)
      .map((set, index) => ({ ...set, order: index }));

    onExerciseChange({
      ...exerciseData,
      sets: updatedSets,
    });
  };

  const handleUpdateSet = (setIndex: number, updates: Partial<SetData>) => {
    const updatedSets = sets.map((set, index) =>
      index === setIndex ? { ...set, ...updates } : set
    );

    onExerciseChange({
      ...exerciseData,
      sets: updatedSets,
    });
  };

  const calculateVolume = () => {
    return sets.reduce((total, set) => {
      const weight = set.weight || 0;
      const reps = set.reps || 0;
      return total + weight * reps;
    }, 0);
  };

  const calculateEstimatedDuration = () => {
    const totalRestTime = sets.reduce(
      (total, set) => total + (set.rest || 0),
      0
    );
    const executionTime = sets.length * 30; // Assume 30 seconds per set
    return Math.round((totalRestTime + executionTime) / 60);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b">
        <div className="flex gap-4 h-full">
          {/* Exercise Image */}
          <div className="flex-shrink-0 h-full">
            <div className="h-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {image ? (
                <Image
                  src={image}
                  alt={name}
                  width={120}
                  height={120}
                  className="w-full h-full object-cover"
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
                <div className="w-full h-full flex items-center justify-center">
                  <Dumbbell className="w-8 h-8 text-gray-400" />
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
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2 hover:text-red-600" />
                      Remove exercise
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardAction>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-4">
              {targetMuscles.map((muscle) => (
                <Badge
                  key={muscle.id}
                  variant="default"
                  className="text-xs gap-1"
                >
                  <div className="w-2 h-2 bg-current rounded-full" />
                  {muscle.name}
                </Badge>
              ))}
              {secondaryMuscles.map((muscle) => (
                <Badge
                  key={muscle.id}
                  variant="secondary"
                  className="text-xs gap-1"
                >
                  <div className="w-2 h-2 border border-current rounded-full" />
                  {muscle.name}
                </Badge>
              ))}
            </div>
            <div>
              <Textarea
                placeholder="Add a note"
                value={note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleNoteChange(e.target.value)
                }
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
            <div className="grid grid-cols-[auto_80px_80px_80px_auto] gap-y-1 gap-x-2 items-center">
              {/* Table Header */}
              <div className="contents">
                <div className="w-6"></div>
                <div className="text-center rounded-md text-xs font-semibold text-gray-700">
                  Kg
                </div>
                <div className="text-center rounded-md text-xs font-semibold text-gray-700">
                  Reps
                </div>
                <div className="text-center rounded-md text-xs font-semibold text-gray-700">
                  Rest
                </div>
                <div></div>
              </div>

              {/* Table Rows */}
              {sets.map((set, index) => (
                <ExerciseSetRow
                  key={`set-${index}`}
                  set={set}
                  index={index}
                  onUpdate={(updates) => handleUpdateSet(index, updates)}
                  onAddSet={handleAddSet}
                  onRemoveSet={() => handleRemoveSet(index)}
                  canRemove={sets.length > 1}
                />
              ))}
            </div>
          </div>

          {/* Stats Panel */}
          <div className="w-48 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Volume</span>
                <span className="text-sm font-medium">
                  {calculateVolume()} <span className="text-gray-400">Kg</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Set count</span>
                <span className="text-sm font-medium">{sets.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Estimated duration
                </span>
                <span className="text-sm font-medium">
                  {calculateEstimatedDuration()}{" "}
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
