import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmPurchaseOrder,
  convertToBill,
  createPurchaseOrder,
  listPurchaseOrders,
  type ConvertToBillInput,
  type CreatePurchaseOrderInput,
  type ListPurchaseOrdersParams,
} from "../services/purchase-orders.service";


// Query key convention from frontend-nextjs SKILL.md:
// lists -> [feature, "list", params].
const purchaseOrdersListKey = (params?: ListPurchaseOrdersParams) =>
  ["purchase-orders", "list", params ?? {}] as const;

export function usePurchaseOrders(params?: ListPurchaseOrdersParams) {
  return useQuery({
    queryKey: purchaseOrdersListKey(params),
    queryFn: () => listPurchaseOrders(params),
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePurchaseOrderInput) => createPurchaseOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders", "list"] });
    },
  });
}

export function useConfirmPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => confirmPurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders", "list"] });
    },
  });
}

export function useConvertToBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ConvertToBillInput }) => convertToBill(id, input),
    onSuccess: () => {
      // Converting changes the PO's own status (CONFIRMED -> BILLED)
      // and creates a new Vendor Bill, so both lists need refetching.
      queryClient.invalidateQueries({ queryKey: ["purchase-orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-bills", "list"] });
    },
  });
}

