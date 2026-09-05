import { z } from "zod";

// One line in the grid: pick an account, enter a debit OR a credit (or
// both zero while the row is still being filled in). Mirrors backend/src
// /validators/journal-entries.validator.ts's journalItemSchema.
const journalItemFormSchema = z.object({
  accountId: z.string().min(1, "Select an account"),
  debit: z.coerce.number().min(0, "Debit cannot be negative"),
  credit: z.coerce.number().min(0, "Credit cannot be negative"),
});

export const journalEntryFormSchema = z
  .object({
    journalId: z.string().min(1, "Select a journal"),
    date: z.string().min(1, "Date is required"),
    reference: z.string().min(1, "Reference is required"),
    items: z.array(journalItemFormSchema).min(2, "A journal entry needs at least 2 lines"),
  })
  // Same tolerance-based comparison as the backend - see
  // journal-entries.validator.ts's refine for why it's not strict ===.
  .refine(
    (values) => {
      const totalDebit = values.items.reduce((sum, item) => sum + item.debit, 0);
      const totalCredit = values.items.reduce((sum, item) => sum + item.credit, 0);
      return Math.abs(totalDebit - totalCredit) < 0.01;
    },
    { message: "Total debit must equal total credit across all lines", path: ["items"] }
  );

export type JournalEntryFormValues = z.infer<typeof journalEntryFormSchema>;

export const emptyJournalItem = { accountId: "", debit: "" as unknown as number, credit: "" as unknown as number };
