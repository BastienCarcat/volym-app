"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { Prisma } from "@/generated/prisma";
import { saveWorkoutSchema } from "../schemas";

export const saveWorkout = authActionClient
  .inputSchema(saveWorkoutSchema)
  .action(async ({ parsedInput: input }) => {
    return prisma.$transaction(async (tx) => {
      // 1. Update workout basic info
      await tx.workout.update({
        where: { id: input.id },
        data: { name: input.name, note: input.note },
      });

      // 2. Fetch existing exercises + sets
      const existing = await tx.workoutExercise.findMany({
        where: { workoutId: input.id },
        include: { sets: true },
      });

      const existingExerciseMap = new Map(existing.map((ex) => [ex.id, ex]));

      const exerciseDeletes: string[] = [];
      const exerciseCreates: Array<
        Prisma.WorkoutExerciseCreateInput & { tempId?: string }
      > = [];
      const exerciseUpdates: Prisma.WorkoutExerciseUpdateArgs[] = [];

      const setDeletes: string[] = [];
      const setCreates: Array<Prisma.ExerciseSetCreateManyInput> = [];
      const setUpdates: Prisma.ExerciseSetUpdateArgs[] = [];

      // 3. Determine exercises and sets to delete / create / update
      const inputExerciseIds = input.exercises
        .filter((ex) => ex.id)
        .map((ex) => ex.id!);

      for (const existingEx of existing) {
        if (!inputExerciseIds.includes(existingEx.id)) {
          exerciseDeletes.push(existingEx.id);
        }
      }

      for (const ex of input.exercises) {
        const existingEx = ex.id ? existingExerciseMap.get(ex.id) : null;

        if (!existingEx) {
          // Create new exercise with nested sets
          const newSets = ex.sets
            .filter((s) => !s.id)
            .map((s) => ({
              weight: s.weight,
              reps: s.reps,
              rest: s.rest,
              type: s.type,
              rpe: s.rpe,
              order: s.order,
            }));

          exerciseCreates.push({
            workout: { connect: { id: input.id } },
            exerciseId: ex.exerciseId,
            note: ex.note,
            order: ex.order,
            sets: newSets.length > 0 ? { create: newSets } : undefined,
            tempId: ex.id, // Store temp ID for reference
          });
        } else {
          // Update existing exercise
          exerciseUpdates.push({
            where: { id: existingEx.id },
            data: { exerciseId: ex.exerciseId, note: ex.note, order: ex.order },
          });
        }

        // Only process sets for existing exercises
        if (existingEx) {
          const existingSets = existingEx.sets;
          const inputSetIds = ex.sets.filter((s) => s.id).map((s) => s.id!);

          // Sets to delete
          for (const s of existingSets) {
            if (!inputSetIds.includes(s.id)) setDeletes.push(s.id);
          }

          // Sets to create / update for existing exercises only
          for (const s of ex.sets) {
            const setData = {
              weight: s.weight,
              reps: s.reps,
              rest: s.rest,
              type: s.type,
              rpe: s.rpe,
              order: s.order,
            };

            if (!s.id) {
              // Only add to setCreates if it's for an existing exercise
              setCreates.push({
                ...setData,
                workoutExerciseId: ex.id!,
              });
            } else {
              setUpdates.push({ where: { id: s.id }, data: setData });
            }
          }
        }
      }

      // 4. Execute all batch operations in parallel
      const batchOperations = [];

      // Exercise deletions
      if (exerciseDeletes.length) {
        batchOperations.push(
          tx.workoutExercise.deleteMany({
            where: { id: { in: exerciseDeletes } },
          })
        );
      }

      // Set deletions
      if (setDeletes.length) {
        batchOperations.push(
          tx.exerciseSet.deleteMany({ where: { id: { in: setDeletes } } })
        );
      }

      // Exercise creations with nested sets
      batchOperations.push(
        ...exerciseCreates.map((exerciseData) =>
          tx.workoutExercise.create({ data: exerciseData })
        )
      );

      // Exercise updates
      batchOperations.push(
        ...exerciseUpdates.map((q) => tx.workoutExercise.update(q))
      );

      // Set creations for existing exercises
      if (setCreates.length) {
        batchOperations.push(tx.exerciseSet.createMany({ data: setCreates }));
      }

      // Set updates
      batchOperations.push(
        ...setUpdates.map((q) => tx.exerciseSet.update(q))
      );

      // Execute all operations in parallel
      const results = await Promise.allSettled(batchOperations);
      
      // Log any failures
      results.forEach((result, idx) => {
        if (result.status === "rejected") {
          console.error(`Batch operation ${idx} failed:`, result.reason);
        }
      });


      // 5. Return updated workout with exercises + sets
      return tx.workout.findUnique({
        where: { id: input.id },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: { sets: { orderBy: { order: "asc" } } },
          },
        },
      });
    });
  });
