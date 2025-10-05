"use client";

import { useState, useEffect } from "react";
import { Dumbbell, Plus, Minus, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  useAddExerciseSet,
  useUpdateExerciseSet,
  useRemoveExerciseSet,
} from "../_hooks/exerciseSet";
import type { ExerciseSet } from "@/generated/prisma";

interface Muscle {
  id: string;
  name: string;
  bodyPart: string;
  group: string | null;
}

interface ExerciseCardProps {
  workoutExerciseId: string;
  exerciseId: string;
  name: string;
  image?: string;
  targetMuscles?: Muscle[];
  secondaryMuscles?: Muscle[];
  sets: ExerciseSet[];
  note?: string | null;
  workoutId: string;
  onDelete?: () => void;
}

export function ExerciseCard({
  workoutExerciseId,
  exerciseId,
  name,
  image,
  targetMuscles = [],
  secondaryMuscles = [],
  sets,
  note: initialNote,
  workoutId,
  onDelete,
}: ExerciseCardProps) {
  const [note, setNote] = useState(initialNote || "");

  const { addSet } = useAddExerciseSet(workoutId);
  const { updateSet } = useUpdateExerciseSet(workoutId);
  const { removeSet } = useRemoveExerciseSet(workoutId);

  useEffect(() => {
    setNote(initialNote || "");
  }, [initialNote]);

  const handleAddSet = () => {
    const newOrder = sets.length + 1;
    const lastSet = sets[sets.length - 1];

    addSet({
      workoutExerciseId,
      weight: lastSet?.weight || undefined,
      reps: lastSet?.reps || undefined,
      rest: lastSet?.rest || undefined,
      order: newOrder,
      type: "Normal",
    });
  };

  const handleRemoveSet = async (setId: string) => {
    if (sets.length <= 1) return;
    removeSet(setId);
  };

  const handleUpdateSet = (
    setId: string,
    field: string,
    value: number | undefined
  ) => {
    updateSet(setId, { [field]: value });
  };

  const formatTime = (seconds?: number | null) => {
    if (!seconds) return "0'00\"";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}'${remainingSeconds.toString().padStart(2, "0")}"`;
  };

  const parseTime = (timeStr: string): number => {
    const match = timeStr.match(/(\d+)'(\d+)"/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      return minutes * 60 + seconds;
    }
    return 0;
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
            <Textarea
              placeholder="Add a note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => {
                // TODO: Auto-save note changes
                console.log("Note changed:", note);
              }}
              className="h-16 resize-none text-sm"
            />
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
                <div key={set.id} className="contents">
                  <Badge
                    variant="outline"
                    className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {index + 1}
                  </Badge>
                  <Input
                    size="small"
                    type="number"
                    value={set.weight || ""}
                    onChange={(e) =>
                      handleUpdateSet(
                        set.id,
                        "weight",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="text-right"
                    placeholder="0"
                  />
                  <Input
                    size="small"
                    type="number"
                    value={set.reps || ""}
                    onChange={(e) =>
                      handleUpdateSet(
                        set.id,
                        "reps",
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="text-right"
                    placeholder="0"
                  />
                  <Input
                    size="small"
                    type="text"
                    value={formatTime(set.rest)}
                    onChange={(e) => {
                      const seconds = parseTime(e.target.value);
                      handleUpdateSet(set.id, "rest", seconds);
                    }}
                    className="text-right"
                    placeholder="0'00&quot;"
                  />
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAddSet}
                      className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSet(set.id)}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
                      disabled={sets.length <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
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
