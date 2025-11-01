"use client";

import {
  ChevronDown,
  Dumbbell,
  MoreHorizontal,
  Trash2,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useExercise } from "@/hooks/use-exercise";
import type { SessionFormValues } from "./session-card";
import { SessionExerciseSet } from "./session-exercise-set";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface SessionExerciseItemProps {
  exerciseIndex: number;
  exerciseId: string;
  onRemove: () => void;
  onConvertToCircuit?: () => void;
  inCircuit?: boolean;
  circuitItemIndex?: number;
}

export function SessionExerciseItem({
  exerciseIndex,
  exerciseId,
  onRemove,
  onConvertToCircuit,
  inCircuit = false,
  circuitItemIndex,
}: SessionExerciseItemProps) {
  const [value, setValue] = useState<string>();
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<SessionFormValues>();
  const { data: exerciseInfo } = useExercise(exerciseId);

  // Build the correct field path based on whether we're in a circuit
  const basePath = inCircuit && circuitItemIndex !== undefined
    ? `sessionItems.${exerciseIndex}.circuit.circuitItems.${circuitItemIndex}.exercise` as const
    : `sessionItems.${exerciseIndex}.exercise` as const;

  const {
    fields: sets,
    remove,
    insert,
  } = useFieldArray({
    control,
    name: `${basePath}.sets` as any,
  });

  // Check for errors in the sessionItem
  const sessionItemErrors = errors?.sessionItems?.[exerciseIndex];
  const hasExerciseError = inCircuit && circuitItemIndex !== undefined
    ? !!(sessionItemErrors as any)?.circuit?.circuitItems?.[circuitItemIndex]?.exercise
    : !!(sessionItemErrors as any)?.exercise;
  const isOpen = value === `exercise-${exerciseIndex}`;

  const toggleAccordion = () => {
    setValue(isOpen ? "" : `exercise-${exerciseIndex}`);
  };

  const handleSetAdd = (setIndex: number, insertAtIndex: number) => {
    // Get the actual set values from the form
    const currentSets = watch(`${basePath}.sets` as any);
    const previousSet = currentSets[setIndex];

    if (previousSet) {
      // Create a new set with the same values but without the id and with correct order
      const { id, ...setWithoutId } = previousSet;
      insert(insertAtIndex, {
        ...setWithoutId,
        order: insertAtIndex + 1, // Set correct order based on position
      });
    }
  };

  const handleSetRemove = (setIndex: number) => {
    if (sets.length > 1) {
      remove(setIndex);
    }
  };

  const name = exerciseInfo?.name;
  const bodyPart = exerciseInfo?.bodyPart;
  const image =
    exerciseInfo?.image && exerciseInfo.image !== "image_coming_soon"
      ? exerciseInfo.image
      : null;

  return (
    <div>
      <Accordion
        type="single"
        collapsible
        value={value}
        onValueChange={setValue}
      >
        <AccordionItem
          value={`exercise-${exerciseIndex}`}
          className="border-none"
        >
          <Card
            className={cn(
              "gap-3 overflow-hidden py-3 shadow-none transition-all",
              !isOpen && hasExerciseError && "border-red-500"
            )}
          >
            <CardHeader
              className="cursor-pointer px-3"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (
                  !target.closest("[data-dropdown-trigger]") &&
                  !target.closest('[role="menuitem"]') &&
                  !target.closest("[data-drag-handle]")
                ) {
                  toggleAccordion();
                }
              }}
            >
              <div className="flex h-full gap-4">
                {/* Exercise Image */}
                <div className="relative aspect-square h-full overflow-hidden rounded-lg bg-gray-100">
                  {image ? (
                    <Image
                      src={image}
                      alt={name || ""}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 200px"
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

                {/* Exercise Info */}
                <div className="flex flex-1 items-center justify-between py-2">
                  <CardTitle className="text-md font-semibold text-gray-900">
                    {name}
                    <Badge variant="secondary" className="ml-4 text-xs">
                      {bodyPart}
                    </Badge>
                  </CardTitle>
                  <CardAction>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            data-dropdown-trigger
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!inCircuit && onConvertToCircuit && (
                            <DropdownMenuItem onClick={onConvertToCircuit}>
                              <Zap className="mr-2 h-4 w-4" />
                              Convert to circuit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={onRemove}
                            className="focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4 hover:text-red-600" />
                            Remove exercise
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 text-gray-500 transition-transform duration-200",
                          isOpen && "rotate-180"
                        )}
                      />
                    </div>
                  </CardAction>
                </div>
              </div>
            </CardHeader>

            <AccordionContent>
              <CardContent className="border-t px-3 pt-3">
                <FieldWrapper
                  name={`${basePath}.note` as any}
                  control={control}
                >
                  {(props) => (
                    <Textarea
                      {...props.field}
                      value={props.field.value || ""}
                      aria-invalid={props.fieldState.invalid}
                      placeholder="Add a note"
                      className="h-16 text-sm"
                    />
                  )}
                </FieldWrapper>
                <div className="mt-4 flex justify-between">
                  {/* Sets Table */}
                  <div className="grid grid-cols-[auto_80px_80px_80px_110px_auto] items-center gap-x-2 gap-y-1">
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
                      <div className="rounded-md text-center text-xs font-semibold text-gray-700">
                        Type
                      </div>
                      <div></div>
                    </div>

                    {/* Table Rows */}
                    {sets.map((set, setIndex) => (
                      <SessionExerciseSet
                        key={set.id}
                        basePath={basePath}
                        setIndex={setIndex}
                        onAddSet={() => handleSetAdd(setIndex, setIndex + 1)}
                        onRemoveSet={() => handleSetRemove(setIndex)}
                        canRemove={sets.length > 1}
                      />
                    ))}
                  </div>

                  {/* Stats Panel */}
                  {/* <div className="w-48 space-y-4">
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
                </div> */}
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
