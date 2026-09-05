import { z } from "zod";

// Mirrors backend/src/validators/contacts.validator.ts.
export const contactTypes = ["CUSTOMER", "VENDOR", "BOTH"] as const;
export type ContactTypeOption = (typeof contactTypes)[number];

// Same mobile check as the backend: 10-15 digits, optional leading +.
const mobileSchema = z.string().regex(/^\+?[0-9]{10,15}$/, "Enter a valid mobile number");

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(contactTypes, { message: "Select a type" }),
  email: z.string().email("Enter a valid email address"),
  mobile: mobileSchema,
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  // Filled in from a file input, converted to a base64 data URI before
  // the form ever sees it - see ContactFormDialog's file change handler.
  profileImage: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
