import { api } from "@/lib/api";
import type { Payment, VendorBill } from "@/features/vendor-bills/services/vendor-bills.service";

export type PaymentMethod = "BANK_TRANSFER" | "CHEQUE" | "CASH" | "CARD" | "ONLINE";

export interface PayVendorBillInput {
  amount: number;
  method: PaymentMethod;
  date: string;
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
