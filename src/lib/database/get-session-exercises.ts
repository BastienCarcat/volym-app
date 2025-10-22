import prisma from "@/lib/prisma/prisma";

export const getSessionExercises = async (sessionId: string) => {
  return await prisma.sessionExercise.findMany({
    where: {
      sessionId: sessionId,
    },
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
    orderBy: { order: "asc" },
  });
};

export type DbSessionExercises = Awaited<
  ReturnType<typeof getSessionExercises>
>;
