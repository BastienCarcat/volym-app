import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/prisma";
import { getTemplateById } from "@/lib/database/get-template-by-id";
import { createSessionFormSchema } from "@/lib/schemas/sessions.form.schema";
import { getProgramById } from "@/lib/database/get-program-by-id";
import { userRoute } from "@/lib/safe-route";
import { SafeRouteError } from "@/lib/errors";
import { getSessionById } from "@/lib/database/get-session-by-id";
import { SessionItemType, CircuitItemType } from "@/generated/prisma";
import {
  DbSessionItems,
  getSessionItems,
} from "@/lib/database/get-session-items";

async function duplicateTemplateItems(sessionId: string, templateId: string) {
  const template = await getTemplateById(templateId);
  if (!template) {
    throw new SafeRouteError("Template not found", 404);
  }

  if (!template.templateItems || template.templateItems.length === 0) {
    return [];
  }

  // Process each template item
  for (const templateItem of template.templateItems) {
    if (
      templateItem.type === SessionItemType.Exercise &&
      templateItem.exercise
    ) {
      // Create Exercise with Sets
      const exercise = await prisma.exercise.create({
        data: {
          exerciseId: templateItem.exercise.exerciseId,
          note: templateItem.exercise.note,
          sets: {
            create: templateItem.exercise.sets.map((set) => ({
              weight: set.weight,
              reps: set.reps,
              rest: set.rest,
              order: set.order,
              type: set.type,
              rpe: set.rpe,
            })),
          },
        },
      });

      // Create SessionItem pointing to Exercise
      await prisma.sessionItem.create({
        data: {
          sessionId,
          type: SessionItemType.Exercise,
          order: templateItem.order,
          exerciseId: exercise.id,
        },
      });
    } else if (
      templateItem.type === SessionItemType.Circuit &&
      templateItem.circuit
    ) {
      // Create Circuit
      const circuit = await prisma.circuit.create({
        data: {
          type: templateItem.circuit.type,
          duration: templateItem.circuit.duration,
          rest: templateItem.circuit.rest,
          note: templateItem.circuit.note,
        },
      });

      // Create CircuitItems
      for (const circuitItem of templateItem.circuit.circuitItems) {
        if (
          circuitItem.type === CircuitItemType.Exercise &&
          circuitItem.exercise
        ) {
          // Create Exercise with Sets
          const exercise = await prisma.exercise.create({
            data: {
              exerciseId: circuitItem.exercise.exerciseId,
              note: circuitItem.exercise.note,
              sets: {
                create: circuitItem.exercise.sets.map((set) => ({
                  weight: set.weight,
                  reps: set.reps,
                  rest: set.rest,
                  order: set.order,
                  type: set.type,
                  rpe: set.rpe,
                })),
              },
            },
          });

          // Create CircuitItem pointing to Exercise
          await prisma.circuitItem.create({
            data: {
              circuitId: circuit.id,
              type: CircuitItemType.Exercise,
              order: circuitItem.order,
              exerciseId: exercise.id,
            },
          });
        }
      }

      // Create SessionItem pointing to Circuit
      await prisma.sessionItem.create({
        data: {
          sessionId,
          type: SessionItemType.Circuit,
          order: templateItem.order,
          circuitId: circuit.id,
        },
      });
    }
  }

  return getSessionItems(sessionId);
}

export const POST = userRoute
  .body(createSessionFormSchema)
  .handler(async (_req, { body }) => {
    const {
      programId,
      templateId,
      name,
      day,
      cycleDay,
      isRestDay,
      weekNumber,
      note,
    } = body;

    const program = await getProgramById(programId);

    if (!program) {
      throw new SafeRouteError("Program not found", 404);
    }

    // For Days type: weekNumber is required (default 1)
    // For Cycle type: weekNumber should be null
    const sessionWeekNumber =
      program.type === "Days" ? weekNumber ?? 1 : null;

    const session = await prisma.session.create({
      data: {
        programId,
        templateId: templateId ?? null,
        name,
        day: day ?? null,
        cycleDay: cycleDay ?? null,
        isRestDay: isRestDay ?? false,
        weekNumber: sessionWeekNumber,
        note: note ?? null,
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
      },
    });

    if (!session) {
      throw new SafeRouteError("Failed to create session", 500);
    }

    // Duplicate template items if templateId provided
    let sessionItems: DbSessionItems = [];

    if (templateId) {
      sessionItems = await duplicateTemplateItems(session.id, templateId);
    }

    return NextResponse.json(
      { session: { ...session, sessionItems } },
      { status: 201 }
    );
  });
