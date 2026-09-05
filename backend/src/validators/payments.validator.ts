import { z } from "zod";

export const payVendorBillSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(["CASH", "BANK"]),
  date: z.coerce.date(),
});
export type PayVendorBillInput = z.infer<typeof payVendorBillSchema>;

export const payCustomerInvoiceSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(["CASH", "BANK"]),
  date: z.coerce.date(),
});
export type PayCustomerInvoiceInput = z.infer<typeof payCustomerInvoiceSchema>;
