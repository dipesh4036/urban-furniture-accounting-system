import { env } from "../config/env";
import { activationEmail } from "../templates/activationEmail";
import { invoiceEmail } from "../templates/invoiceEmail";
import { resetPasswordEmail } from "../templates/resetPasswordEmail";
import { sendMail } from "../utils/sendMail";

// This is the ONLY file other services (Auth, Contact, Sales, etc.) are
// allowed to import to send an email. They should never import
// sendMail, the templates, or the transporter directly - just call one
// of these three functions.
//
// CORS_ORIGIN is reused here as the frontend's base URL (it's already
// set to the frontend's origin) so we don't need a separate env var
// just to build links.

interface ContactForActivation {
  email: string;
  name: string;
  activationToken: string;
}

export async function sendActivationEmail(contact: ContactForActivation): Promise<boolean> {
  const activationLink = `${env.CORS_ORIGIN}/activate-account?token=${contact.activationToken}`;
  const html = activationEmail(activationLink, contact.name);
  return sendMail({
    to: contact.email,
    subject: "Activate your Urban Furniture account",
    html,
  });
}

interface UserForPasswordReset {
  email: string;
  name: string;
  resetToken: string;
}

export async function sendPasswordResetEmail(user: UserForPasswordReset): Promise<boolean> {
  const resetLink = `${env.CORS_ORIGIN}/reset-password?token=${user.resetToken}`;
  const html = resetPasswordEmail(resetLink, user.name);
  return sendMail({
    to: user.email,
    subject: "Reset your password",
    html,
  });
}

interface InvoiceForEmail {
  id: string;
  invoiceNumber: string;
  totalAmount: string;
  customerEmail: string;
  customerName: string;
}

export async function sendInvoiceEmail(invoice: InvoiceForEmail): Promise<boolean> {
  const viewLink = `${env.CORS_ORIGIN}/portal/invoices/${invoice.id}`;
  const html = invoiceEmail(invoice.invoiceNumber, invoice.customerName, invoice.totalAmount, viewLink);
  return sendMail({
    to: invoice.customerEmail,
    subject: `Invoice ${invoice.invoiceNumber} from Urban Furniture`,
    html,
  });
}
