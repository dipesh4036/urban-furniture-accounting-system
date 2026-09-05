import { z } from "zod";

// Mirrors backend/src/validators/analytic-accounts.validator.ts.
export const analyticTypes = ["INCOME", "EXPENSE"] as const;
export type AnalyticTypeOption = (typeof analyticTypes)[number];

export const analyticAccountFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(analyticTypes, { message: "Select a type" }),
});

export type AnalyticAccountFormValues = z.infer<typeof analyticAccountFormSchema>;
