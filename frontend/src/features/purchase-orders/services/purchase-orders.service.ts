import { api } from "@/lib/api";
import type { Contact } from "@/features/contacts/services/contacts.service";

// Matches the PurchaseOrder model in plan.md Module 9.
export type OrderStatus = "DRAFT" | "CONFIRMED" | "BILLED" | "CANCELLED";

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  quantity: number;
  // A string because the backend stores this as a Prisma Decimal.
  unitPrice: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendor: Contact;
  date: string;
  status: OrderStatus;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderListResult {
  purchaseOrders: PurchaseOrder[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListPurchaseOrdersParams {
  page?: number;
  limit?: number;
}

export interface CreatePurchaseOrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderInput {
  vendorId: string;
  date: string;
  items: CreatePurchaseOrderItemInput[];
}

export interface ConvertToBillInput {
  invoiceDate: string;
  dueDate: string;
}

// Same shape as backend/src/services/vendor-bills.service.ts's include -
// vendor, payments, and the purchaseOrder it was converted from.
export interface VendorBill {
  id: string;
  billNumber: string;
  purchaseOrderId: string;
  vendorId: string;
  vendor: Contact;
  invoiceDate: string;
  dueDate: string;
  totalAmount: string;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID";
}

// Calls GET /purchase-orders (plan.md Module 9).
export function listPurchaseOrders(params?: ListPurchaseOrdersParams): Promise<PurchaseOrderListResult> {
  return api.get("/purchase-orders", { params });
}

// Calls GET /purchase-orders/:id.
export function getPurchaseOrderById(id: string): Promise<{ purchaseOrder: PurchaseOrder }> {
  return api.get(`/purchase-orders/${id}`);
}

// Calls POST /purchase-orders.
export function createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<{ purchaseOrder: PurchaseOrder }> {
  return api.post("/purchase-orders", input);
}

// Calls POST /purchase-orders/:id/convert-to-bill. Only works while the
// PO's status is CONFIRMED (backend rejects it otherwise with a 422) -
// see purchase-orders.service.ts's convertPurchaseOrderToBill.
export function convertToBill(id: string, input: ConvertToBillInput): Promise<{ vendorBill: VendorBill }> {
  return api.post(`/purchase-orders/${id}/convert-to-bill`, input);
}

// Calls POST /purchase-orders/:id/confirm. Moves status from DRAFT to CONFIRMED.
export function confirmPurchaseOrder(id: string): Promise<{ purchaseOrder: PurchaseOrder }> {
  return api.post(`/purchase-orders/${id}/confirm`);
}

