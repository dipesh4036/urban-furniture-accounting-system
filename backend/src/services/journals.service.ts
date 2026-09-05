import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import type { CreateJournalInput } from "../validators/journals.validator";

// Creates a Journal, but first checks that defaultAccountId actually
// points at a real Account - without this check, a typo'd id would
// silently fail with a raw Prisma foreign-key error instead of a clean,
// understandable 404.
export async function createJournal(input: CreateJournalInput) {
  const account = await prisma.account.findUnique({
    where: { id: input.defaultAccountId },
    select: { id: true },
  });
  if (!account) {
    throw new AppError(404, "Default account not found", "ACCOUNT_NOT_FOUND");
  }

  return prisma.journal.create({ data: input });
}

interface ListJournalsOptions {
  search?: string;
  page?: number;
  limit?: number;
}

// Same pagination shape as accounts.service.ts's listAccounts - capped
// at 100 per page per backend-express SKILL.md. `search` matches on name only.
export async function listJournals(options: ListJournalsOptions) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;

  const where = options.search ? { name: { contains: options.search } } : {};

  const [journals, total] = await prisma.$transaction([
    prisma.journal.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.journal.count({ where }),
  ]);

  return {
    journals,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
