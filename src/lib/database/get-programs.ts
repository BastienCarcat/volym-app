import { Prisma } from "@/generated/prisma";
import prisma from "../prisma/prisma";
import { userRecords } from "./utils";

export const getPrograms = async (userId: string) => {
  return await prisma.program.findMany({
    where: userRecords(userId),
    select: {
      id: true,
      name: true,
      note: true,
      type: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

export type DbPrograms = Prisma.PromiseReturnType<typeof getPrograms>;
