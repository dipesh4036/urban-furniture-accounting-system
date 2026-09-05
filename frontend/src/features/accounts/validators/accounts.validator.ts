import { z } from "zod";
import type { AccountType } from "../services/accounts.service";

// Mirrors backend/src/validators/accounts.validator.ts exactly. Kept in
// sync with the AccountType union in accounts.service.ts rather than
// redeclaring it, so there's one place that lists the 5 account types.
export const accountTypes: readonly AccountType[] = ["ASSET", "LIABILITY", "EXPENSE", "INCOME", "CAPITAL"];

export const accountFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(accountTypes as [AccountType, ...AccountType[]], { message: "Select an account type" }),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;
