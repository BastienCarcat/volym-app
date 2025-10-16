import { Prisma } from "@/generated/prisma";
import prisma from "../prisma/prisma";

export const getWorkoutById = async (workoutId: string, userId: string) => {
  return await prisma.workout.findFirst({
    where: {
      id: workoutId,
      createdBy: userId,
    },
    select: {
      id: true,
      name: true,
      note: true,
      exercises: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          note: true,
          order: true,
          exerciseId: true,
          sets: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              weight: true,
              reps: true,
              rest: true,
              type: true,
              rpe: true,
              order: true,
            },
          },
        },
      },
    },
  });
};

export type DbWorkout = Prisma.PromiseReturnType<typeof getWorkoutById>;
