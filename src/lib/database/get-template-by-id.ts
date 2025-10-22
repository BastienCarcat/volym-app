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

export type DbTemplate = Awaited<ReturnType<typeof getTemplateById>>;
