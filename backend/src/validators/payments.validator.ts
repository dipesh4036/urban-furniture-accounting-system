import { z } from "zod";

// Must stay in sync with the Prisma `PaymentMethod` enum
// (backend/prisma/schema.prisma) and the frontend `paymentMethods`
// list. "BANK" is a legacy value kept for old rows only.
const paymentMethodEnum = z.enum(
  ["BANK_TRANSFER", "CHEQUE", "CASH", "CARD", "ONLINE"],
  { message: "Select a valid payment method" }
);

export const payVendorBillSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  method: paymentMethodEnum,
  date: z.coerce.date(),
});
export type PayVendorBillInput = z.infer<typeof payVendorBillSchema>;

export const payCustomerInvoiceSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  method: paymentMethodEnum,
  date: z.coerce.date(),
});
export type PayCustomerInvoiceInput = z.infer<typeof payCustomerInvoiceSchema>;
