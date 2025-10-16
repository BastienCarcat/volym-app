"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { createWorkoutSchema } from "../schemas";
import { SafeActionError } from "@/lib/errors";

export const createWorkout = authActionClient
  .inputSchema(createWorkoutSchema)
  .action(
    async ({
      parsedInput: { note, name },
      ctx: { user },
    }): Promise<{
      id: string;
      name: string;
      note: string | null;
      createdBy: string;
    }> => {
      const workout = await prisma.workout.create({
        data: {
          name,
          note: note,
          createdBy: user.dbUser.id,
        },
      });

      if (!workout) {
        throw new SafeActionError("Can't create workout");
      }

      return workout;
    }
  );
