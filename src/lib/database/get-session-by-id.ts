import prisma from "@/lib/prisma/prisma";

export const getSessionById = async (sessionId: string) => {
  return await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    select: {
      id: true,
      name: true,
      note: true,
      day: true,
      weekNumber: true,
      programId: true,
      templateId: true,
      exercises: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          note: true,
          order: true,
          exerciseId: true,
          supersetId: true,
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

export type DbSession = Awaited<ReturnType<typeof getSessionById>>;
