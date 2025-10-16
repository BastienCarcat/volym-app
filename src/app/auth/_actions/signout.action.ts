"use server";

import { SafeActionError } from "@/lib/errors";
import { actionClient } from "@/lib/nextSafeAction/client";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const signOut = actionClient.action(async () => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new SafeActionError("Failed to logout. Please try again.");
  }

  revalidatePath("/", "layout");
  redirect("/");
});
