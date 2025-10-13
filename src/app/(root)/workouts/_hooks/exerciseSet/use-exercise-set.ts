"use client";

import { addExerciseSet } from "../../_actions/exerciseSet/addExerciseSet.action";
import { updateExerciseSet } from "../../_actions/exerciseSet/updateExerciseSet.action";
import { removeExerciseSet } from "../../_actions/exerciseSet/removeExerciseSet.action";
import { resolveActionResult } from "@/lib/utils";
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation";
import { produce } from "immer";
import { v4 as uuid } from "uuid";
import { useMutationQueue } from "@/stores/mutation-queue.store";
import { useCallback } from "react";

interface WorkoutData {
  id: string;
  name: string;
  note?: string | null;
  exercises: ExerciseData[];
}

interface ExerciseData {
  id: string;
  exerciseId: string;
  order: number;
  sets: SetData[];
}

interface SetData {
  id: string;
  workoutExerciseId: string;
  weight?: number | null;
  reps?: number | null;
  rest?: number | null;
  order: number;
  type?: "WarmUp" | "Normal" | "DropsSet" | "Failure";
  rpe?: number | null;
}

export function useAddExerciseSet(workoutId: string) {
  const queue = useMutationQueue();
  return useOptimisticMutation<
    WorkoutData,
    {
      workoutExerciseId: string;
      order: number;
      weight?: number;
      reps?: number;
      rest?: number;
      type?: "WarmUp" | "Normal" | "DropsSet" | "Failure";
      rpe?: number;
    },
    SetData
  >({
    mutationFn: (setData) => resolveActionResult(addExerciseSet(setData)),
    queryKey: ["workout", workoutId],
    getOptimisticUpdate: (oldData, variables) => {
      if (!oldData) return oldData;

      const tempId = `temp-set-${uuid()}`;
      queue.registerTempId(tempId);

      const newData = produce(oldData, (draft) => {
        const exercise = draft.exercises.find(
          (ex) => ex.id === variables.workoutExerciseId
        );
        if (!exercise) return;

        // Décaler les ordres des sets existants
        exercise.sets.forEach((set) => {
          if (set.order >= variables.order) set.order += 1;
        });

        // Ajouter le set temporaire
        const tempSet: SetData = {
          id: tempId,
          workoutExerciseId: exercise.id,
          weight: variables.weight ?? null,
          reps: variables.reps ?? null,
          rest: variables.rest ?? null,
          order: variables.order,
          type: variables.type ?? "Normal",
          rpe: variables.rpe ?? null,
        };
        exercise.sets.push(tempSet);

        // Trier par ordre
        exercise.sets.sort((a, b) => a.order - b.order);
      });

      return { newData, context: { tempId } };
    },
    getSuccessUpdate: (oldData, serverResult, variables, context) => {
      if (!oldData || !context?.tempId) return oldData;

      queue.resolveTempId(context.tempId, serverResult.id);

      return produce(oldData, (draft) => {
        const exercise = draft.exercises.find(
          (ex) => ex.id === variables.workoutExerciseId
        );
        if (!exercise) return;

        exercise.sets = exercise.sets.map((set) =>
          set.id.startsWith("temp-set-") ? serverResult : set
        );
      });
    },
  });
}

export function useUpdateExerciseSet(workoutId: string) {
  const queue = useMutationQueue();
  const { mutate: baseMutate, ...others } = useOptimisticMutation<
    WorkoutData,
    {
      id: string;
      weight?: number | null;
      reps?: number | null;
      rest?: number | null;
      type?: "WarmUp" | "Normal" | "DropsSet" | "Failure";
      rpe?: number | null;
    },
    SetData
  >({
    mutationFn: async (setData) => {
      // Transform undefined → null pour Prisma
      const transformedData = {
        id: setData.id,
        weight: setData.weight === undefined ? null : setData.weight,
        reps: setData.reps === undefined ? null : setData.reps,
        rest: setData.rest === undefined ? null : setData.rest,
        rpe: setData.rpe === undefined ? null : setData.rpe,
        type: setData.type,
      };
      return resolveActionResult(updateExerciseSet(transformedData));
    },
    queryKey: ["workout", workoutId],
    getOptimisticUpdate: (oldData, variables) => {
      if (!oldData) return oldData;

      const newData = produce(oldData, (draft) => {
        draft.exercises.forEach((ex) => {
          const set = ex.sets.find((s) => s.id === variables.id);
          if (!set) return;

          if (variables.weight !== undefined) set.weight = variables.weight;
          if (variables.reps !== undefined) set.reps = variables.reps;
          if (variables.rest !== undefined) set.rest = variables.rest;
          if (variables.type !== undefined) set.type = variables.type;
          if (variables.rpe !== undefined) set.rpe = variables.rpe;
        });
      });

      return { newData };
    },
    getSuccessUpdate: (oldData, serverResult, params) => {
      if (!oldData) return oldData;

      return produce(oldData, (draft) => {
        draft.exercises.forEach((ex) => {
          const index = ex.sets.findIndex((s) => s.id === params.id);
          if (index !== -1) {
            ex.sets[index] = serverResult;
          }
        });
      });
    },
  });

  const mutate = useCallback(
    // TODO: Better typing
    (variables: {
      id: string;
      weight?: number | null;
      reps?: number | null;
      rest?: number | null;
      type?: "WarmUp" | "Normal" | "DropsSet" | "Failure";
      rpe?: number | null;
    }) => {
      const { id } = variables;
      console.log("Id of update mutation :>> ", id, variables);
      if (id.startsWith("temp-set-")) {
        const realId = queue.getRealId(id);

        if (!realId) {
          queue.enqueue({
            tempId: id,
            type: "update",
            variables,
            execute: (resolvedId) =>
              baseMutate({ ...variables, id: resolvedId }),
          });
          return;
        }

        variables.id = realId;
      }

      baseMutate(variables);
    },
    [queue, baseMutate]
  );
  return { mutate, ...others };
}

export function useRemoveExerciseSet(workoutId: string) {
  const queue = useMutationQueue();
  return useOptimisticMutation<WorkoutData, string, void>({
    mutationFn: async (setId) =>
      resolveActionResult(removeExerciseSet({ id: setId })),
    queryKey: ["workout", workoutId],
    getOptimisticUpdate: (oldData, setId) => {
      if (!oldData) return oldData;

      if (setId.startsWith("temp-set-")) {
        queue.markDeleted(setId);
        queue.removePendingByTempId(setId);
      }

      const newData = produce(oldData, (draft) => {
        draft.exercises.forEach((ex) => {
          const setToRemove = ex.sets.find((s) => s.id === setId);
          if (!setToRemove) return;

          // Supprimer le set
          ex.sets = ex.sets
            .filter((s) => s.id !== setId)
            .map((s) =>
              s.order > setToRemove.order ? { ...s, order: s.order - 1 } : s
            )
            .sort((a, b) => a.order - b.order);
        });
      });
      return { newData };
    },
  });
}
