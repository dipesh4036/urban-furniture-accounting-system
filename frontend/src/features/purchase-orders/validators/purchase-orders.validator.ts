import { z } from "zod";

// Mirrors backend/src/validators/purchase-orders.validator.ts's
// purchaseOrderItemSchema.
const purchaseOrderItemFormSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  quantity: z.coerce.number().int().positive("Quantity must be a positive whole number"),
  unitPrice: z.coerce.number().positive("Unit price must be positive"),
});

export const purchaseOrderFormSchema = z.object({
  vendorId: z.string().min(1, "Select a vendor"),
  date: z.string().min(1, "Date is required"),
  items: z.array(purchaseOrderItemFormSchema).min(1, "Add at least one product"),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>;

export const emptyPurchaseOrderItem = { productId: "", quantity: 1, unitPrice: 0 };

// For the "Convert to Bill" dialog - mirrors backend's
// convertPurchaseOrderToBillSchema.
export const convertToBillFormSchema = z.object({
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

export type ConvertToBillFormValues = z.infer<typeof convertToBillFormSchema>;
