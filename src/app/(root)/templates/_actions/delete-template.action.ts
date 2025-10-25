"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { z } from "zod";
import { SafeActionError } from "@/lib/errors";

const deleteTemplateSchema = z.object({
  templateId: z.string().min(1, "templateId is required"),
});

export const deleteTemplate = authActionClient
  .inputSchema(deleteTemplateSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    const template = await prisma.workoutTemplate.findUnique({
      where: { id: input.templateId },
      include: { exercises: true },
    });

    if (!template) {
      throw new SafeActionError("Template not found");
    }

    if (template.createdBy !== ctx.user.dbUser.id) {
      throw new SafeActionError(
        "You are not authorized to delete this template"
      );
    }

    return prisma.$transaction(async (tx) => {
      const exerciseIds = template.exercises.map((ex) => ex.id);

      if (exerciseIds.length > 0) {
        await tx.templateSet.deleteMany({
          where: { templateExerciseId: { in: exerciseIds } },
        });
      }

      await tx.templateExercise.deleteMany({
        where: { templateId: input.templateId },
      });

      await tx.workoutTemplate.delete({
        where: { id: input.templateId },
      });

      return { success: true };
    });
  });
