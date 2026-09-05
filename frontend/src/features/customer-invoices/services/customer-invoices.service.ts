import { api } from "@/lib/api";
import type { Contact } from "@/features/contacts/services/contacts.service";

export type DocStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export interface Payment {
  id: string;
  type: "PAYMENT" | "RECEIPT";
  method: "CASH" | "BANK";
  amount: string;
  date: string;
}

// Matches backend/src/services/customer-invoices.service.ts's include:
// { customer, payments, salesOrder: { items } }.
export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  salesOrderId: string;
  customerId: string;
  customer: Contact;
  invoiceDate: string;
  dueDate: string;
  totalAmount: string;
  status: DocStatus;
  emailSentAt: string | null;
  payments: Payment[];
  salesOrder?: {
    id: string;
    soNumber: string;
    items?: Array<{
      id: string;
      productId: string;
      quantity: number;
      unitPrice: string | number;
      tax: string | number;
    }>;
  };
}

export interface CustomerInvoiceListResult {
  customerInvoices: CustomerInvoice[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListCustomerInvoicesParams {
  status?: DocStatus;
  customerId?: string;
  page?: number;
  limit?: number;
}

// Calls GET /customer-invoices (plan.md Module 10).
export function listCustomerInvoices(
  params?: ListCustomerInvoicesParams
): Promise<CustomerInvoiceListResult> {
  return api.get("/customer-invoices", { params });
}

// Calls GET /customer-invoices/:id.
export function getCustomerInvoiceById(id: string): Promise<{ customerInvoice: CustomerInvoice }> {
  return api.get(`/customer-invoices/${id}`);
}
