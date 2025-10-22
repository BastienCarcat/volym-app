import prisma from "@/lib/prisma/prisma";

export const getProgramById = async (programId: string) => {
  return await prisma.program.findUnique({
    where: {
      id: programId,
    },
    select: {
      id: true,
      name: true,
      note: true,
    },
  });
};

export const getProgramWithSessions = async (programId: string) => {
  return await prisma.program.findUnique({
    where: {
      id: programId,
    },
    select: {
      id: true,
      name: true,
      note: true,
      sessions: {
        select: {
          id: true,
          name: true,
          note: true,
          day: true,
          weekNumber: true,
          templateId: true,
        },
        orderBy: {
          day: "asc",
        },
      },
    },
  });
};

export type DbProgram = Awaited<ReturnType<typeof getProgramWithSessions>>;
