import { transporter } from "../config/mailer";
import { env } from "../config/env";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  // Plain-text fallback. Always pass this: a multipart email with a real
  // text/plain part is far less likely to be marked as spam than an
  // HTML-only message.
  text?: string;
}

// Strip tags as a last-resort text fallback when a caller forgets to
// pass `text`.
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Sends one email. On failure, this logs the problem and returns - it
// never throws. That's on purpose: if an email fails to send (e.g. after
// creating a Contact), we don't want that to roll back the database
// write or crash the request. The caller can check the return value if
// it needs to know whether the email actually went out.
export async function sendMail({ to, subject, html, text }: SendMailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      // Display name + real address. The address MUST stay equal to
      // SMTP_USER so it aligns with Gmail's SPF/DKIM signing - a
      // mismatched From is an instant spam signal.
      from: `Urban Furniture <${env.SMTP_USER}>`,
      to,
      replyTo: env.SMTP_USER,
      subject,
      html,
      text: text && text.trim() ? text : htmlToText(html),
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
