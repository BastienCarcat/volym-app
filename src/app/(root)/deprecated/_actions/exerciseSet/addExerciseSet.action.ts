"use server";

import { SafeActionError } from "@/lib/errors";
import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { z } from "zod";

const addExerciseSetSchema = z.object({
  workoutExerciseId: z.string(),
  weight: z.number().optional(),
  reps: z.number().optional(),
  rest: z.number().optional(),
  order: z.number(),
  type: z.enum(["WarmUp", "Normal", "DropsSet", "Failure"]).default("Normal"),
  rpe: z.number().min(1).max(10).optional(),
});

export const addExerciseSet = authActionClient
  .inputSchema(addExerciseSetSchema)
  .action(async ({ parsedInput: input, ctx: { user } }) => {
    const workoutExercise = await prisma.workoutExercise.findUnique({
      where: {
        id: input.workoutExerciseId,
      },
      select: {
        id: true,
        workout: {
          select: {
            createdBy: true,
          },
        },
      },
    });

    if (
      !workoutExercise ||
      workoutExercise.workout.createdBy !== user.dbUser.id
    ) {
      throw new SafeActionError("Workout exercise not found");
    }

    // First, increment the order of all sets that come after the insertion point
    await prisma.exerciseSet.updateMany({
      where: {
        workoutExerciseId: input.workoutExerciseId,
        order: {
          gte: input.order,
        },
      },
      data: {
        order: {
          increment: 1,
        },
      },
    });

    // Then create the new set at the specified order
    const exerciseSet = await prisma.exerciseSet.create({
      data: {
        workoutExerciseId: input.workoutExerciseId,
        weight: input.weight,
        reps: input.reps,
        rest: input.rest,
        order: input.order,
        type: input.type,
        rpe: input.rpe,
      },
    });

    return exerciseSet;
  });
