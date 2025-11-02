"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { SafeActionError } from "@/lib/errors";
import { createProgramSchema } from "@/lib/schemas/programs";

export const createProgram = authActionClient
  .inputSchema(createProgramSchema)
  .action(
    async ({
      parsedInput: { name, type, objective },
      ctx: { user },
    }): Promise<{
      id: string;
      name: string;
      note: string | null;
    }> => {
      const program = await prisma.program.create({
        data: {
          name,
          type,
          objective,
          createdBy: user.dbUser.id,
        },
        select: {
          id: true,
          name: true,
          note: true,
        },
      });

      if (!program) {
        throw new SafeActionError("Can't create program");
      }

      return program;
    }
  );
