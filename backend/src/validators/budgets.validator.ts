import { z } from "zod";

export const createBudgetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  period: z.string().min(1, "Period is required"),
  plannedAmount: z.number().positive("Planned amount must be positive"),
  analyticAccountId: z.string().cuid("analyticAccountId must be a valid id"),
  responsiblePersonId: z.string().cuid("responsiblePersonId must be a valid id"),
});
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export const listBudgetsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type ListBudgetsQuery = z.infer<typeof listBudgetsQuerySchema>;
