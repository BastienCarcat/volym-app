"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { SessionItemType, CircuitItemType } from "@/generated/prisma";
import { getSessionById } from "@/lib/database/get-session-by-id";
import { getTemplateById } from "@/lib/database/get-template-by-id";
import { z } from "zod";

const saveSessionAsTemplateSchema = z.object({
  sessionId: z.string(),
  templateName: z.string().min(1, "Template name is required"),
});

export const saveSessionAsTemplate = authActionClient
  .inputSchema(saveSessionAsTemplateSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    const session = await getSessionById(input.sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    return prisma.$transaction(async (tx) => {
      // 1. Create the template
      const template = await tx.workoutTemplate.create({
        data: {
          name: input.templateName,
          note: session.note,
          createdBy: ctx.user.dbUser.id,
          isPublic: false,
        },
      });

      // 2. Duplicate all SessionItems as TemplateItems
      for (const sessionItem of session.sessionItems) {
        if (
          sessionItem.type === SessionItemType.Exercise &&
          sessionItem.exercise
        ) {
          // Duplicate Exercise with Sets
          const exercise = await tx.exercise.create({
            data: {
              exerciseId: sessionItem.exercise.exerciseId,
              note: sessionItem.exercise.note,
              sets: {
                create: sessionItem.exercise.sets.map((set) => ({
                  weight: set.weight,
                  reps: set.reps,
                  rest: set.rest,
                  type: set.type,
                  rpe: set.rpe,
                  order: set.order,
                })),
              },
            },
          });

          // Create TemplateItem pointing to Exercise
          await tx.templateItem.create({
            data: {
              templateId: template.id,
              type: SessionItemType.Exercise,
              order: sessionItem.order,
              exerciseId: exercise.id,
            },
          });
        } else if (
          sessionItem.type === SessionItemType.Circuit &&
          sessionItem.circuit
        ) {
          // Duplicate Circuit
          const circuit = await tx.circuit.create({
            data: {
              type: sessionItem.circuit.type,
              duration: sessionItem.circuit.duration,
              rest: sessionItem.circuit.rest,
              note: sessionItem.circuit.note,
            },
          });

          // Duplicate CircuitItems
          for (const circuitItem of sessionItem.circuit.circuitItems) {
            if (
              circuitItem.type === CircuitItemType.Exercise &&
              circuitItem.exercise
            ) {
              // Duplicate Exercise with Sets
              const exercise = await tx.exercise.create({
                data: {
                  exerciseId: circuitItem.exercise.exerciseId,
                  note: circuitItem.exercise.note,
                  sets: {
                    create: circuitItem.exercise.sets.map((set) => ({
                      weight: set.weight,
                      reps: set.reps,
                      rest: set.rest,
                      type: set.type,
                      rpe: set.rpe,
                      order: set.order,
                    })),
                  },
                },
              });

              // Create CircuitItem pointing to Exercise
              await tx.circuitItem.create({
                data: {
                  circuitId: circuit.id,
                  type: CircuitItemType.Exercise,
                  order: circuitItem.order,
                  exerciseId: exercise.id,
                },
              });
            }
          }

          // Create TemplateItem pointing to Circuit
          await tx.templateItem.create({
            data: {
              templateId: template.id,
              type: SessionItemType.Circuit,
              order: sessionItem.order,
              circuitId: circuit.id,
            },
          });
        }
      }

      // 3. Return the created template
      return getTemplateById(template.id);
    });
  });
