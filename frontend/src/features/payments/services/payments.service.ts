import { api } from "@/lib/api";
import type { CustomerInvoice, Payment } from "@/features/customer-invoices/services/customer-invoices.service";

// Mirrors backend/src/validators/payments.validator.ts - just CASH/BANK
// on this branch (not the 5-option enum used elsewhere in the project).
export type PaymentMethod = "CASH" | "BANK";

export interface PayCustomerInvoiceInput {
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
