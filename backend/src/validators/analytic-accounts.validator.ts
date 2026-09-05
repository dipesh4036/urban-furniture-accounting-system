import { z } from "zod";

const analyticTypeSchema = z.enum(["INCOME", "EXPENSE"]);

export const createAnalyticAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: analyticTypeSchema,
});
export type CreateAnalyticAccountInput = z.infer<typeof createAnalyticAccountSchema>;

export const listAnalyticAccountsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type ListAnalyticAccountsQuery = z.infer<typeof listAnalyticAccountsQuerySchema>;
