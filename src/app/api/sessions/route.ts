import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/prisma";
import { getTemplateById } from "@/lib/database/get-template-by-id";
import { createSessionSchema } from "@/lib/schemas/sessions";
import { getProgramById } from "@/lib/database/get-program-by-id";
import { userRoute } from "@/lib/safe-route";
import { SafeRouteError } from "@/lib/errors";
import {
  DbSessionExercises,
  getSessionExercises,
} from "@/lib/database/get-session-exercises";

async function duplicateTemplateExercises(
  sessionId: string,
  templateId: string
): Promise<DbSessionExercises> {
  const template = await getTemplateById(templateId);
  if (!template) {
    throw new SafeRouteError("Template not found", 404);
  }

  const sessionExercises = await prisma.sessionExercise.createManyAndReturn({
    data: template.exercises.map((exercise) => ({
      sessionId,
      exerciseId: exercise.exerciseId,
      note: exercise.note,
      order: exercise.order,
      supersetId: exercise.supersetId,
    })),
  });

  const exerciseIdMap = new Map(
    template.exercises.map((exercise, index) => [
      exercise.id,
      sessionExercises[index].id,
    ])
  );

  const setsToCreate = template.exercises.flatMap((exercise) =>
    exercise.sets.map((set) => ({
      sessionExerciseId: exerciseIdMap.get(exercise.id)!,
      weight: set.weight,
      reps: set.reps,
      rest: set.rest,
      order: set.order,
      type: set.type,
      rpe: set.rpe,
    }))
  );

  if (setsToCreate.length > 0) {
    await prisma.sessionSet.createMany({
      data: setsToCreate,
    });
  }

  return getSessionExercises(sessionId);
}

export const POST = userRoute
  .body(createSessionSchema)
  .handler(async (_req, { body }) => {
    const { programId, templateId, name, day, weekNumber, note } = body;

    const program = await getProgramById(programId);

    if (!program) {
      throw new SafeRouteError("Program not found", 404);
    }

    let exercises: DbSessionExercises = [];
    const session = await prisma.session.create({
      data: {
        programId,
        templateId: templateId ?? null,
        name,
        day,
        weekNumber: weekNumber ?? null,
        note: note ?? null,
      },
      select: {
        id: true,
        name: true,
        note: true,
        day: true,
        weekNumber: true,
        programId: true,
        templateId: true,
      },
    });

    if (!session) {
      throw new SafeRouteError("Failed to create session", 500);
    }

    if (templateId) {
      exercises = await duplicateTemplateExercises(session.id, templateId);
    }

    return NextResponse.json(
      { session: { ...session, exercises } },
      { status: 201 }
    );
  });
