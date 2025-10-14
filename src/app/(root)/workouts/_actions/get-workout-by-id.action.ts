"use server";

import prisma from "@/lib/prisma/prisma";
import { getAuthenticatedUser } from "@/lib/auth/getUser";
import { notFound } from "next/navigation";
import { getWorkoutByIdSelect, WorkoutWithExercisesAndSets } from "../types";

export async function getWorkoutById(
  id: string
): Promise<WorkoutWithExercisesAndSets> {
  const user = await getAuthenticatedUser();

  const workout = await prisma.workout.findFirst({
    where: {
      id,
      createdBy: user.dbUser.id,
    },
    select: getWorkoutByIdSelect,
  });

  if (!workout) {
    notFound();
  }

  return workout;
}
