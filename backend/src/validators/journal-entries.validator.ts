import { z } from "zod";

const journalItemSchema = z.object({
  accountId: z.string().cuid("accountId must be a valid id"),
  debit: z.number().min(0, "Debit cannot be negative").default(0),
  credit: z.number().min(0, "Credit cannot be negative").default(0),
});

export const createJournalEntrySchema = z
  .object({
    journalId: z.string().cuid("journalId must be a valid id"),
    date: z.coerce.date(),
    reference: z.string().min(1, "Reference is required"),
    items: z.array(journalItemSchema).min(2, "A journal entry needs at least 2 lines"),
  })
  .refine(
    (values) => {
      const totalDebit = values.items.reduce((sum, item) => sum + item.debit, 0);
      const totalCredit = values.items.reduce((sum, item) => sum + item.credit, 0);
      // Compare with a tiny tolerance instead of strict === - JS floating
      // point math (e.g. 0.1 + 0.2) can be off by a fraction of a cent,
      // which would otherwise reject perfectly balanced entries.
      return Math.abs(totalDebit - totalCredit) < 0.01;
    },
    {
      message: "Total debit must equal total credit across all lines",
      path: ["items"],
    }
  );
export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;

// For GET /journal-entries?journalId=&from=&to=&page=&limit=
export const listJournalEntriesQuerySchema = z.object({
  journalId: z.string().cuid().optional(),
  search: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type ListJournalEntriesQuery = z.infer<typeof listJournalEntriesQuerySchema>;
