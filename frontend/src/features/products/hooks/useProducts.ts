import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  getProduct,
  listProducts,
  updateProduct,
  type CreateProductInput,
  type ListProductsParams,
  type UpdateProductInput,
} from "../services/products.service";

// Query key convention from frontend-nextjs SKILL.md:
// lists -> [feature, "list", params], details -> [feature, "detail", id].
const productsListKey = (params?: ListProductsParams) => ["products", "list", params ?? {}] as const;
const productsDetailKey = (id: string) => ["products", "detail", id] as const;

export function useProducts(params?: ListProductsParams) {
  return useQuery({
    queryKey: productsListKey(params),
    queryFn: () => listProducts(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productsDetailKey(id),
    queryFn: () => getProduct(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      // Refetch every products list, no matter what filters/page it was
      // showing - the new product could belong on any of them.
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProductInput }) => updateProduct(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      queryClient.invalidateQueries({ queryKey: productsDetailKey(id) });
    },
  });
}

// A thin wrapper over update so the UI doesn't have to build the
// { isActive: false } payload itself every time it archives a product.
export function useArchiveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => updateProduct(id, { isActive: false }),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
      queryClient.invalidateQueries({ queryKey: productsDetailKey(id) });
    },
  });
}
