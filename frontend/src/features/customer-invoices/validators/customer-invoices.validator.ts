import { z } from "zod";

// Mirrors backend/src/validators/payments.validator.ts's
// payCustomerInvoiceSchema. This backend only supports CASH/BANK (unlike
// vendor-bill payments on other branches, which have a 5-option enum).
export const paymentMethods = ["CASH", "BANK"] as const;

export const paymentMethodLabels: Record<(typeof paymentMethods)[number], string> = {
  CASH: "Cash",
  BANK: "Bank",
};

export const paymentFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  method: z.enum(paymentMethods, { message: "Select a payment method" }),
  date: z.string().min(1, "Date is required"),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
