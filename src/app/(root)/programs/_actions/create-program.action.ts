"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { SafeActionError } from "@/lib/errors";
import { createProgramSchema } from "@/lib/schemas/programs";

export const createProgram = authActionClient
  .inputSchema(createProgramSchema)
  .action(
    async ({
      parsedInput: { name },
      ctx: { user },
    }): Promise<{
      id: string;
      name: string;
      note: string | null;
      createdBy: string;
    }> => {
      const program = await prisma.program.create({
        data: {
          name,
          createdBy: user.dbUser.id,
        },
      });

      if (!program) {
        throw new SafeActionError("Can't create program");
      }

      return program;
    }
  );
