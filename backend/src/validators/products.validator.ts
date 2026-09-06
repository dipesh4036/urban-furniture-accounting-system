import { z } from "zod";

const productTypeSchema = z.enum(["GOODS", "SERVICE", "COMBO"]);

// An image is a path returned by POST /uploads (e.g. "/uploads/<name>.jpg"),
// a full URL, or a base64 data URI.
const imageSchema = z
  .string()
  .refine(
    (value) =>
      value.startsWith("/uploads/") || value.startsWith("data:image/") || z.string().url().safeParse(value).success,
    "Image must be a valid URL or uploaded file path"
  );

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: productTypeSchema,
  salesPrice: z.number().positive("Sales price must be greater than 0"),
  costPrice: z.number().positive("Cost price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  image: imageSchema.optional().nullable(),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  type: productTypeSchema.optional(),
  salesPrice: z.number().positive("Sales price must be greater than 0").optional(),
  costPrice: z.number().positive("Cost price must be greater than 0").optional(),
  category: z.string().min(1, "Category is required").optional(),
  image: imageSchema.optional().nullable(),
  isActive: z.boolean().optional(),
});
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// For GET /products?type=&search=&page=&limit= - query params always
// arrive as strings, so page/limit get coerced to numbers here.
// `search` matches against the product name (see products.service.ts).
export const listProductsQuerySchema = z.object({
  type: productTypeSchema.optional(),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "INACTIVE"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
