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
