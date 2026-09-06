import { z } from "zod";

const journalTypeSchema = z.enum(["SALES", "PURCHASE", "BANK", "CASH"]);

export const createJournalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: journalTypeSchema,
  defaultAccountId: z.string().cuid("defaultAccountId must be a valid id"),
});
export type CreateJournalInput = z.infer<typeof createJournalSchema>;

// No update/archive endpoint for Journals per plan.md Module 7 - just
// create and list.
export const listJournalsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type ListJournalsQuery = z.infer<typeof listJournalsQuerySchema>;
