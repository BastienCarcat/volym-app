# Email Configuration

This directory contains the email configuration and sending logic using [Resend](https://resend.com/).

## Setup

### 1. Get Resend API Key

1. Sign up at [resend.com](https://resend.com/)
2. Go to **API Keys** in your dashboard
3. Create a new API key
4. Add it to your `.env` file:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

### 2. Configure Email Sender

Add your verified domain email to `.env`:

```env
EMAIL_FROM=Volym <onboarding@volym.app>
EMAIL_REPLY_TO=support@volym.app
```

### 3. Create Email Templates

Create templates in your Resend dashboard:

#### Reset Password Template

1. Go to **Templates** in Resend dashboard
2. Click **Create Template**
3. Name: `Reset Password`
4. Subject: `Reset your Volym password`
5. Template content (example):

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Password</title>
</head>
<body style="font-family: sans-serif; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h1>Reset your password</h1>
    <p>Hi {{name}},</p>
    <p>You requested to reset your password. Click the button below to create a new password:</p>
    <a href="{{resetUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0;">
      Reset Password
    </a>
    <p>Or copy and paste this link into your browser:</p>
    <p style="color: #666; word-break: break-all;">{{resetUrl}}</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p>This link will expire in 1 hour.</p>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    <p style="color: #999; font-size: 12px;">
      Volym - Weightlifting Training Platform<br>
      This is an automated email, please do not reply.
    </p>
  </div>
</body>
</html>
```

6. Copy the template ID and add it to `.env`:

```env
RESEND_TEMPLATE_RESET_PASSWORD=your-template-id-here
```

#### Email Verification Template (Optional)

Follow the same steps for email verification if needed:

```env
RESEND_TEMPLATE_EMAIL_VERIFICATION=your-template-id-here
```

## Template Variables

Templates in Resend use `{{variableName}}` syntax. Available variables:

### Reset Password Email
- `{{name}}` - User's name
- `{{resetUrl}}` - Password reset URL with token

### Email Verification (future)
- `{{name}}` - User's name
- `{{verificationUrl}}` - Email verification URL with token

## File Structure

```
src/lib/email/
├── config.ts          # Resend client & template configuration
├── send.ts            # Email sending functions
└── README.md          # This file
```

## Usage

```typescript
import { sendResetPasswordEmail } from "@/lib/email/send";

await sendResetPasswordEmail({
  email: "user@example.com",
  resetUrl: "https://app.volym.com/auth/reset-password?token=xxx",
  name: "John Doe"
});
```

## Best Practices

1. **Never hardcode** email content in code - use Resend templates
2. **Always validate** environment variables on startup (see `config.ts`)
3. **Use template IDs** from environment variables for easy updates
4. **Add proper error handling** for failed email sends
5. **Use tags** for email categorization and tracking
6. **Test emails** in development using Resend's test mode

## Testing

Resend provides a test mode where emails are not actually sent. Check your Resend dashboard for sent emails during development.

## Production Checklist

- [ ] Verify your sending domain in Resend
- [ ] Add SPF and DKIM records to your domain
- [ ] Create all required templates
- [ ] Add all template IDs to production environment variables
- [ ] Test email delivery
- [ ] Monitor email sending in Resend dashboard
