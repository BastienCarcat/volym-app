"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { z } from "zod";

const addWorkoutExerciseSchema = z.object({
  workoutId: z.string(),
  exerciseId: z.string(),
  note: z.string().optional(),
  order: z.number(),
  supersetId: z.string().optional(),
});

export const addWorkoutExercise = authActionClient
  .inputSchema(addWorkoutExerciseSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    // Verify workout belongs to user
    const workout = await prisma.workout.findFirst({
      where: {
        id: input.workoutId,
        createdBy: user.dbUser.id,
      },
    });

    if (!workout) {
      throw new Error("Workout not found");
    }

    const workoutExercise = await prisma.workoutExercise.create({
      data: {
        workoutId: input.workoutId,
        exerciseId: input.exerciseId,
        note: input.note,
        order: input.order,
        supersetId: input.supersetId,
      },
      include: {
        sets: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    // Créer une série par défaut
    const defaultSet = await prisma.exerciseSet.create({
      data: {
        workoutExerciseId: workoutExercise.id,
        weight: null,
        reps: null,
        rest: null,
        order: 0,
        type: "Normal",
        rpe: null,
      },
    });

    // Retourner l'exercice avec la série par défaut
    return {
      ...workoutExercise,
      sets: [defaultSet],
    };
  });
