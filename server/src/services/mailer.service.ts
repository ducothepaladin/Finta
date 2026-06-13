import { BrevoClient } from "@getbrevo/brevo"

import { env } from "../config/env.js"
import { HttpError } from "../lib/http-error.js"

type SendEmailArgs = {
  to: string
  subject: string
  html: string
}

let client: BrevoClient | null = null

function getClient(): BrevoClient {
  if (client) {
    return client
  }

  if (!env.brevoApiKey) {
    throw new HttpError(503, "Email service is not configured")
  }

  client = new BrevoClient({ apiKey: env.brevoApiKey })
  return client
}

async function sendEmail({ to, subject, html }: SendEmailArgs) {
  if (!env.brevoFromEmail || !env.brevoFromName) {
    throw new HttpError(503, "Email sender is not configured")
  }

  await getClient().transactionalEmails.sendTransacEmail({
    sender: { email: env.brevoFromEmail, name: env.brevoFromName },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  })
}

export async function sendOtpEmail(toEmail: string, otp: string) {
  await sendEmail({
    to: toEmail,
    subject: "Your verification code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 420px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 12px;">Verify your email</h2>
        <p style="margin: 0 0 16px;">
          Use the code below to verify your email. It expires in <strong>5 minutes</strong>.
        </p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 10px; text-align: center; padding: 16px; background: #f4f4f4; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666; font-size: 12px; margin: 0;">
          If you didn't request this, you can ignore this email.
        </p>
      </div>
    `,
  })
}
