"use server";

import { actionClient, ActionError } from "@/lib/nextSafeAction/client";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const signOut = actionClient.action(async () => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new ActionError("Failed to logout. Please try again.");
  }

  revalidatePath("/", "layout");
  redirect("/");
});
