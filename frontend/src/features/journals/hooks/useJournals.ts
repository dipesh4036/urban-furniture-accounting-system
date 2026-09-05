import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createJournal, listJournals, type CreateJournalInput, type ListJournalsParams } from "../services/journals.service";

// Query key convention from frontend-nextjs SKILL.md:
// lists -> [feature, "list", params]. Journals only ever gets listed (no
// GET /journals/:id in plan.md), so there's no "detail" key here.
const journalsListKey = (params?: ListJournalsParams) => ["journals", "list", params ?? {}] as const;

export function useJournals(params?: ListJournalsParams) {
  return useQuery({
    queryKey: journalsListKey(params),
    queryFn: () => listJournals(params),
  });
}

export function useCreateJournal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateJournalInput) => createJournal(input),
    onSuccess: () => {
      // Refetch every journals list, no matter what page it was showing -
      // the new journal could belong on any of them.
      queryClient.invalidateQueries({ queryKey: ["journals", "list"] });
    },
  });
}
