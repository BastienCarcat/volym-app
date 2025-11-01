"use client";

import React, { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Zap } from "lucide-react";
import type { SessionFormValues } from "./session-card";
import { SessionExerciseItem } from "./session-exercise-item";
import { SearchExercisesDrawer } from "@/components/features/exercises/exercises-drawer";
import { SetType, SessionItemType, CircuitItemType } from "@/generated/prisma";
import { useExerciseDrawer } from "@/hooks/exercises/use-exercise-drawer";

import {
  CreateCircuitDialog,
  type CreateCircuitFormValues,
} from "@/components/features/circuits/create-circuit-dialog";
import { CircuitCard } from "@/components/features/circuits/circuit-card";
import type { circuitItemFormSchema } from "@/lib/schemas/sessions.form.schema";
import type z from "zod";

type CircuitItemFormValues = z.infer<typeof circuitItemFormSchema>;

export const DEFAULT_SET_VALUES = {
  weight: null as unknown as number,
  reps: null as unknown as number,
  rest: null,
  type: SetType.Normal,
  rpe: null,
  order: 1,
};

export default function SessionExercisesList() {
  const { isDrawerOpen, setIsDrawerOpen, openDrawer } = useExerciseDrawer();
  const [isCircuitDialogOpen, setIsCircuitDialogOpen] = useState(false);
  const [exerciseToConvert, setExerciseToConvert] = useState<number | null>(
    null
  );
  const [targetCircuitIndex, setTargetCircuitIndex] = useState<number | null>(
    null
  );
  const { control, watch, setValue, getValues } =
    useFormContext<SessionFormValues>();

  const {
    fields: sessionItems,
    remove,
    append,
  } = useFieldArray({
    control,
    name: "sessionItems",
  });

  const sessionItemsValue = watch("sessionItems") || [];

  const handleExerciseRemove = (index: number) => {
    remove(index);
  };

  const handleExerciseAdd = (exerciseId: string) => {
    // Check if we're adding to a specific circuit
    if (targetCircuitIndex !== null) {
      const circuit = getValues(`sessionItems.${targetCircuitIndex}.circuit`);
      const circuitItems = circuit?.circuitItems || [];
      const maxOrder = Math.max(
        0,
        ...circuitItems.map((item: CircuitItemFormValues) => item.order)
      );

      setValue(
        `sessionItems.${targetCircuitIndex}.circuit.circuitItems`,
        [
          ...circuitItems,
          {
            type: CircuitItemType.Exercise,
            order: maxOrder + 1,
            exercise: {
              exerciseId,
              note: null,
              sets: [DEFAULT_SET_VALUES],
            },
          },
        ],
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      );

      setTargetCircuitIndex(null);
    } else {
      // Add to session
      const maxOrder = Math.max(0, ...sessionItems.map((item) => item.order));
      const newItem = {
        type: SessionItemType.Exercise,
        order: maxOrder + 1,
        exercise: {
          exerciseId,
          note: null,
          sets: [DEFAULT_SET_VALUES],
        },
      };
      append(newItem);
    }
  };

  const handleCircuitCreate = (circuitData: CreateCircuitFormValues) => {
    // Check if we're converting an exercise to a circuit
    if (exerciseToConvert !== null) {
      const existingExercise = getValues(
        `sessionItems.${exerciseToConvert}.exercise`
      );
      const existingOrder = getValues(
        `sessionItems.${exerciseToConvert}.order`
      );

      // Transform exercise into circuit with the exercise as the first circuit item
      setValue(
        `sessionItems.${exerciseToConvert}`,
        {
          type: SessionItemType.Circuit,
          order: existingOrder,
          circuit: {
            ...circuitData,
            circuitItems: [
              {
                type: CircuitItemType.Exercise,
                order: 1,
                exercise: existingExercise,
              },
            ],
          },
        },
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      );

      // Reset conversion state
      setExerciseToConvert(null);
      setIsCircuitDialogOpen(false);
    } else {
      // Regular circuit creation (empty circuit)
      const maxOrder = Math.max(0, ...sessionItems.map((item) => item.order));
      append({
        type: SessionItemType.Circuit,
        order: maxOrder + 1,
        circuit: {
          ...circuitData,
          circuitItems: [], // Empty circuit, user will add exercises
        },
      });
      setIsCircuitDialogOpen(false);
    }
  };

  const handleCircuitRemove = (circuitItemIndex: number) => {
    remove(circuitItemIndex);
  };

  const handleConvertToCircuit = (exerciseIndex: number) => {
    setExerciseToConvert(exerciseIndex);
    setIsCircuitDialogOpen(true);
  };

  const handleOpenCircuitDrawer = (circuitIndex: number) => {
    setTargetCircuitIndex(circuitIndex);
    openDrawer();
  };

  const handleCircuitItemRemove = (
    sessionItemIndex: number,
    circuitItemIndex: number
  ) => {
    const circuit = getValues(`sessionItems.${sessionItemIndex}.circuit`);
    const circuitItems = circuit?.circuitItems || [];

    // Filter out the item to remove
    const updatedCircuitItems = circuitItems.filter(
      (_: CircuitItemFormValues, idx: number) => idx !== circuitItemIndex
    );

    // Update orders for remaining items
    const reorderedItems = updatedCircuitItems.map(
      (item: CircuitItemFormValues, idx: number) => ({
        ...item,
        order: idx + 1,
      })
    );

    setValue(
      `sessionItems.${sessionItemIndex}.circuit.circuitItems`,
      reorderedItems,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  return (
    <>
      <ScrollArea className="h-full">
        <div className="space-y-4">
          {sessionItems.map((item, index) => {
            const itemValue = sessionItemsValue[index];

            if (
              itemValue?.type === SessionItemType.Exercise &&
              itemValue.exercise
            ) {
              return (
                <SessionExerciseItem
                  key={item.id || `exercise-${index}`}
                  exerciseIndex={index}
                  exerciseId={itemValue.exercise.exerciseId}
                  onRemove={() => handleExerciseRemove(index)}
                  onConvertToCircuit={() => handleConvertToCircuit(index)}
                />
              );
            }

            if (
              itemValue?.type === SessionItemType.Circuit &&
              itemValue.circuit
            ) {
              return (
                <CircuitCard
                  key={item.id || `circuit-${index}`}
                  type={itemValue.circuit.type}
                  duration={itemValue.circuit.duration}
                  rest={itemValue.circuit.rest}
                  note={itemValue.circuit.note}
                  onRemove={() => handleCircuitRemove(index)}
                  onExerciseAdd={() => handleOpenCircuitDrawer(index)}
                >
                  {/* Render CircuitItems */}
                  {itemValue.circuit.circuitItems.length > 0 ? (
                    itemValue.circuit.circuitItems?.map(
                      (
                        circuitItem: CircuitItemFormValues,
                        circuitItemIndex: number
                      ) => {
                        if (
                          circuitItem.type === CircuitItemType.Exercise &&
                          circuitItem.exercise
                        ) {
                          return (
                            <SessionExerciseItem
                              key={
                                circuitItem.id ||
                                `circuit-ex-${circuitItemIndex}`
                              }
                              exerciseIndex={index} // Parent SessionItem index
                              circuitItemIndex={circuitItemIndex} // CircuitItem index
                              exerciseId={circuitItem.exercise.exerciseId}
                              onRemove={() =>
                                handleCircuitItemRemove(index, circuitItemIndex)
                              }
                              inCircuit
                            />
                          );
                        }
                        return null;
                      }
                    )
                  ) : (
                    <div className="text-center text-sm">
                      There is no exercises in your circuit
                    </div>
                  )}
                </CircuitCard>
              );
            }

            return null;
          })}

          <div className="flex flex-col items-center justify-center gap-2">
            {sessionItems.length === 0 && (
              <div className="text-muted-foreground mt-10 mb-4">
                Add an exercise to your session
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setTargetCircuitIndex(null);
                  openDrawer();
                }}
                size="sm"
                variant="outline"
                className="border-2 border-dashed border-gray-300 px-6 py-2 text-gray-600 hover:border-gray-400 hover:text-gray-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add exercise
              </Button>
              <Button
                onClick={() => setIsCircuitDialogOpen(true)}
                size="sm"
                variant="outline"
                className="border-2 border-dashed border-blue-300 px-6 py-2 text-blue-600 hover:border-blue-400 hover:text-blue-700"
              >
                <Zap className="mr-2 h-4 w-4" />
                Add circuit
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
      <SearchExercisesDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onExerciseAdd={handleExerciseAdd}
      />
      <CreateCircuitDialog
        open={isCircuitDialogOpen}
        onOpenChange={setIsCircuitDialogOpen}
        onCircuitCreate={handleCircuitCreate}
      />
    </>
  );
}
