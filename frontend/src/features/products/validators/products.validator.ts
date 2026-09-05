import { z } from "zod";
import type { ProductType } from "../services/products.service";

// Mirrors backend/src/validators/products.validator.ts. Kept in sync with
// the ProductType union in products.service.ts rather than redeclaring
// it, so there's one place that lists the 3 product types.
export const productTypes: readonly ProductType[] = ["GOODS", "SERVICE", "COMBO"];

export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(productTypes as [ProductType, ...ProductType[]], { message: "Select a product type" }),
  salesPrice: z.coerce.number({ message: "Sales price is required" }).positive("Sales price must be positive"),
  costPrice: z.coerce.number({ message: "Cost price is required" }).positive("Cost price must be positive"),
  category: z.string().min(1, "Category is required"),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
