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
      include: {
        templateItems: {
          include: {
            exercise: {
              include: {
                sets: true,
              },
            },
            circuit: {
              include: {
                circuitItems: {
                  include: {
                    exercise: {
                      include: {
                        sets: true,
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

    if (!template) {
      throw new SafeActionError("Template not found");
    }

    if (template.createdBy !== ctx.user.dbUser.id) {
      throw new SafeActionError(
        "You are not authorized to delete this template"
      );
    }

    return prisma.$transaction(async (tx) => {
      // Collect all exercise IDs and circuit IDs
      const exerciseIds: string[] = [];
      const circuitIds: string[] = [];
      const circuitItemIds: string[] = [];

      for (const item of template.templateItems) {
        if (item.exercise) {
          exerciseIds.push(item.exercise.id);
        }
        if (item.circuit) {
          circuitIds.push(item.circuit.id);
          for (const circuitItem of item.circuit.circuitItems) {
            circuitItemIds.push(circuitItem.id);
            if (circuitItem.exercise) {
              exerciseIds.push(circuitItem.exercise.id);
            }
          }
        }
      }

      // Soft delete all sets from exercises
      if (exerciseIds.length > 0) {
        await tx.set.deleteMany({
          where: { exerciseId: { in: exerciseIds } },
        });
      }

      // Soft delete circuit items
      if (circuitItemIds.length > 0) {
        await tx.circuitItem.deleteMany({
          where: { id: { in: circuitItemIds } },
        });
      }

      // Soft delete all exercises
      if (exerciseIds.length > 0) {
        await tx.exercise.deleteMany({
          where: { id: { in: exerciseIds } },
        });
      }

      // Soft delete all circuits
      if (circuitIds.length > 0) {
        await tx.circuit.deleteMany({
          where: { id: { in: circuitIds } },
        });
      }

      // Soft delete all template items
      await tx.templateItem.deleteMany({
        where: { templateId: input.templateId },
      });

      // Soft delete the template
      await tx.workoutTemplate.delete({
        where: { id: input.templateId },
      });

      return { success: true };
    });
  });
