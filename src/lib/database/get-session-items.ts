import prisma from "@/lib/prisma/prisma";

export const getSessionItems = async (sessionId: string) => {
  return await prisma.sessionItem.findMany({
    where: {
      sessionId: sessionId,
    },
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
            select: {
              id: true,
              weight: true,
              reps: true,
              rest: true,
              type: true,
              rpe: true,
              order: true,
            },
            orderBy: {
              order: "asc",
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
                    select: {
                      id: true,
                      weight: true,
                      reps: true,
                      rest: true,
                      type: true,
                      rpe: true,
                      order: true,
                    },
                    orderBy: {
                      order: "asc",
                    },
                  },
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });
};

export type DbSessionItems = Awaited<ReturnType<typeof getSessionItems>>;
