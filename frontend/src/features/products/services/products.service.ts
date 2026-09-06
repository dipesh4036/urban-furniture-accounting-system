import { api } from "@/lib/api";

// Matches the Product model in plan.md Module 5.
export type ProductType = "GOODS" | "SERVICE" | "COMBO";

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  salesPrice: string;
  costPrice: string;
  category: string;
  image?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// List endpoints are paginated by default (backend-express SKILL.md).
// Field naming (`products`, `product`) matches the convention the backend
// already uses for accounts - see accounts.service.ts.
export interface ProductListResult {
  products: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListProductsParams {
  search?: string;
  type?: ProductType;
  status?: "ACTIVE" | "ARCHIVED" | "INACTIVE";
  page?: number;
  limit?: number;
}

export interface CreateProductInput {
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  category: string;
  image?: string | null;
}

export interface UpdateProductInput {
  name?: string;
  type?: ProductType;
  salesPrice?: number;
  costPrice?: number;
  category?: string;
  image?: string | null;
  isActive?: boolean;
}

// Calls GET /products (plan.md Module 5). The backend route doesn't exist
// yet - it's built in this same branch's Backend Commits - so this call
// will 404 until then.
export function listProducts(params?: ListProductsParams): Promise<ProductListResult> {
  return api.get("/products", { params });
}

// Calls GET /products/:id.
export function getProduct(id: string): Promise<{ product: Product }> {
  return api.get(`/products/${id}`);
}

// Calls POST /products.
export function createProduct(input: CreateProductInput): Promise<{ product: Product }> {
  return api.post("/products", input);
}

// Calls PATCH /products/:id. Used for both editing fields and archiving
// (archiving is just sending { isActive: false }).
export function updateProduct(id: string, input: UpdateProductInput): Promise<{ product: Product }> {
  return api.patch(`/products/${id}`, input);
}
