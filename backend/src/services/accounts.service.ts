import type { AccountType } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import type { CreateAccountInput, UpdateAccountInput } from "../validators/accounts.validator";

export async function createAccount(input: CreateAccountInput) {
  return prisma.account.create({ data: input });
}

interface ListAccountsOptions {
  type?: AccountType;
  search?: string;
  status?: "ACTIVE" | "ARCHIVED";
  page?: number;
  limit?: number;
}

// Returns a page of accounts plus the pagination info the frontend needs
// to render "page 2 of 5" style controls. Caps `limit` at 100 so nobody
// can ask for the whole table in one request, per backend-express
// SKILL.md's pagination rules. `search` matches on name only.
export async function listAccounts(options: ListAccountsOptions) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;

  const where = {
    ...(options.type ? { type: options.type } : {}),
    ...(options.status === "ACTIVE" ? { isActive: true } : {}),
    ...(options.status === "ARCHIVED" ? { isActive: false } : {}),
    ...(options.search ? { name: { contains: options.search } } : {}),
  };

  const [accounts, total] = await prisma.$transaction([
    prisma.account.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.account.count({ where }),
  ]);

  return {
    accounts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateAccount(id: string, input: UpdateAccountInput) {
  const account = await prisma.account.findUnique({ where: { id } });
  if (!account) {
    throw new AppError(404, "Account not found", "ACCOUNT_NOT_FOUND");
  }

  return prisma.account.update({ where: { id }, data: input });
}

// "Archiving" an account just flips isActive to false - we never delete
// a Chart of Accounts entry, because journal entries may already
// reference it, and deleting it would break that financial history.
export async function archiveAccount(id: string) {
  const account = await prisma.account.findUnique({ where: { id } });
  if (!account) {
    throw new AppError(404, "Account not found", "ACCOUNT_NOT_FOUND");
  }

  return prisma.account.update({ where: { id }, data: { isActive: false } });
}
