import { z } from "zod";

export const listVendorBillsQuerySchema = z.object({
  status: z.enum(["UNPAID", "PARTIALLY_PAID", "PAID"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  vendorId: z.string().cuid().optional(),
});
export type ListVendorBillsQuery = z.infer<typeof listVendorBillsQuerySchema>;
