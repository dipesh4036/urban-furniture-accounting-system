import { z } from "zod";
import { passwordComplexity } from "./auth.validator";

// [FIX] plan.md Module 0: the original mockup's Create User form had a
// User/Administrator radio - that's wrong. The only two roles an Admin
// can create here are ADMIN and ACCOUNTANT (a Contact is never created
// through this form).
const staffRoleSchema = z.enum(["ADMIN", "ACCOUNTANT"]);

export const createUserSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    loginId: z
      .string()
      .min(6, "Login Id must be between 6 and 12 characters")
      .max(12, "Login Id must be between 6 and 12 characters"),
    email: z.string().email("Enter a valid email address"),
    role: staffRoleSchema,
    password: passwordComplexity,
    confirmPassword: z.string().min(1, "Please re-enter the password"),
  })
  // loginId/email uniqueness isn't checked here - Zod only validates
  // shape. users.service.ts's createStaffUser checks the database and
  // throws a 409 if either is already taken.
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  role: staffRoleSchema.optional(),
  isActive: z.boolean().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// For GET /users?page=&limit= - query params always arrive as strings,
// so page/limit get coerced to numbers here (same pattern as
// accounts.validator.ts's listAccountsQuerySchema).
export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
