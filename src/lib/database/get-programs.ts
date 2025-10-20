import { Prisma } from "@/generated/prisma";
import prisma from "../prisma/prisma";

export const getPrograms = async (userId: string) => {
  return await prisma.program.findMany({
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

export type DbPrograms = Prisma.PromiseReturnType<typeof getPrograms>;
