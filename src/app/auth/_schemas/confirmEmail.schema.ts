import { z } from "zod";
import { type EmailOtpType } from "@supabase/supabase-js";

export const confirmEmailSchema = z.object({
  token_hash: z.string().min(1, "Le token est requis"),
  type: z.custom<EmailOtpType>(
    (val) => {
      return [
        "signup",
        "invite",
        "magiclink",
        "recovery",
        "email",
        "email_change",
      ].includes(val as string);
    },
    {
      message: "Le type est requis",
    }
  ),
});
