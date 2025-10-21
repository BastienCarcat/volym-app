import prisma from "@/lib/prisma/prisma";

export const getProgram = async (programId: string) => {
  return await prisma.program.findUnique({
    where: {
      id: programId,
    },
    select: {
      id: true,
      name: true,
      note: true,
      createdBy: true,
    },
  });
};

export const getProgramWithSchedule = async (programId: string) => {
  return await prisma.program.findUnique({
    where: {
      id: programId,
    },
    include: {
      schedules: {
        include: {
          workout: {
            select: {
              id: true,
              name: true,
              note: true,
            },
          },
        },
        orderBy: {
          day: "asc",
        },
      },
    },
  });
};
