import { z } from "zod";

// This mirrors backend/src/validators/auth.validator.ts's loginSchema
// (see plan.md Module 3). Login just needs both fields filled in - the
// backend is the one that actually checks the password is correct.
export const loginSchema = z.object({
  loginId: z.string().min(1, "Login Id is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
