import { api } from "@/lib/api";

// Matches the Contact model in plan.md Module 6. Never includes
// passwordHash/activationToken/resetToken - the backend's safeContactSelect
// already leaves those out of every response.
export type ContactType = "CUSTOMER" | "VENDOR" | "BOTH";

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  email: string;
  mobile: string;
  city: string;
  state: string;
  pincode: string;
  profileImage: string | null;
  isActivated: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// List endpoints are paginated by default (backend-express SKILL.md).
// Field is `contacts`, not `items` - matches
// backend/src/controllers/contacts.controller.ts's `data: { contacts, meta }`.
export interface ContactListResult {
  contacts: Contact[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListContactsParams {
  type?: ContactType;
  page?: number;
  limit?: number;
}

export interface CreateContactInput {
  name: string;
  type: ContactType;
  email: string;
  mobile: string;
  city: string;
  state: string;
  pincode: string;
  // A URL or a base64 data URI (e.g. from a file input) - see
  // backend/src/validators/contacts.validator.ts's profileImageSchema.
  profileImage?: string;
}

export interface UpdateContactInput {
  name?: string;
  type?: ContactType;
  email?: string;
  mobile?: string;
  city?: string;
  state?: string;
  pincode?: string;
  profileImage?: string;
  isActive?: boolean;
}

// Calls GET /contacts (plan.md Module 6).
export function listContacts(params?: ListContactsParams): Promise<ContactListResult> {
  return api.get("/contacts", { params });
}

// Calls GET /contacts/:id.
export function getContactById(id: string): Promise<{ contact: Contact }> {
  return api.get(`/contacts/${id}`);
}

// Calls POST /contacts. Creating a Contact triggers the backend to email
// them an activation link - see contacts.service.ts's createContact.
export function createContact(input: CreateContactInput): Promise<{ contact: Contact }> {
  return api.post("/contacts", input);
}

// Calls PATCH /contacts/:id. Used for both editing fields and archiving
// (archiving is just sending { isActive: false }).
export function updateContact(id: string, input: UpdateContactInput): Promise<{ contact: Contact }> {
  return api.patch(`/contacts/${id}`, input);
}

// Calls POST /contacts/:id/resend-activation to resend the activation email.
export function resendActivationEmail(id: string): Promise<void> {
  return api.post(`/contacts/${id}/resend-activation`);
}
