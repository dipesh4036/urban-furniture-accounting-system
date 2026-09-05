import { z } from "zod";

// Mirrors backend/src/validators/payments.validator.ts's
// payCustomerInvoiceSchema - same 5-option enum as vendor-bill payments.
export const paymentMethods = ["BANK_TRANSFER", "CHEQUE", "CASH", "CARD", "ONLINE"] as const;

export const paymentMethodLabels: Record<(typeof paymentMethods)[number], string> = {
  BANK_TRANSFER: "Bank Transfer",
  CHEQUE: "Cheque",
  CASH: "Cash",
  CARD: "Card",
  ONLINE: "Online",
};

export const paymentFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  method: z.enum(paymentMethods, { message: "Select a payment method" }),
  date: z.string().min(1, "Date is required"),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
