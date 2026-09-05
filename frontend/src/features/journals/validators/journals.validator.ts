import { z } from "zod";
import type { JournalType } from "../services/journals.service";

// Mirrors backend/src/validators/journals.validator.ts. Kept in sync with
// the JournalType union in journals.service.ts rather than redeclaring
// it, so there's one place that lists the 4 journal types.
export const journalTypes: readonly JournalType[] = ["SALES", "PURCHASE", "BANK", "CASH"];

export const journalFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(journalTypes as [JournalType, ...JournalType[]], { message: "Select a journal type" }),
  defaultAccountId: z.string().min(1, "Select a default account"),
});

export type JournalFormValues = z.infer<typeof journalFormSchema>;
