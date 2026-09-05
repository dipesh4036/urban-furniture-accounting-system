import { z } from "zod";

const accountTypeSchema = z.enum(["ASSET", "LIABILITY", "EXPENSE", "INCOME", "CAPITAL"]);

export const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: accountTypeSchema,
});
export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  type: accountTypeSchema.optional(),
  isActive: z.boolean().optional(),
});
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

// For GET /accounts?type=&page=&limit= - query params always arrive as
// strings, so page/limit get coerced to numbers here.
export const listAccountsQuerySchema = z.object({
  type: accountTypeSchema.optional(),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type ListAccountsQuery = z.infer<typeof listAccountsQuerySchema>;
