import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import type { CreateJournalEntryInput } from "../validators/journal-entries.validator";

// Writes the JournalEntry and every JournalItem line together, inside
// one transaction - either the whole entry (all lines included) is
// saved, or none of it is. Checks the Journal and every Account exist
// first, same reasoning as journals.service.ts's createJournal: a clean
// 404 instead of a raw Prisma foreign-key error.
export async function createJournalEntry(input: CreateJournalEntryInput) {
  const journal = await prisma.journal.findUnique({ where: { id: input.journalId }, select: { id: true } });
  if (!journal) {
    throw new AppError(404, "Journal not found", "JOURNAL_NOT_FOUND");
  }

  const accountIds = [...new Set(input.items.map((item) => item.accountId))];
  const foundAccounts = await prisma.account.findMany({
    where: { id: { in: accountIds } },
    select: { id: true },
  });
  if (foundAccounts.length !== accountIds.length) {
    throw new AppError(404, "One or more accounts were not found", "ACCOUNT_NOT_FOUND");
  }

  return prisma.$transaction(async (tx) => {
    const entry = await tx.journalEntry.create({
      data: {
        journalId: input.journalId,
        date: input.date,
        reference: input.reference,
      },
    });

    await tx.journalItem.createMany({
      data: input.items.map((item) => ({
        journalEntryId: entry.id,
        accountId: item.accountId,
        debit: item.debit,
        credit: item.credit,
      })),
    });

    return tx.journalEntry.findUniqueOrThrow({
      where: { id: entry.id },
      include: { items: true },
    });
  });
}

interface ListJournalEntriesOptions {
  journalId?: string;
  search?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

// Same pagination shape as journals.service.ts's listJournals - capped
// at 100 per page per backend-express SKILL.md. `search` matches on
// reference only.
export async function listJournalEntries(options: ListJournalEntriesOptions) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;

  const where: Prisma.JournalEntryWhereInput = {};
  if (options.journalId) {
    where.journalId = options.journalId;
  }
  if (options.search) {
    where.reference = { contains: options.search };
  }
  if (options.from || options.to) {
    where.date = {
      ...(options.from && { gte: options.from }),
      ...(options.to && { lte: options.to }),
    };
  }

  const [entries, total] = await prisma.$transaction([
    prisma.journalEntry.findMany({
      where,
      include: { items: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: "desc" },
    }),
    prisma.journalEntry.count({ where }),
  ]);

  return {
    entries,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getJournalEntryById(id: string) {
  const entry = await prisma.journalEntry.findUnique({ where: { id }, include: { items: true } });
  if (!entry) {
    throw new AppError(404, "Journal entry not found", "JOURNAL_ENTRY_NOT_FOUND");
  }
  return entry;
}
