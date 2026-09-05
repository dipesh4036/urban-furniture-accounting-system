import { api } from "@/lib/api";

// Every amount is a string because the backend serializes Prisma
// Decimal values as strings over JSON.

export interface BalanceSheetAccount {
  accountId: string;
  accountName: string;
  balance: string;
}

// Matches backend/src/services/reports/balance-sheet.service.ts's
// BalanceSheetReport. The whole report is the `data` object directly -
// not wrapped in a `{ report }` key like most other endpoints.
export interface BalanceSheetReport {
  assets: BalanceSheetAccount[];
  liabilities: BalanceSheetAccount[];
  capital: BalanceSheetAccount[];
  expenses: BalanceSheetAccount[];
  income: BalanceSheetAccount[];
  totalAssets: string;
  totalLiabilitiesAndCapital: string;
}

export interface ProfitLossAccount {
  accountId: string;
  accountName: string;
  amount: string;
}

// Matches backend/src/services/reports/profit-loss.service.ts's
// ProfitLossReport.
export interface ProfitLossReport {
  income: ProfitLossAccount[];
  expenses: ProfitLossAccount[];
  totalIncome: string;
  totalExpenses: string;
  netProfit: string;
}

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
  plannedAmount: string;
  // Both stay null until JournalItem gets an analyticAccountId link -
  // see budget-report.service.ts's comment. Render "-" for null, not 0.
  actualAmount: string | null;
  variance: string | null;
}

// Matches backend/src/services/reports/budget-report.service.ts's
// BudgetReportResult.
export interface BudgetReportResult {
  period: string;
  budgets: BudgetReportLine[];
}

// Calls GET /reports/balance-sheet?asOf= (plan.md Module 13).
export function getBalanceSheet(asOf: string): Promise<BalanceSheetReport> {
  return api.get("/reports/balance-sheet", { params: { asOf } });
}

// Calls GET /reports/profit-loss?from=&to=.
export function getProfitLoss(from: string, to: string): Promise<ProfitLossReport> {
  return api.get("/reports/profit-loss", { params: { from, to } });
}

// Calls GET /reports/budget-report?period=.
export function getBudgetReport(period: string): Promise<BudgetReportResult> {
  return api.get("/reports/budget-report", { params: { period } });
}
