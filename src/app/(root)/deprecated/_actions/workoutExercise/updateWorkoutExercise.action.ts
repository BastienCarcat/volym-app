"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { z } from "zod";

const updateWorkoutExerciseSchema = z.object({
  id: z.string(),
  note: z.string().max(500, "Note cannot exceed 500 characters").optional(),
  order: z.number().int().min(0).optional(),
});

export const updateWorkoutExercise = authActionClient
  .inputSchema(updateWorkoutExerciseSchema)
  .action(async ({ parsedInput: { id, note, order }, ctx: { user } }) => {
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

    const updateData: { note?: string; order?: number } = {};
    if (note !== undefined) updateData.note = note;
    if (order !== undefined) updateData.order = order;

    const updatedWorkoutExercise = await prisma.workoutExercise.update({
      where: { id },
      data: updateData,
    });

    return updatedWorkoutExercise;
  });