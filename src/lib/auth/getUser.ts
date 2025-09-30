import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma/prisma";
import { CompleteUser } from "./types";

/**
 * Get the authenticated user from Supabase
 * Redirects to login if user is not authenticated
 */
export async function getAuthenticatedUser(): Promise<CompleteUser> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    redirect("/auth/login");
  }

  return {
    authUser: user,
    dbUser,
  };
}

/**
 * Get the authenticated user without redirect
 * Returns null if user is not authenticated
 */
export async function getCurrentUser(): Promise<CompleteUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    return null;
  }

  return {
    authUser: user,
    dbUser,
  };
}
