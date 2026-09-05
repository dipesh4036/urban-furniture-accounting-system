import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payVendorBill, type PayVendorBillInput } from "@/features/payments/services/payments.service";
import { listVendorBills, type ListVendorBillsParams } from "../services/vendor-bills.service";

// Query key convention from frontend-nextjs SKILL.md:
// lists -> [feature, "list", params].
const vendorBillsListKey = (params?: ListVendorBillsParams) => ["vendor-bills", "list", params ?? {}] as const;

export function useVendorBills(params?: ListVendorBillsParams) {
  return useQuery({
    queryKey: vendorBillsListKey(params),
    queryFn: () => listVendorBills(params),
  });
}

export function usePayVendorBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ billId, input }: { billId: string; input: PayVendorBillInput }) => payVendorBill(billId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-bills", "list"] });
    },
  });
}
