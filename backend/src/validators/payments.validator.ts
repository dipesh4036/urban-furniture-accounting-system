import { z } from "zod";

export const payVendorBillSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(["BANK_TRANSFER", "CHEQUE", "CASH", "CARD", "ONLINE"]),
  date: z.coerce.date(),
});
export type PayVendorBillInput = z.infer<typeof payVendorBillSchema>;
