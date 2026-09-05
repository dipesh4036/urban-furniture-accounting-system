import { z } from "zod";

// Mirrors backend/src/validators/budgets.validator.ts.
export const budgetFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  period: z.string().min(1, "Period is required"),
  plannedAmount: z.coerce.number().positive("Planned amount must be positive"),
  analyticAccountId: z.string().min(1, "Select an analytic account"),
  responsiblePersonId: z.string().min(1, "Select a responsible person"),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
