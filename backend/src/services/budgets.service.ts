import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import type { CreateBudgetInput } from "../validators/budgets.validator";

// Never return passwordHash to a client - same principle as
// users.service.ts's safeUserSelect.
const safeResponsiblePersonSelect = {
  id: true,
  name: true,
  loginId: true,
  email: true,
  role: true,
} as const;

// responsiblePersonId must point at a staff User (Admin or Accountant),
// never a Contact - Contact and User are separate tables, so looking it
// up in prisma.user already rules out a Contact id being passed in; the
// role check on top of that rules out some hypothetical non-staff User
// role being added later.
export async function createBudget(input: CreateBudgetInput) {
  const analyticAccount = await prisma.analyticAccount.findUnique({
    where: { id: input.analyticAccountId },
    select: { id: true },
  });
  if (!analyticAccount) {
    throw new AppError(404, "Analytic account not found", "ANALYTIC_ACCOUNT_NOT_FOUND");
  }

  const responsiblePerson = await prisma.user.findUnique({
    where: { id: input.responsiblePersonId },
    select: { id: true, role: true },
  });
  if (!responsiblePerson) {
    throw new AppError(404, "Responsible person not found", "RESPONSIBLE_PERSON_NOT_FOUND");
  }
  if (responsiblePerson.role !== "ADMIN" && responsiblePerson.role !== "ACCOUNTANT") {
    throw new AppError(
      422,
      "Responsible person must be a staff user with role ADMIN or ACCOUNTANT",
      "INVALID_RESPONSIBLE_PERSON_ROLE"
    );
  }

  return prisma.budget.create({
    data: {
      name: input.name,
      period: input.period,
      plannedAmount: new Prisma.Decimal(input.plannedAmount),
      analyticAccountId: input.analyticAccountId,
      responsiblePersonId: input.responsiblePersonId,
    },
    include: {
      analyticAccount: true,
      responsiblePerson: { select: safeResponsiblePersonSelect },
    },
  });
}

interface ListBudgetsOptions {
  page?: number;
  limit?: number;
}

// Same pagination shape as journals.service.ts's listJournals - capped
// at 100 per page per backend-express SKILL.md.
export async function listBudgets(options: ListBudgetsOptions) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 20;

  const [budgets, total] = await prisma.$transaction([
    prisma.budget.findMany({
      include: {
        analyticAccount: true,
        responsiblePerson: { select: safeResponsiblePersonSelect },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.budget.count(),
  ]);

  return {
    budgets,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
