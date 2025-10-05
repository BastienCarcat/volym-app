"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { z } from "zod";

const updateWorkoutSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Workout name is required").optional(),
  note: z.string().optional(),
});

export const updateWorkout = authActionClient
  .inputSchema(updateWorkoutSchema)
  .action(async ({ parsedInput: { id, name, note }, ctx: { user } }) => {
    const workout = await prisma.workout.findFirst({
      where: {
        id,
        createdBy: user.dbUser.id,
      },
    });

    if (!workout) {
      throw new Error("Workout not found");
    }

    const updateData: { name?: string; note?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (note !== undefined) updateData.note = note;

    const updatedWorkout = await prisma.workout.update({
      where: { id },
      data: updateData,
    });

    return updatedWorkout;
  });
