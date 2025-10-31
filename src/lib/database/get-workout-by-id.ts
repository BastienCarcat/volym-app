import { Prisma } from "@/generated/prisma";
import prisma from "../prisma/prisma";

export const getWorkoutById = async (workoutId: string, userId: string) => {
  return await prisma.workoutTemplate.findUnique({
    where: {
      id: workoutId,
      createdBy: userId,
    },
    select: {
      id: true,
      name: true,
      note: true,
      isPublic: true,
      templateItems: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          type: true,
          order: true,
          exercise: {
            select: {
              id: true,
              exerciseId: true,
              note: true,
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
          circuit: {
            select: {
              id: true,
              type: true,
              duration: true,
              rest: true,
              note: true,
              circuitItems: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  type: true,
                  order: true,
                  exercise: {
                    select: {
                      id: true,
                      exerciseId: true,
                      note: true,
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
              },
            },
          },
        },
      },
    },
  });
};

export type DbWorkout = Prisma.PromiseReturnType<typeof getWorkoutById>;
