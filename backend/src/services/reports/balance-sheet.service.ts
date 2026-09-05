import { prisma } from "../../config/db";
import { Decimal } from "@prisma/client/runtime/library";

export interface BalanceSheetAccount {
  accountId: string;
  accountName: string;
  balance: Decimal;
}

export interface BalanceSheetReport {
  assets: BalanceSheetAccount[];
  liabilities: BalanceSheetAccount[];
  capital: BalanceSheetAccount[];
  expenses: BalanceSheetAccount[];
  income: BalanceSheetAccount[];
  totalAssets: Decimal;
  totalLiabilitiesAndCapital: Decimal;
}

export async function getBalanceSheet(asOf: Date): Promise<BalanceSheetReport> {
  const balances = await prisma.journalItem.groupBy({
    by: ["accountId"],
    where: {
      journalEntry: {
        date: { lte: asOf },
      },
    },
    _sum: {
      debit: true,
      credit: true,
    },
  });

  const accountIds = balances.map((b) => b.accountId);
  const accounts = await prisma.account.findMany({
    where: { id: { in: accountIds } },
  });

  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const result: BalanceSheetReport = {
    assets: [],
    liabilities: [],
    capital: [],
    expenses: [],
    income: [],
    totalAssets: new Decimal(0),
    totalLiabilitiesAndCapital: new Decimal(0),
  };

  for (const balance of balances) {
    const account = accountMap.get(balance.accountId);
    if (!account) continue;

    const debit = balance._sum.debit || new Decimal(0);
    const credit = balance._sum.credit || new Decimal(0);

    let netBalance: Decimal;
    if (account.type === "ASSET" || account.type === "EXPENSE") {
      netBalance = new Decimal(debit).minus(credit);
    } else {
      netBalance = new Decimal(credit).minus(debit);
    }

    const accountData: BalanceSheetAccount = {
      accountId: account.id,
      accountName: account.name,
      balance: netBalance,
    };

    switch (account.type) {
      case "ASSET":
        result.assets.push(accountData);
        result.totalAssets = result.totalAssets.plus(netBalance);
        break;
      case "LIABILITY":
        result.liabilities.push(accountData);
        result.totalLiabilitiesAndCapital = result.totalLiabilitiesAndCapital.plus(netBalance);
        break;
      case "CAPITAL":
        result.capital.push(accountData);
        result.totalLiabilitiesAndCapital = result.totalLiabilitiesAndCapital.plus(netBalance);
        break;
      case "EXPENSE":
        result.expenses.push(accountData);
        break;
      case "INCOME":
        result.income.push(accountData);
        break;
    }
  }

  return result;
}
