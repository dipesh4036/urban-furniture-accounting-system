import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUser,
  getUser,
  listUsers,
  updateUser,
  type CreateUserInput,
  type ListUsersParams,
  type UpdateUserInput,
} from "../services/users.service";

// Query key convention from frontend-nextjs SKILL.md:
// lists -> [feature, "list", params], details -> [feature, "detail", id].
const usersListKey = (params?: ListUsersParams) => ["users", "list", params ?? {}] as const;
const usersDetailKey = (id: string) => ["users", "detail", id] as const;

export function useUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: usersListKey(params),
    queryFn: () => listUsers(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: usersDetailKey(id),
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      // Refetch every users list, no matter what page it was showing -
      // the new user could belong on any of them.
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) => updateUser(id, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      queryClient.invalidateQueries({ queryKey: usersDetailKey(id) });
    },
  });
}
