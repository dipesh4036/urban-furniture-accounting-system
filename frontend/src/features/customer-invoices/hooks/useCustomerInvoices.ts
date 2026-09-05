import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payCustomerInvoice, type PayCustomerInvoiceInput } from "@/features/payments/services/payments.service";
import { listCustomerInvoices, type ListCustomerInvoicesParams } from "../services/customer-invoices.service";

// Query key convention from frontend-nextjs SKILL.md:
// lists -> [feature, "list", params].
const customerInvoicesListKey = (params?: ListCustomerInvoicesParams) =>
  ["customer-invoices", "list", params ?? {}] as const;

export function useCustomerInvoices(params?: ListCustomerInvoicesParams) {
  return useQuery({
    queryKey: customerInvoicesListKey(params),
    queryFn: () => listCustomerInvoices(params),
  });
}

export function usePayCustomerInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, input }: { invoiceId: string; input: PayCustomerInvoiceInput }) =>
      payCustomerInvoice(invoiceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-invoices", "list"] });
    },
  });
}
