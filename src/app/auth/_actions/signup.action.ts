"use server";

import { actionClient } from "@/lib/nextSafeAction/client";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signupSchema } from "../_schemas/signup.schema";
import { SafeActionError } from "@/lib/errors";

export const signup = actionClient
  .inputSchema(signupSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      throw new SafeActionError("Failed to create account. Please try again.");
    }

    revalidatePath("/", "layout");
    redirect("/");
  });
