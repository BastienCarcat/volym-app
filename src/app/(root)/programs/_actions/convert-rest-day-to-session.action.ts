"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { SafeActionError } from "@/lib/errors";
import z from "zod";

const convertRestDayToSessionSchema = z.object({
  sessionId: z.string(),
});

export const convertRestDayToSession = authActionClient
  .inputSchema(convertRestDayToSessionSchema)
  .action(async ({ parsedInput: input }) => {
    const { sessionId } = input;

    const session = await prisma.session.update({
      where: { id: sessionId },
      data: { isRestDay: false },
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
      throw new SafeActionError("Failed to convert rest day to session");
    }

    return session;
  });
