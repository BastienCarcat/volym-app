"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import { createWorkoutSchema } from "../../_schemas/createWorkout.schema";
import prisma from "@/lib/prisma/prisma";
import { SafeActionError } from "@/lib/errors";

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
      throw new SafeActionError("Can't create workout");
    }

    return workout;
  });
