import crypto from "crypto";
import type { ContactType } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import { sendActivationEmail } from "./email.service";
import type { CreateContactInput, UpdateContactInput } from "../validators/contacts.validator";

// Longer than the 1-hour password-reset token (auth.service.ts) because
// this is an invite, not a security-sensitive reset - the Contact might
// not check their email right away.
const ACTIVATION_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Creates the Contact, then emails them an activation link so they can
// set their own password later (see plan.md Module 6). If the email
// fails to send, sendActivationEmail just logs it and returns false -
// it never throws - so the Contact record we already created stays
// created either way. An Admin can always resend/regenerate the link
// later if needed.
export async function createContact(input: CreateContactInput) {
  const activationToken = crypto.randomBytes(32).toString("hex");
  const activationTokenExpiresAt = new Date(Date.now() + ACTIVATION_TOKEN_EXPIRY_MS);

  const contact = await prisma.contact.create({
    data: { ...input, activationToken, activationTokenExpiresAt },
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
  page?: number;
  limit?: number;
}

// Same pagination shape as accounts.service.ts's listAccounts - capped
// at 100 per page per backend-express SKILL.md.
export async function listContacts(options: ListContactsOptions) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;

  const where = options.type ? { type: options.type } : {};

  const [contacts, total] = await prisma.$transaction([
    prisma.contact.findMany({
      where,
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
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) {
    throw new AppError(404, "Contact not found", "CONTACT_NOT_FOUND");
  }
  return contact;
}

export async function updateContact(id: string, input: UpdateContactInput) {
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) {
    throw new AppError(404, "Contact not found", "CONTACT_NOT_FOUND");
  }

  return prisma.contact.update({ where: { id }, data: input });
}

// "Archiving" a Contact just flips isActive to false - same reasoning as
// archiveAccount: past transactions may already reference this Contact,
// so we never delete the row itself.
export async function archiveContact(id: string) {
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) {
    throw new AppError(404, "Contact not found", "CONTACT_NOT_FOUND");
  }

  return prisma.contact.update({ where: { id }, data: { isActive: false } });
}
