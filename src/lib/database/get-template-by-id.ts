import prisma from "@/lib/prisma/prisma";

export const getTemplateById = async (templateId: string) => {
  return await prisma.workoutTemplate.findUnique({
    where: {
      id: templateId,
    },
    select: {
      id: true,
      name: true,
      note: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
      templateItems: {
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

export type DbTemplate = Awaited<ReturnType<typeof getTemplateById>>;
