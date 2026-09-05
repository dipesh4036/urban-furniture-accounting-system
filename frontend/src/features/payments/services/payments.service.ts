import { api } from "@/lib/api";
import type { CustomerInvoice } from "@/features/customer-invoices/services/customer-invoices.service";
import type { Payment, VendorBill } from "@/features/vendor-bills/services/vendor-bills.service";

export type PaymentMethod = "BANK_TRANSFER" | "CHEQUE" | "CASH" | "CARD" | "ONLINE";

export interface PayCustomerInvoiceInput {
  amount: number;
  method: PaymentMethod;
  date: string;
}

export interface PayVendorBillInput {
  amount: number;
  method: PaymentMethod;
  date: string;
}

// Calls POST /payments/invoice/:invoiceId (plan.md Module 10). Backend
// rejects (422) if amount would push the total paid over the invoice's
// totalAmount - see backend/src/services/payments.service.ts's
// payCustomerInvoice.
export function payCustomerInvoice(
  invoiceId: string,
  input: PayCustomerInvoiceInput
): Promise<{ payment: Payment; customerInvoice: CustomerInvoice }> {
  return api.post(`/payments/invoice/${invoiceId}`, input);
}

// Calls POST /payments/vendor-bill/:billId (plan.md Module 9). Backend
// rejects (422) if amount would push the total paid over the bill's
// totalAmount - see backend/src/services/payments.service.ts.
export function payVendorBill(
  billId: string,
  input: PayVendorBillInput
): Promise<{ payment: Payment; vendorBill: VendorBill }> {
  return api.post(`/payments/vendor-bill/${billId}`, input);
}
