"use server";

import { authActionClient } from "@/lib/nextSafeAction/client";
import { onboardingSchema } from "@/lib/schemas/auth";
import { SafeActionError } from "@/lib/errors";
import prisma from "@/lib/prisma/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const updateProfile = authActionClient
  .inputSchema(onboardingSchema)
  .action(async ({ parsedInput: { firstname, lastname, gender }, ctx }) => {
    const userId = ctx.user.dbUser.id;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new SafeActionError("User not found");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        firstname,
        lastname,
        gender,
      },
    });

    revalidatePath("/", "layout");
    redirect("/");
  });
