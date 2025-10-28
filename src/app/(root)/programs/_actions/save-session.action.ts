"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { Prisma } from "@/generated/prisma";
import { sessionWithExercisesSchema } from "@/lib/schemas/sessions";
import { SafeActionError } from "@/lib/errors";

export const saveSession = authActionClient
  .inputSchema(sessionWithExercisesSchema)
  .action(async ({ parsedInput: input }) => {
    return prisma.$transaction(async (tx) => {
      // 1. Update session basic info
      await tx.session.update({
        where: { id: input.id },
        data: { name: input.name, note: input.note },
      });

      // 2. Fetch existing exercises + sets
      const existing = await tx.sessionExercise.findMany({
        where: { sessionId: input.id },
        include: { sets: true },
      });

      const existingExerciseMap = new Map(existing.map((ex) => [ex.id, ex]));

      const exerciseDeletes: string[] = [];
      const exerciseCreates: Array<Prisma.SessionExerciseCreateInput> = [];
      const exerciseUpdates: Prisma.SessionExerciseUpdateArgs[] = [];

      const setDeletes: string[] = [];
      const setCreates: Array<Prisma.SessionSetCreateManyInput> = [];
      const setUpdates: Prisma.SessionSetUpdateArgs[] = [];

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
            session: { connect: { id: input.id } },
            exerciseId: ex.exerciseId,
            note: ex.note,
            order: ex.order,
            supersetId: ex.supersetId,
            sets: newSets.length > 0 ? { create: newSets } : undefined,
          });
        } else {
          // Update existing exercise
          exerciseUpdates.push({
            where: { id: existingEx.id },
            data: {
              exerciseId: ex.exerciseId,
              note: ex.note,
              order: ex.order,
              supersetId: ex.supersetId,
            },
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
                sessionExerciseId: ex.id!,
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
          tx.sessionExercise.deleteMany({
            where: { id: { in: exerciseDeletes } },
          })
        );
      }

      // Set deletions
      if (setDeletes.length) {
        batchOperations.push(
          tx.sessionSet.deleteMany({ where: { id: { in: setDeletes } } })
        );
      }

      // Exercise creations with nested sets
      batchOperations.push(
        ...exerciseCreates.map((exerciseData) =>
          tx.sessionExercise.create({ data: exerciseData })
        )
      );

      // Exercise updates
      batchOperations.push(
        ...exerciseUpdates.map((q) => tx.sessionExercise.update(q))
      );

      // Set creations for existing exercises
      if (setCreates.length) {
        batchOperations.push(tx.sessionSet.createMany({ data: setCreates }));
      }

      // Set updates
      batchOperations.push(...setUpdates.map((q) => tx.sessionSet.update(q)));

      // Execute all operations in parallel
      const results = await Promise.allSettled(batchOperations);

      // Log any failures
      results.forEach((result, idx) => {
        if (result.status === "rejected") {
          throw new SafeActionError(
            `Batch operation ${idx} failed: ${result.reason}`
          );
        }
      });

      // 5. Return updated session with exercises + sets
      return tx.session.findUnique({
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
