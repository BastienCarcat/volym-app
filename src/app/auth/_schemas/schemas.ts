import { z } from "zod";
import { type EmailOtpType } from "@supabase/supabase-js";

export const loginSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    email: z.email("Invalid email address").min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine(
    (values) => {
      return values.password === values.confirmPassword;
    },
    {
      message: "Passwords must match!",
      path: ["confirmPassword"],
    }
  );

export const confirmEmailSchema = z.object({
  token_hash: z.string().min(1, "Token is required"),
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
      message: "Type is required",
    }
  ),
});
