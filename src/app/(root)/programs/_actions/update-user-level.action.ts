"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import prisma from "@/lib/prisma/prisma";
import { SafeActionError } from "@/lib/errors";
import { z } from "zod";
import { UserLevel } from "@/generated/prisma";

const updateUserLevelSchema = z.object({
  level: z.enum(UserLevel),
});

export const updateUserLevel = authActionClient
  .inputSchema(updateUserLevelSchema)
  .action(
    async ({
      parsedInput: { level },
      ctx: { user },
    }): Promise<{ success: boolean }> => {
      const updatedUser = await prisma.user.update({
        where: {
          id: user.dbUser.id,
        },
        data: {
          level,
        },
        select: {
          id: true,
        },
      });

      if (!updatedUser) {
        throw new SafeActionError("Can't update user level");
      }

      return { success: true };
    }
  );
