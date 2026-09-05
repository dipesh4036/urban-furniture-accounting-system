import { api } from "@/lib/api";
import type { Contact } from "@/features/contacts/services/contacts.service";

// Matches the SalesOrder model in plan.md Module 10.
export type OrderStatus = "DRAFT" | "CONFIRMED" | "BILLED" | "CANCELLED";

export interface SalesOrderItem {
  id: string;
  productId: string;
  quantity: number;
  // Strings because the backend stores these as Prisma Decimal.
  unitPrice: string;
  tax: string;
}

export interface SalesOrder {
  id: string;
  soNumber: string;
  customerId: string;
  customer: Contact;
  date: string;
  status: OrderStatus;
  items: SalesOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrderListResult {
  salesOrders: SalesOrder[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListSalesOrdersParams {
  page?: number;
  limit?: number;
}

export interface CreateSalesOrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  tax: number;
}

export interface CreateSalesOrderInput {
  customerId: string;
  date: string;
  items: CreateSalesOrderItemInput[];
}

export interface GenerateInvoiceInput {
  invoiceDate: string;
  dueDate: string;
}

// Same shape as backend/src/services/customer-invoices.service.ts's
// include - customer, payments, and the salesOrder it was generated from.
export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  salesOrderId: string;
  customerId: string;
  customer: Contact;
  invoiceDate: string;
  dueDate: string;
  totalAmount: string;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID";
  emailSentAt: string | null;
}

// Calls GET /sales-orders (plan.md Module 10).
export function listSalesOrders(params?: ListSalesOrdersParams): Promise<SalesOrderListResult> {
  return api.get("/sales-orders", { params });
}

// Calls GET /sales-orders/:id.
export function getSalesOrderById(id: string): Promise<{ salesOrder: SalesOrder }> {
  return api.get(`/sales-orders/${id}`);
}

// Calls POST /sales-orders.
export function createSalesOrder(input: CreateSalesOrderInput): Promise<{ salesOrder: SalesOrder }> {
  return api.post("/sales-orders", input);
}

// Calls POST /sales-orders/:id/generate-invoice. Only works while the
// SO's status is CONFIRMED (backend rejects it otherwise with a 422) -
// see sales-orders.service.ts's generateInvoiceFromSalesOrder.
export function generateInvoice(
  id: string,
  input: GenerateInvoiceInput
): Promise<{ customerInvoice: CustomerInvoice }> {
  return api.post(`/sales-orders/${id}/generate-invoice`, input);
}
