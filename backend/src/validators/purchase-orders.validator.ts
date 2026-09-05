import { z } from "zod";

const purchaseOrderItemSchema = z.object({
  productId: z.string().cuid("productId must be a valid id"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  unitPrice: z.number().positive("Unit price must be positive"),
});

export const createPurchaseOrderSchema = z.object({
  vendorId: z.string().cuid("vendorId must be a valid id"),
  date: z.coerce.date(),
  items: z.array(purchaseOrderItemSchema).min(1, "Purchase order must have at least one item"),
});
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;

export const listPurchaseOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type ListPurchaseOrdersQuery = z.infer<typeof listPurchaseOrdersQuerySchema>;
