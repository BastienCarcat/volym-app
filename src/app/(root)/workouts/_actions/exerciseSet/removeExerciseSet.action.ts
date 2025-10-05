"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { z } from "zod";

const removeExerciseSetSchema = z.object({
  id: z.string(),
});

export const removeExerciseSet = authActionClient
  .inputSchema(removeExerciseSetSchema)
  .action(async ({ parsedInput: { id }, ctx: { user } }) => {
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

    await prisma.exerciseSet.delete({
      where: { id },
    });

    return { success: true };
  });
