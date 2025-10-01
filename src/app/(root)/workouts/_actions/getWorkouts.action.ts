"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";

export const getWorkouts = authActionClient.action(
  async ({ ctx: { user } }) => {
    const workouts = await prisma.workout.findMany({
      where: {
        createdBy: user.dbUser.id,
      },
    });

    return workouts;
  }
);
