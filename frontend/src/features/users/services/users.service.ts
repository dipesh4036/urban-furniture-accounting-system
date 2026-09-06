import { api } from "@/lib/api";

// Matches the User model in plan.md Module 3 (staff accounts only -
// Admin and Accountant, never a Contact).
export type StaffRole = "ADMIN" | "ACCOUNTANT";

export interface StaffUser {
  id: string;
  name: string;
  loginId: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// List endpoints are paginated by default (backend-express SKILL.md).
// Field naming (`users`, `user`) matches the convention the backend
// already uses for accounts/products.
export interface UserListResult {
  users: StaffUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListUsersParams {
  search?: string;
  role?: StaffRole;
  status?: "ACTIVE" | "INACTIVE";
  page?: number;
  limit?: number;
}

export interface CreateUserInput {
  name: string;
  loginId: string;
  email: string;
  role: StaffRole;
  password: string;
  confirmPassword: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: StaffRole;
  isActive?: boolean;
  password?: string;
  confirmPassword?: string;
}

// Calls GET /users.
export function listUsers(params?: ListUsersParams): Promise<UserListResult> {
  return api.get("/users", { params });
}

// Calls GET /users/:id.
export function getUser(id: string): Promise<{ user: StaffUser }> {
  return api.get(`/users/${id}`);
}

// Calls POST /users. Admin only (enforced by the backend, not here).
export function createUser(input: CreateUserInput): Promise<{ user: StaffUser }> {
  return api.post("/users", input);
}

// Calls PATCH /users/:id. Used for both editing a user's name/role and
// deactivating/reactivating them (that's just sending { isActive }).
export function updateUser(id: string, input: UpdateUserInput): Promise<{ user: StaffUser }> {
  return api.patch(`/users/${id}`, input);
}
