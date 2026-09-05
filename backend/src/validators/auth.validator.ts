import { z } from "zod";

export const loginSchema = z.object({
  loginId: z.string().min(1, "Login Id is required"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Password rule from plan.md Module 0: at least 8 characters, with at
// least one lowercase letter, one uppercase letter, and one special
// character (not a letter/number).
const passwordComplexity = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: passwordComplexity,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// A Contact logs in with their email (not a Login Id, unlike staff).
export const contactLoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type ContactLoginInput = z.infer<typeof contactLoginSchema>;
