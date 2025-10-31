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
      cycleDay: true,
      isRestDay: true,
      weekNumber: true,
      programId: true,
      templateId: true,
      sessionItems: {
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

export type DbSession = Awaited<ReturnType<typeof getSessionById>>;
