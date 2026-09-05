import { prisma } from "../../config/db";
import { Decimal } from "@prisma/client/runtime/library";

export interface ProfitLossAccount {
  accountId: string;
  accountName: string;
  amount: Decimal;
}

export interface ProfitLossReport {
  income: ProfitLossAccount[];
  expenses: ProfitLossAccount[];
  totalIncome: Decimal;
  totalExpenses: Decimal;
  netProfit: Decimal;
}

export async function getProfitLoss(from: Date, to: Date): Promise<ProfitLossReport> {
  const balances = await prisma.journalItem.groupBy({
    by: ["accountId"],
    where: {
      journalEntry: {
        date: {
          gte: from,
          lte: to,
        },
      },
    },
    _sum: {
      debit: true,
      credit: true,
    },
  });

  const accountIds = balances.map((b) => b.accountId);
  const accounts = await prisma.account.findMany({
    where: {
      id: { in: accountIds },
      type: { in: ["INCOME", "EXPENSE"] },
    },
  });

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const result: ProfitLossReport = {
    income: [],
    expenses: [],
    totalIncome: new Decimal(0),
    totalExpenses: new Decimal(0),
    netProfit: new Decimal(0),
  };

  for (const balance of balances) {
    const account = accountMap.get(balance.accountId);
    if (!account) continue;

    const debit = balance._sum.debit || new Decimal(0);
    const credit = balance._sum.credit || new Decimal(0);

    let amount: Decimal;
    if (account.type === "INCOME") {
      amount = new Decimal(credit).minus(debit);
      result.income.push({
        accountId: account.id,
        accountName: account.name,
        amount,
      });
      result.totalIncome = result.totalIncome.plus(amount);
    } else if (account.type === "EXPENSE") {
      amount = new Decimal(debit).minus(credit);
      result.expenses.push({
        accountId: account.id,
        accountName: account.name,
        amount,
      });
      result.totalExpenses = result.totalExpenses.plus(amount);
    }
  }

  result.netProfit = result.totalIncome.minus(result.totalExpenses);
  return result;
}
