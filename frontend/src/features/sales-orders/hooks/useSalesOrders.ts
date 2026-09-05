import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmSalesOrder,
  createSalesOrder,
  generateInvoice,
  listSalesOrders,
  type CreateSalesOrderInput,
  type GenerateInvoiceInput,
  type ListSalesOrdersParams,
} from "../services/sales-orders.service";


// Query key convention from frontend-nextjs SKILL.md:
// lists -> [feature, "list", params].
const salesOrdersListKey = (params?: ListSalesOrdersParams) => ["sales-orders", "list", params ?? {}] as const;

export function useSalesOrders(params?: ListSalesOrdersParams) {
  return useQuery({
    queryKey: salesOrdersListKey(params),
    queryFn: () => listSalesOrders(params),
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSalesOrderInput) => createSalesOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "list"] });
    },
  });
}

export function useConfirmSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => confirmSalesOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "list"] });
    },
  });
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: GenerateInvoiceInput }) => generateInvoice(id, input),
    onSuccess: () => {
      // Generating an invoice changes the SO's own status (CONFIRMED ->
      // BILLED) and creates a new Customer Invoice, so both lists need
      // refetching.
      queryClient.invalidateQueries({ queryKey: ["sales-orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["customer-invoices", "list"] });
    },
  });
}

