"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { z } from "zod";

const removeWorkoutExerciseSchema = z.object({
  id: z.string(),
});

export const removeWorkoutExercise = authActionClient
  .inputSchema(removeWorkoutExerciseSchema)
  .action(async ({ parsedInput: { id }, ctx: { user } }) => {
    // Verify the workout exercise belongs to a workout owned by the user
    const workoutExercise = await prisma.workoutExercise.findFirst({
      where: {
        id,
        workout: {
          createdBy: user.dbUser.id,
        },
      },
    });

    if (!workoutExercise) {
      throw new Error("Workout exercise not found");
    }

    // Delete all sets first (cascade delete)
    await prisma.exerciseSet.deleteMany({
      where: {
        workoutExerciseId: id,
      },
    });

    // Then delete the workout exercise
    await prisma.workoutExercise.delete({
      where: { id },
    });

    return { id };
  });
