import { api } from "@/lib/api";
import type { Contact } from "@/features/contacts/services/contacts.service";

export type DocStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export interface Payment {
  id: string;
  type: "PAYMENT" | "REFUND";
  method: "BANK_TRANSFER" | "CHEQUE" | "CASH" | "CARD" | "ONLINE";
  amount: string;
  date: string;
}

// Matches backend/src/services/vendor-bills.service.ts's include:
// { vendor, payments, purchaseOrder: { items } }.
export interface VendorBill {
  id: string;
  billNumber: string;
  purchaseOrderId: string;
  vendorId: string;
  vendor: Contact;
  invoiceDate: string;
  dueDate: string;
  totalAmount: string;
  status: DocStatus;
  payments: Payment[];
}

export interface VendorBillListResult {
  vendorBills: VendorBill[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListVendorBillsParams {
  status?: DocStatus;
  vendorId?: string;
  page?: number;
  limit?: number;
}

// Calls GET /vendor-bills (plan.md Module 9).
export function listVendorBills(params?: ListVendorBillsParams): Promise<VendorBillListResult> {
  return api.get("/vendor-bills", { params });
}

// Calls GET /vendor-bills/:id.
export function getVendorBillById(id: string): Promise<{ vendorBill: VendorBill }> {
  return api.get(`/vendor-bills/${id}`);
}
