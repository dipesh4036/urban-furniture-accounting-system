// Returns the HTML body for the "reset your password" email. Used for
// both staff (User) and Contact accounts - whoever asked for the reset.
export function resetPasswordEmail(resetLink: string, recipientName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #111827;">Reset your password</h2>
      <p style="color: #374151; font-size: 14px;">Hi ${recipientName},</p>
      <p style="color: #374151; font-size: 14px;">
        We received a request to reset your Urban Furniture password. Click the
        button below to choose a new one.
      </p>
      <p style="margin: 32px 0;">
        <a
          href="${resetLink}"
          style="background-color: #111827; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: bold;"
        >
          Reset Password
        </a>
      </p>
      <p style="color: #6b7280; font-size: 12px;">
        This link will expire soon, so please reset your password shortly.
        If you didn't request this, you can safely ignore this email - your
        password won't be changed.
      </p>
    </div>
  `;
}
