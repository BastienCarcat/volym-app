import { confirmEmailSchema } from "@/app/auth/_schemas/schemas";
import { api } from "@/lib/api/apiResponse";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest } from "next/server";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const errorPath = "/error";
  try {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const nextPath = searchParams.get("next") || "/";

    const redirectTo = request.nextUrl.clone();
    redirectTo.pathname = nextPath;
    redirectTo.searchParams.delete("token_hash");
    redirectTo.searchParams.delete("type");
    redirectTo.searchParams.delete("next");

    const parsed = confirmEmailSchema.safeParse({ token_hash, type });

    if (!parsed.success) {
      console.error("Validation error:", z.prettifyError(parsed.error));
      redirectTo.pathname = errorPath;
      return api.redirect(redirectTo);
    }

    const { token_hash: validToken, type: validType } = parsed.data;

    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: validType,
      token_hash: validToken,
    });

    if (!error) {
      // redirectTo.searchParams.delete("next");
      return api.redirect(redirectTo);
    }

    console.error("Supabase verifyOtp error:", error);
    redirectTo.pathname = errorPath;
    return api.redirect(redirectTo);
  } catch (err) {
    console.error("Unexpected error in confirm route:", err);

    const redirectTo = request.nextUrl.clone();
    redirectTo.pathname = errorPath;
    return api.redirect(redirectTo);
  }
}
