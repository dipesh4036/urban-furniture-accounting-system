import { z } from "zod";

const contactTypeSchema = z.enum(["CUSTOMER", "VENDOR", "BOTH"]);

// A profile image is a path returned by POST /uploads (e.g.
// "/uploads/<name>.jpg"), a full URL, or (kept for backwards
// compatibility) a base64 data URI. Anything else is rejected.
const profileImageSchema = z
  .string()
  .refine(
    (value) =>
      value.startsWith("/uploads/") || value.startsWith("data:image/") || z.string().url().safeParse(value).success,
    "Profile image must be a valid URL or uploaded file path"
  );

// Simple phone number check: 10-15 digits, optional leading +. Good
// enough to catch typos without being overly strict about formatting
// (spaces, dashes, country code style all vary by country).
const mobileSchema = z.string().regex(/^\+?[0-9]{10,15}$/, "Enter a valid mobile number");

export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: contactTypeSchema,
  email: z.string().email("Enter a valid email address"),
  mobile: mobileSchema,
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  profileImage: profileImageSchema.optional(),
});
export type CreateContactInput = z.infer<typeof createContactSchema>;

export const updateContactSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  type: contactTypeSchema.optional(),
  email: z.string().email("Enter a valid email address").optional(),
  mobile: mobileSchema.optional(),
  city: z.string().min(1, "City is required").optional(),
  state: z.string().min(1, "State is required").optional(),
  pincode: z.string().min(1, "Pincode is required").optional(),
  profileImage: profileImageSchema.optional(),
  isActive: z.boolean().optional(),
});
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

// For GET /contacts?type=&page=&limit= - query params always arrive as
// strings, so page/limit get coerced to numbers here (same pattern as
// accounts.validator.ts's listAccountsQuerySchema).
export const listContactsQuerySchema = z.object({
  type: contactTypeSchema.optional(),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "INACTIVE", "PENDING_ACTIVATION"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type ListContactsQuery = z.infer<typeof listContactsQuerySchema>;
