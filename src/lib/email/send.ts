import { resend, emailConfig, emailTemplates } from "./config";

interface SendResetPasswordEmailParams {
  email: string;
  resetUrl: string;
  name: string;
}

export async function sendResetPasswordEmail({
  email,
  resetUrl,
  name,
}: SendResetPasswordEmailParams) {
  const template = emailTemplates.resetPassword;

  if (!template.templateId) {
    console.error(
      "RESEND_TEMPLATE_RESET_PASSWORD is not defined. Email will not be sent."
    );
    return { error: "Email configuration error" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: email,
      // subject: template.subject,
      template: {
        id: "volym-reset-password",
        variables: {
          name: name,
          resetUrl: resetUrl,
        },
      },
      // tags: [
      //   {
      //     name: "type",
      //     value: "reset-password",
      //   },
      // ],
      // headers: {
      //   "X-Entity-Ref-ID": `reset-password-${Date.now()}`,
      // },
    });

    if (error) {
      console.error("Failed to send reset password email:", error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error("Failed to send reset password email:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to send reset email",
    };
  }
}

interface SendVerificationEmailParams {
  email: string;
  verificationUrl: string;
  name?: string;
}

export async function sendVerificationEmail({
  email,
  verificationUrl,
  name,
}: SendVerificationEmailParams) {
  const template = emailTemplates.emailVerification;

  if (!template.templateId) {
    console.error(
      "RESEND_TEMPLATE_EMAIL_VERIFICATION is not defined. Email will not be sent."
    );
    return { error: "Email configuration error" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: email,
      subject: template.subject,
      react: template.templateId as never,
      tags: [
        {
          name: "type",
          value: "email-verification",
        },
      ],
      headers: {
        "X-Entity-Ref-ID": `email-verification-${Date.now()}`,
      },
    });

    if (error) {
      console.error("Failed to send verification email:", error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to send verification email",
    };
  }
}
