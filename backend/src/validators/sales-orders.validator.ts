import { z } from "zod";

const salesOrderItemSchema = z.object({
  productId: z.string().cuid("productId must be a valid id"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unitPrice: z.number().positive("Unit price must be positive"),
  tax: z.number().nonnegative("Tax cannot be negative").default(0),
});

export const createSalesOrderSchema = z.object({
  customerId: z.string().cuid("customerId must be a valid id"),
  date: z.coerce.date(),
  items: z.array(salesOrderItemSchema).min(1, "Sales order must have at least one item"),
});
export type CreateSalesOrderInput = z.infer<typeof createSalesOrderSchema>;

export const listSalesOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type ListSalesOrdersQuery = z.infer<typeof listSalesOrdersQuerySchema>;
