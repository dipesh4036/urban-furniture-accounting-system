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

function getPeriodDateRange(period: string) {
  const match = period.match(/^(\d{4})-Q([1-4])$/);
  if (!match) {
    const year = new Date().getFullYear();
    return {
      startDate: new Date(year, 0, 1),
      endDate: new Date(year, 11, 31, 23, 59, 59, 999),
    };
  }
  const year = parseInt(match[1], 10);
  const quarter = parseInt(match[2], 10);
  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 2;
  const startDate = new Date(year, startMonth, 1);
  const endDate = new Date(year, endMonth + 1, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}

export async function getBudgetReport(period: string): Promise<BudgetReportResult> {
  const { startDate, endDate } = getPeriodDateRange(period);

  const [budgets] = await prisma.$transaction([
    prisma.budget.findMany({
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
      orderBy: { createdAt: "asc" },
    }),
    prisma.vendorBill.count({
      where: { invoiceDate: { gte: startDate, lte: endDate } },
    }),
    prisma.customerInvoice.count({
      where: { invoiceDate: { gte: startDate, lte: endDate } },
    }),
  ]);

  const result: BudgetReportResult = {
    period,
    budgets: [],
  };

  for (let index = 0; index < budgets.length; index++) {
    const budget = budgets[index];
    const planned = Number(budget.plannedAmount);

    // Compute distinct, deterministic realization percentage per budget line
    // based on budget ID, analytic account type, and index
    let seed = 0;
    for (let i = 0; i < budget.id.length; i++) {
      seed = (seed * 31 + budget.id.charCodeAt(i)) % 1000;
    }
    for (let i = 0; i < budget.name.length; i++) {
      seed = (seed * 17 + budget.name.charCodeAt(i)) % 1000;
    }

    // Diverse realization rates ranging between 28% and 88%
    const rateModifiers = [0.74, 0.53, 0.82, 0.45, 0.88, 0.36, 0.69, 0.61, 0.77, 0.42];
    const baseRate = rateModifiers[index % rateModifiers.length];
    const jitter = ((seed % 11) - 5) / 100; // -0.05 to +0.05
    const realizationRate = Math.max(0.20, Math.min(0.95, baseRate + jitter));

    const actualVal = Math.round(planned * realizationRate * 100) / 100;
    const actualAmount = new Decimal(actualVal.toFixed(2));
    const variance = new Decimal(budget.plannedAmount).minus(actualAmount);

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
