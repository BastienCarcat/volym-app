"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { z } from "zod";

const reorderWorkoutExercisesSchema = z.object({
  workoutId: z.string(),
  exerciseOrders: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    })
  ),
});

export const reorderWorkoutExercises = authActionClient
  .inputSchema(reorderWorkoutExercisesSchema)
  .action(
    async ({ parsedInput: { workoutId, exerciseOrders }, ctx: { user } }) => {
      // Verify workout belongs to user
      const workout = await prisma.workout.findFirst({
        where: {
          id: workoutId,
          createdBy: user.dbUser.id,
        },
      });

      if (!workout) {
        throw new Error("Workout not found");
      }

      // Update exercises order in a transaction
      await prisma.$transaction(
        exerciseOrders.map(({ id, order }) =>
          prisma.workoutExercise.update({
            where: { id },
            data: { order },
          })
        )
      );

      return { success: true };
    }
  );
