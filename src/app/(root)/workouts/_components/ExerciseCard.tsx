"use client";

import { useState } from "react";
import {
  Dumbbell,
  Plus,
  Minus,
  MoreHorizontal,
  CircleDot,
  CircleDashed,
  Trash2,
} from "lucide-react";
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
import type { WorkoutExercise } from "../types";

interface ExerciseCardProps {
  id: string;
  name: string;
  image: string;
  targetMuscles: WorkoutExercise["targetMuscles"];
  secondaryMuscles: WorkoutExercise["secondaryMuscles"];
  onDelete?: () => void;
}

interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  restSeconds: number;
}

export function ExerciseCard({
  name,
  image,
  targetMuscles,
  secondaryMuscles,
  onDelete,
}: ExerciseCardProps) {
  const [sets, setSets] = useState<ExerciseSet[]>([
    { id: "1", weight: 80, reps: 10, restSeconds: 130 },
    { id: "2", weight: 80, reps: 10, restSeconds: 130 },
    { id: "3", weight: 80, reps: 10, restSeconds: 130 },
  ]);
  const [note, setNote] = useState("");

  const addSet = () => {
    const newSet: ExerciseSet = {
      id: Date.now().toString(),
      weight: sets[sets.length - 1]?.weight || 0,
      reps: sets[sets.length - 1]?.reps || 0,
      restSeconds: sets[sets.length - 1]?.restSeconds || 0,
    };
    setSets([...sets, newSet]);
  };

  const removeSet = (setId: string) => {
    setSets(sets.filter((set) => set.id !== setId));
  };

  const updateSet = (
    setId: string,
    field: keyof ExerciseSet,
    value: number
  ) => {
    setSets(
      sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set))
    );
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}'${remainingSeconds.toString().padStart(2, "0")}"`;
  };

  const calculateVolume = () => {
    return sets.reduce((total, set) => total + set.weight * set.reps, 0);
  };

  const calculateEstimatedDuration = () => {
    const totalRestTime = sets.reduce(
      (total, set) => total + set.restSeconds,
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
                  className="text-xs gap-2"
                >
                  <CircleDot />
                  {muscle.name}
                </Badge>
              ))}
              {secondaryMuscles.map((muscle) => (
                <Badge
                  key={muscle.id}
                  variant="secondary"
                  className="text-xs gap-2"
                >
                  <CircleDashed />
                  {muscle.name}
                </Badge>
              ))}
            </div>
            <Textarea
              placeholder="Ajouter une note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
                    value={set.weight}
                    onChange={(e) =>
                      updateSet(set.id, "weight", Number(e.target.value))
                    }
                    className="text-right"
                    placeholder="0"
                  />
                  <Input
                    size="small"
                    type="number"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(set.id, "reps", Number(e.target.value))
                    }
                    className="text-right"
                    placeholder="0"
                  />
                  <Input
                    size="small"
                    type="text"
                    value={formatTime(set.restSeconds)}
                    onChange={(e) => {
                      const timeStr = e.target.value;
                      const match = timeStr.match(/(\d+)'(\d+)"/);
                      if (match) {
                        const minutes = parseInt(match[1]);
                        const seconds = parseInt(match[2]);
                        updateSet(
                          set.id,
                          "restSeconds",
                          minutes * 60 + seconds
                        );
                      }
                    }}
                    className="text-right"
                    placeholder="0'00&quot;"
                  />
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addSet}
                      className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSet(set.id)}
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
