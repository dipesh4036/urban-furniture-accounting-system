import crypto from "crypto";
import type { ContactType } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import { sendActivationEmail } from "./email.service";
import type { CreateContactInput, UpdateContactInput } from "../validators/contacts.validator";

const ACTIVATION_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Every Contact object handed back to a controller (and from there, the
// client) goes through this select - it leaves out passwordHash,
// activationToken/activationTokenExpiresAt, and resetToken/
// resetTokenExpiresAt. Those are secrets that should only ever reach
// someone through the actual email link, never in an API response. Same
// principle auth.service.ts's SafeUser already follows for passwordHash.
const safeContactSelect = {
  id: true,
  name: true,
  type: true,
  email: true,
  mobile: true,
  city: true,
  state: true,
  pincode: true,
  profileImage: true,
  isActivated: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Creates the Contact, then emails them an activation link so they can
// set their own password later (see plan.md Module 6). If the email
// fails to send, sendActivationEmail just logs it and returns false -
// it never throws - so the Contact record we already created stays
// created either way. An Admin can always resend/regenerate the link
// later if needed.
export async function createContact(input: CreateContactInput) {
  const existingEmail = await prisma.contact.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existingEmail) {
    throw new AppError(409, "This email is already registered", "EMAIL_TAKEN");
  }

  const activationToken = crypto.randomBytes(32).toString("hex");
  const activationTokenExpiresAt = new Date(Date.now() + ACTIVATION_TOKEN_EXPIRY_MS);

  const contact = await prisma.contact.create({
    data: { ...input, activationToken, activationTokenExpiresAt },
    select: safeContactSelect,
  });

  const emailSent = await sendActivationEmail({
    email: contact.email,
    name: contact.name,
    activationToken,
  });
  if (!emailSent) {
    console.error(`Contact ${contact.id} created, but activation email failed to send`);
  }

  return contact;
}

interface ListContactsOptions {
  type?: ContactType;
  search?: string;
  status?: "ACTIVE" | "ARCHIVED" | "PENDING_ACTIVATION";
  page?: number;
  limit?: number;
}

// Same pagination shape as accounts.service.ts's listAccounts - capped
// at 100 per page per backend-express SKILL.md.
export async function listContacts(options: ListContactsOptions) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;

  const statusFilter =
    options.status === "ACTIVE"
      ? { isActive: true }
      : options.status === "ARCHIVED"
        ? { isActive: false }
        : options.status === "PENDING_ACTIVATION"
          ? { isActivated: false }
          : {};

  const where = {
    ...(options.type ? { type: options.type } : {}),
    ...statusFilter,
    ...(options.search
      ? {
          OR: [
            { name: { contains: options.search } },
            { email: { contains: options.search } },
            { mobile: { contains: options.search } },
            { city: { contains: options.search } },
            { state: { contains: options.search } },
            { pincode: { contains: options.search } },
          ],
        }
      : {}),
  };

  const [contacts, total] = await prisma.$transaction([
    prisma.contact.findMany({
      where,
      select: safeContactSelect,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.contact.count({ where }),
  ]);

  return {
    contacts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getContactById(id: string) {
  const contact = await prisma.contact.findUnique({ where: { id }, select: safeContactSelect });
  if (!contact) {
    throw new AppError(404, "Contact not found", "CONTACT_NOT_FOUND");
  }
  return contact;
}

export async function updateContact(id: string, input: UpdateContactInput) {
  const exists = await prisma.contact.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    throw new AppError(404, "Contact not found", "CONTACT_NOT_FOUND");
  }

  if (input.email) {
    const existingEmail = await prisma.contact.findFirst({
      where: { email: input.email, id: { not: id } },
      select: { id: true },
    });
    if (existingEmail) {
      throw new AppError(409, "This email is already registered", "EMAIL_TAKEN");
    }
  }

  return prisma.contact.update({ where: { id }, data: input, select: safeContactSelect });
}

// "Archiving" a Contact just flips isActive to false - same reasoning as
// archiveAccount: past transactions may already reference this Contact,
// so we never delete the row itself.
export async function archiveContact(id: string) {
  const exists = await prisma.contact.findUnique({ where: { id }, select: { id: true } });
  if (!exists) {
    throw new AppError(404, "Contact not found", "CONTACT_NOT_FOUND");
  }

  return prisma.contact.update({ where: { id }, data: { isActive: false }, select: safeContactSelect });
}

export async function resendActivationEmail(id: string) {
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) {
    throw new AppError(404, "Contact not found", "CONTACT_NOT_FOUND");
  }
  if (contact.isActivated) {
    throw new AppError(400, "This contact account has already been activated", "ALREADY_ACTIVATED");
  }

  const activationToken = crypto.randomBytes(32).toString("hex");
  const activationTokenExpiresAt = new Date(Date.now() + ACTIVATION_TOKEN_EXPIRY_MS);

  await prisma.contact.update({
    where: { id },
    data: { activationToken, activationTokenExpiresAt },
  });

  const emailSent = await sendActivationEmail({
    email: contact.email,
    name: contact.name,
    activationToken,
  });

  if (!emailSent) {
    throw new AppError(500, "Failed to send activation email. Please check server SMTP configuration.", "EMAIL_SEND_FAILED");
  }

  return { message: "Activation email sent successfully" };
}
