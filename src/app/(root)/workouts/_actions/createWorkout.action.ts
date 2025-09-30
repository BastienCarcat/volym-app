"use server";

import { authActionClient, ActionError } from "@/lib/nextSafeAction/client";
import { createWorkoutSchema } from "../_schemas/createWorkout.schema";
import prisma from "@/lib/prisma/prisma";

export const createWorkout = authActionClient
  .inputSchema(createWorkoutSchema)
  .action(async ({ parsedInput: { note, name }, ctx: { user } }) => {
    const workout = await prisma.workout.create({
      data: {
        name,
        note,
        createdBy: user.dbUser.id,
      },
    });

    if (!workout) {
      throw new ActionError("Can't create workout");
    }

    return workout;
  });
