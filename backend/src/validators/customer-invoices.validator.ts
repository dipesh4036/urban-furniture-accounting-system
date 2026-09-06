import { z } from "zod";

export const listCustomerInvoicesQuerySchema = z.object({
  status: z.enum(["UNPAID", "PARTIALLY_PAID", "PAID"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  customerId: z.string().cuid().optional(),
});
export type ListCustomerInvoicesQuery = z.infer<typeof listCustomerInvoicesQuerySchema>;
