import { Prisma } from "@/generated/prisma";
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
      type: true,
      objective: true,
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
      type: true,
      objective: true,
      sessions: {
        select: {
          id: true,
          name: true,
          note: true,
          day: true,
          cycleDay: true,
          isRestDay: true,
          weekNumber: true,
          templateId: true,
        },
        orderBy: [{ weekNumber: "asc" }, { cycleDay: "asc" }, { day: "asc" }],
      },
    },
  });
};

const programWithFullSessionsArgs = {
  where: { id: "" },
  select: {
    id: true,
    name: true,
    note: true,
    type: true,
    objective: true,
    sessions: {
      select: {
        id: true,
        name: true,
        note: true,
        day: true,
        cycleDay: true,
        isRestDay: true,
        weekNumber: true,
        templateId: true,
        sessionItems: {
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
                  orderBy: { order: "asc" },
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
                          orderBy: { order: "asc" },
                        },
                      },
                    },
                  },
                  orderBy: { order: "asc" },
                },
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: [{ weekNumber: "asc" }, { cycleDay: "asc" }, { day: "asc" }],
    },
  },
} satisfies Prisma.ProgramFindUniqueArgs;

export const getProgramWithFullSessions = async (
  programId: string
): Promise<DbProgramWithFullSessions | null> => {
  return prisma.program.findUnique({
    where: { id: programId },
    select: programWithFullSessionsArgs.select,
  });
};

export type DbProgram = NonNullable<
  Awaited<ReturnType<typeof getProgramWithSessions>>
>;
export type DbProgramWithFullSessions = Prisma.ProgramGetPayload<{
  select: typeof programWithFullSessionsArgs.select;
}>;
