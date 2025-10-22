import prisma from "@/lib/prisma/prisma";
import { userRecords } from "./utils";
import { Prisma } from "@/generated/prisma";

export const getTemplates = async (userId: string) => {
  return await prisma.workoutTemplate.findMany({
    where: userRecords(userId),
    select: {
      id: true,
      name: true,
      note: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

export type DbTemplates = Prisma.PromiseReturnType<typeof getTemplates>;
