import { z } from "zod";

// Mirrors backend/src/validators/sales-orders.validator.ts's
// salesOrderItemSchema.
const salesOrderItemFormSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  quantity: z.coerce.number().int().positive("Quantity must be a positive whole number"),
  unitPrice: z.coerce.number().positive("Unit price must be positive"),
  tax: z.coerce.number().min(0, "Tax cannot be negative"),
});

export const salesOrderFormSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  date: z.string().min(1, "Date is required"),
  items: z.array(salesOrderItemFormSchema).min(1, "Add at least one product"),
});

export type SalesOrderFormValues = z.infer<typeof salesOrderFormSchema>;

export const emptySalesOrderItem = { productId: "", quantity: 1, unitPrice: "" as unknown as number, tax: "" as unknown as number };

// For the "Generate Invoice" dialog - mirrors backend's
// generateInvoiceFromSalesOrderSchema.
export const generateInvoiceFormSchema = z.object({
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
});

export type GenerateInvoiceFormValues = z.infer<typeof generateInvoiceFormSchema>;
