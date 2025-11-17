import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const emailConfig = {
  from: process.env.EMAIL_FROM || "Volym <onboarding@volym.app>",
  replyTo: process.env.EMAIL_REPLY_TO || "support@volym.app",
} as const;

export const emailTemplates = {
  resetPassword: {
    subject: "Reset your Volym password",
    templateId: process.env.RESEND_TEMPLATE_RESET_PASSWORD,
  },
  emailVerification: {
    subject: "Verify your Volym email",
    templateId: process.env.RESEND_TEMPLATE_EMAIL_VERIFICATION,
  },
} as const;
