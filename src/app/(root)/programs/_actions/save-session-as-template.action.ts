"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { z } from "zod";
import { getSessionById } from "@/lib/database/get-session-by-id";
import { SafeActionError } from "@/lib/errors";

const saveSessionAsTemplateSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
});

export const saveSessionAsTemplate = authActionClient
  .inputSchema(saveSessionAsTemplateSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    // 1. Fetch the session outside the transaction (read-only operation)
    const session = await getSessionById(input.sessionId);

    if (!session) {
      throw new SafeActionError("Session not found");
    }

    return prisma.$transaction(async (tx) => {
      // 2. Create the WorkoutTemplate
      const template = await tx.workoutTemplate.create({
        data: {
          name: session.name,
          note: session.note,
          createdBy: ctx.user.dbUser.id,
          isPublic: false,
        },
      });

      // 3. Create TemplateExercises with nested TemplateSets in parallel
      await Promise.all(
        session.exercises.map((sessionExercise) =>
          tx.templateExercise.create({
            data: {
              templateId: template.id,
              exerciseId: sessionExercise.exerciseId,
              note: sessionExercise.note,
              order: sessionExercise.order,
              supersetId: sessionExercise.supersetId,
              sets: {
                createMany: {
                  data: sessionExercise.sets.map((set) => ({
                    weight: set.weight,
                    reps: set.reps,
                    rest: set.rest,
                    type: set.type,
                    rpe: set.rpe,
                    order: set.order,
                  })),
                },
              },
            },
          })
        )
      );

      // 4. Update the session to link it to the template
      await tx.session.update({
        where: { id: input.sessionId },
        data: { templateId: template.id },
      });

      // 5. Return the created template
      return tx.workoutTemplate.findUnique({
        where: { id: template.id },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: {
              sets: { orderBy: { order: "asc" } },
            },
          },
        },
      });
    });
  });
