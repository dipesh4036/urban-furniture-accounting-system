import { prisma } from "../../config/db";
import { Decimal } from "@prisma/client/runtime/library";

export interface BudgetReportLine {
  budgetId: string;
  budgetName: string;
  analyticAccountName: string;
  analyticAccountType: string;
  responsiblePerson: {
    id: string;
    name: string;
    loginId: string;
  };
  plannedAmount: Decimal;
  actualAmount: Decimal | null;
  variance: Decimal | null;
}

export interface BudgetReportResult {
  period: string;
  budgets: BudgetReportLine[];
}

export async function getBudgetReport(period: string): Promise<BudgetReportResult> {
  const budgets = await prisma.budget.findMany({
    where: { period },
    include: {
      analyticAccount: true,
      responsiblePerson: {
        select: {
          id: true,
          name: true,
          loginId: true,
        },
      },
    },
  });

  const result: BudgetReportResult = {
    period,
    budgets: [],
  };

  for (const budget of budgets) {
    let actualAmount: Decimal | null = null;

    // Note: Analytic account linkage on JournalItem is a known MVP gap.
    // When JournalItem.analyticAccountId is added, query actual amounts like this:
    // const journalItems = await prisma.journalItem.groupBy({
    //   by: ["analyticAccountId"],
    //   where: { analyticAccountId: budget.analyticAccountId },
    //   _sum: { debit: true, credit: true },
    // });
    // Then compute based on AnalyticType (INCOME vs EXPENSE).
    // For now, actualAmount remains null.

    const variance = actualAmount !== null ? new Decimal(budget.plannedAmount).minus(actualAmount) : null;

    result.budgets.push({
      budgetId: budget.id,
      budgetName: budget.name,
      analyticAccountName: budget.analyticAccount.name,
      analyticAccountType: budget.analyticAccount.type,
      responsiblePerson: budget.responsiblePerson,
      plannedAmount: budget.plannedAmount,
      actualAmount,
      variance,
    });
  }

  return result;
}
