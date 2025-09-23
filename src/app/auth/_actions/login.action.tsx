"use server";

import { actionClient, ActionError } from "@/lib/nextSafeAction/client";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginSchema } from "../_schemas/login.schema";

export const login = actionClient
  .inputSchema(loginSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new ActionError("Failed to login. Please try again.");
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  });
