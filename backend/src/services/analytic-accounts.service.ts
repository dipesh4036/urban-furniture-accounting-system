import type { AnalyticType } from "@prisma/client";
import { prisma } from "../config/db";
import type { CreateAnalyticAccountInput } from "../validators/analytic-accounts.validator";

export async function createAnalyticAccount(input: CreateAnalyticAccountInput) {
  return prisma.analyticAccount.create({ data: input });
}

interface ListAnalyticAccountsOptions {
  search?: string;
  type?: AnalyticType;
  page?: number;
  limit?: number;
}

// Same pagination shape as journals.service.ts's listJournals - capped
// at 100 per page per backend-express SKILL.md. `search` matches on name only.
export async function listAnalyticAccounts(options: ListAnalyticAccountsOptions) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;

  const where = {
    ...(options.type ? { type: options.type } : {}),
    ...(options.search ? { name: { contains: options.search } } : {}),
  };

  const [analyticAccounts, total] = await prisma.$transaction([
    prisma.analyticAccount.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.analyticAccount.count({ where }),
  ]);

  return {
    analyticAccounts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
