import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContact,
  getContactById,
  listContacts,
  resendActivationEmail,
  updateContact,
  type CreateContactInput,
  type ListContactsParams,
  type UpdateContactInput,
} from "../services/contacts.service";

// Query key convention from frontend-nextjs SKILL.md:
// lists -> [feature, "list", params], details -> [feature, "detail", id].
const contactsListKey = (params?: ListContactsParams) => ["contacts", "list", params ?? {}] as const;
const contactDetailKey = (id: string) => ["contacts", "detail", id] as const;

export function useContacts(params?: ListContactsParams) {
  return useQuery({
    queryKey: contactsListKey(params),
    queryFn: () => listContacts(params),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: contactDetailKey(id),
    queryFn: () => getContactById(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateContactInput) => createContact(input),
    onSuccess: () => {
      // Refetch every contacts list, no matter what filters/page it was
      // showing - the new contact could belong on any of them.
      queryClient.invalidateQueries({ queryKey: ["contacts", "list"] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateContactInput }) => updateContact(id, input),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contacts", "list"] });
      queryClient.invalidateQueries({ queryKey: contactDetailKey(variables.id) });
    },
  });
}

export function useResendActivationEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resendActivationEmail(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: ["contacts", "list"] });
      queryClient.invalidateQueries({ queryKey: contactDetailKey(id) });
    },
  });
}
