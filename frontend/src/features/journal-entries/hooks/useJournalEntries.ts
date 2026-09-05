import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createJournalEntry,
  getJournalEntry,
  listJournalEntries,
  type CreateJournalEntryInput,
  type ListJournalEntriesParams,
} from "../services/journal-entries.service";

// Query key convention from frontend-nextjs SKILL.md:
// lists -> [feature, "list", params], details -> [feature, "detail", id].
const journalEntriesListKey = (params?: ListJournalEntriesParams) =>
  ["journal-entries", "list", params ?? {}] as const;
const journalEntriesDetailKey = (id: string) => ["journal-entries", "detail", id] as const;

export function useJournalEntries(params?: ListJournalEntriesParams) {
  return useQuery({
    queryKey: journalEntriesListKey(params),
    queryFn: () => listJournalEntries(params),
  });
}

export function useJournalEntry(id: string) {
  return useQuery({
    queryKey: journalEntriesDetailKey(id),
    queryFn: () => getJournalEntry(id),
    enabled: !!id,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateJournalEntryInput) => createJournalEntry(input),
    onSuccess: () => {
      // Refetch every journal entries list, no matter what filters/page
      // it was showing - the new entry could belong on any of them.
      queryClient.invalidateQueries({ queryKey: ["journal-entries", "list"] });
    },
  });
}
