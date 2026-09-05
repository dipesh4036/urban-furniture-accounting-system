// Returns the HTML body for the email we send a Customer when their
// invoice is generated (Sales Order -> Generate Invoice). Summarizes the
// invoice and links to the portal page where they can view it and pay.
export function invoiceEmail(
  invoiceNumber: string,
  customerName: string,
  totalAmount: string,
  viewLink: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #111827;">Invoice ${invoiceNumber} from Urban Furniture</h2>
      <p style="color: #374151; font-size: 14px;">Hi ${customerName},</p>
      <p style="color: #374151; font-size: 14px;">
        A new invoice has been generated for you. Here's a quick summary:
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Invoice Number</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">${invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Total Amount</td>
          <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: bold; text-align: right; border-top: 1px solid #e5e7eb;">${totalAmount}</td>
        </tr>
      </table>
      <p style="margin: 32px 0;">
        <a
          href="${viewLink}"
          style="background-color: #111827; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: bold;"
        >
          View & Pay Invoice
        </a>
      </p>
      <p style="color: #6b7280; font-size: 12px;">
        You can view the full invoice details and make a payment anytime using the
        link above.
      </p>
    </div>
  `;
}
