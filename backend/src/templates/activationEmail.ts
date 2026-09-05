// Returns the HTML body for the "activate your account" email we send to
// a Contact (customer/vendor) right after an Admin/Accountant creates
// them in Contact Master. Email clients don't support external
// stylesheets, so all styling has to be inline like this.
export function activationEmail(activationLink: string, contactName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #111827;">Activate your Urban Furniture account</h2>
      <p style="color: #374151; font-size: 14px;">Hi ${contactName},</p>
      <p style="color: #374151; font-size: 14px;">
        An account has been created for you on Urban Furniture. Click the button
        below to set your password and activate your account.
      </p>
      <p style="margin: 32px 0;">
        <a
          href="${activationLink}"
          style="background-color: #111827; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: bold;"
        >
          Activate Account
        </a>
      </p>
      <p style="color: #6b7280; font-size: 12px;">
        If you weren't expecting this email, you can safely ignore it.
      </p>
    </div>
  `;
}
