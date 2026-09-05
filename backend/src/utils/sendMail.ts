import { transporter } from "../config/mailer";
import { env } from "../config/env";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

// Sends one email. On failure, this logs the problem and returns - it
// never throws. That's on purpose: if an email fails to send (e.g. after
// creating a Contact), we don't want that to roll back the database
// write or crash the request. The caller can check the return value if
// it needs to know whether the email actually went out.
export async function sendMail({ to, subject, html }: SendMailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: env.SMTP_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    // Log only what's safe to log - never the SMTP password, and never
    // the full error object (it can include the auth config we sent).
    const reason = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to send email to ${to}: ${reason}`);
    return false;
  }
}
