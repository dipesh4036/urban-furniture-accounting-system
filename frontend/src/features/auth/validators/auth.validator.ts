import { z } from "zod";

// This mirrors backend/src/validators/auth.validator.ts's loginSchema
// (see plan.md Module 3). Login just needs both fields filled in - the
// backend is the one that actually checks the password is correct.
export const loginSchema = z.object({
  loginId: z.string().min(1, "Login Id is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// Same password rule as backend/src/validators/auth.validator.ts's
// passwordComplexity: at least 8 characters, one lowercase letter, one
// uppercase letter, and one special character.
const passwordComplexity = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

// The backend only needs {token, newPassword} - confirmPassword is a
// frontend-only field so the user can catch their own typo before
// submitting. It's checked here and never sent to the backend.
export const resetPasswordSchema = z
  .object({
    newPassword: passwordComplexity,
    confirmPassword: z.string().min(1, "Please re-enter your password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// Contact (Customer/Vendor) login - separate from staff login, uses
// email instead of a Login Id. Mirrors backend's contactLoginSchema.
export const contactLoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type ContactLoginFormValues = z.infer<typeof contactLoginSchema>;

// Same shape as resetPasswordSchema (password + confirm, same complexity
// rule) - a Contact activating their account for the first time from the
// email link is really just "set your password from a token", the same
// flow as a password reset (backend reuses resetPasswordSchema for both).
// See plan.md Module 0's [FIX]: no Login Id/Email fields here, those come
// from the invitation token itself.
export const activateAccountSchema = z
  .object({
    newPassword: passwordComplexity,
    confirmPassword: z.string().min(1, "Please re-enter your password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ActivateAccountFormValues = z.infer<typeof activateAccountSchema>;
