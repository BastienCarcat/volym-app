"use server";

import prisma from "@/lib/prisma/prisma";
import { getAuthenticatedUser } from "@/lib/auth/getUser";
import { notFound } from "next/navigation";

export async function getWorkoutById(id: string) {
  const user = await getAuthenticatedUser();

  const workout = await prisma.workout.findFirst({
    where: {
      id,
      createdBy: user.dbUser.id,
    },
    include: {
      exercises: {
        include: {
          sets: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!workout) {
    notFound();
  }

  return workout;
}
