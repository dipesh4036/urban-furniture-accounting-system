import { z } from "zod";
import { passwordComplexity } from "@/features/auth/validators/auth.validator";

// [FIX] plan.md Module 0: the original mockup's Create User form had a
// User/Administrator radio - that's wrong. The only two roles an Admin
// can create here are Admin and Accountant (a Contact is never created
// through this form). Mirrors backend/src/validators/users.validator.ts.
export const staffRoles = ["ADMIN", "ACCOUNTANT"] as const;
export type StaffRoleOption = (typeof staffRoles)[number];

export const createUserFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    loginId: z
      .string()
      .min(6, "Login Id must be between 6 and 12 characters")
      .max(12, "Login Id must be between 6 and 12 characters"),
    email: z.string().email("Enter a valid email address"),
    role: z.enum(staffRoles, { message: "Select a role" }),
    password: passwordComplexity,
    confirmPassword: z.string().min(1, "Please re-enter the password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;
 
export const updateUserFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email address"),
    role: z.enum(staffRoles, { message: "Select a role" }),
    isActive: z.boolean(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (values) => {
      if (values.password && values.password.length > 0) {
        return values.password.length >= 8;
      }
      return true;
    },
    {
      message: "Password must be at least 8 characters",
      path: ["password"],
    }
  )
  .refine(
    (values) => {
      if (values.password && values.password.length > 0) {
        return values.password === values.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;
