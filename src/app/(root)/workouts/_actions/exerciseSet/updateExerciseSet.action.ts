"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { z } from "zod";

const updateExerciseSetSchema = z.object({
  id: z.string(),
  weight: z.number().nullable().optional(),
  reps: z.number().nullable().optional(),
  rest: z.number().nullable().optional(),
  type: z.enum(["WarmUp", "Normal", "DropsSet", "Failure"]).optional(),
  rpe: z.number().min(1).max(10).nullable().optional(),
});

export const updateExerciseSet = authActionClient
  .inputSchema(updateExerciseSetSchema)
  .action(async ({ parsedInput: { id, ...data }, ctx: { user } }) => {
    // Verify the exercise set belongs to a workout owned by the user
    const exerciseSet = await prisma.exerciseSet.findFirst({
      where: {
        id,
        workoutExercise: {
          workout: {
            createdBy: user.dbUser.id,
          },
        },
      },
    });

    if (!exerciseSet) {
      throw new Error("Exercise set not found");
    }

    const updatedSet = await prisma.exerciseSet.update({
      where: { id },
      data,
    });

    return updatedSet;
  });
