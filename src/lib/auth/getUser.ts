import { auth } from "@/lib/better-auth/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma/prisma";
import { CompleteUser } from "./types";
import { headers } from "next/headers";

/**
 * Get the authenticated user from Better Auth
 * Redirects to login if user is not authenticated
 */
export async function getAuthenticatedUser(): Promise<CompleteUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!dbUser) {
    redirect("/auth/onboarding");
  }

  if (!dbUser.firstname || !dbUser.lastname) {
    redirect("/auth/onboarding");
  }

  return {
    authUser: session.user,
    dbUser,
  };
}

/**
 * Get the authenticated user without redirect
 * Returns null if user is not authenticated
 */
export async function getCurrentUser(): Promise<CompleteUser | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!dbUser) {
    return null;
  }

  return {
    authUser: session.user,
    dbUser,
  };
}
