import { Prisma } from "@/generated/prisma";
import prisma from "../prisma/prisma";

export const getWorkouts = async (userId: string) => {
  return await prisma.workout.findMany({
    where: {
      createdBy: userId,
    },
    select: {
      id: true,
      name: true,
      note: true,
    },
  });
};

export type DbWorkouts = Prisma.PromiseReturnType<typeof getWorkouts>;
