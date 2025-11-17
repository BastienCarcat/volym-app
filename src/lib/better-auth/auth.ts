import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prismaRaw } from "@/lib/prisma/prisma";
import { sendResetPasswordEmail } from "@/lib/email/send";

export const auth = betterAuth({
  database: prismaAdapter(prismaRaw, {
    provider: "postgresql",
    usePlural: false,
  }),
  user: {
    additionalFields: {
      firstname: {
        type: "string",
        required: false,
        defaultValue: "",
        input: false,
      },
      lastname: {
        type: "string",
        required: false,
        defaultValue: "",
        input: false,
      },
      gender: {
        type: "string",
        required: false,
        defaultValue: "Male",
        input: false,
      },
      weight: {
        type: "number",
        required: false,
        input: false,
      },
      height: {
        type: "number",
        required: false,
        input: false,
      },
      type: {
        type: "string",
        required: false,
        defaultValue: "Athlete",
        input: false,
      },
      level: {
        type: "string",
        required: false,
        input: false,
      },
      weaknesses: {
        type: "string",
        required: false,
        input: false,
      },
      strengths: {
        type: "string",
        required: false,
        input: false,
      },
    },
    modelName: "User",
  },
  session: {
    modelName: "AuthSession",
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({
        email: user.email,
        resetUrl: url,
        name: user.name,
      });
    },
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"],
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
