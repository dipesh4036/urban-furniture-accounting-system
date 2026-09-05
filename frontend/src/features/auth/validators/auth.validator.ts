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
// uppercase letter, and one special character. Exported so
// users.validator.ts can reuse it for the Create User form's password
// field, same as the backend does.
export const passwordComplexity = z
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
