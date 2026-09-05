"use client";

import { Download } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { RequiredMark } from "@/components/common/RequiredMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProfitLoss } from "@/features/reports/hooks/useReports";
import type { ProfitLossAccount, ProfitLossReport } from "@/features/reports/services/reports.service";
import { addCertificationBlock, addReportTable, createReportDoc, finalizeReportDoc } from "@/features/reports/utils/reportPdf";

function firstOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatAmount(value: string): string {
  return Number(value).toFixed(2);
}

async function downloadProfitLossPdf(from: string, to: string, data: ProfitLossReport) {
  const isProfitable = Number(data.netProfit) >= 0;
  const marginPercent = Number(data.totalIncome) > 0
    ? ((Number(data.netProfit) / Number(data.totalIncome)) * 100).toFixed(1)
    : "0.0";
  const expenseRatio = Number(data.totalIncome) > 0
    ? ((Number(data.totalExpenses) / Number(data.totalIncome)) * 100).toFixed(1)
    : "0.0";

  const doc = await createReportDoc(
    "Profit & Loss Statement",
    `Reporting Period: ${from} to ${to} • Accrual Accounting Basis • General Ledger Verified`,
    {
      kpiCards: [
        {
          label: "Total Operating Revenue",
          value: `$${formatAmount(data.totalIncome)}`,
          subtext: `${data.income.length} Income Streams`,
          variant: "default",
        },
        {
          label: "Total Operating Expenses",
          value: `$${formatAmount(data.totalExpenses)}`,
          subtext: `${expenseRatio}% Expense Ratio`,
          variant: "warning",
        },
        {
          label: "Net Operating Profit",
          value: `${isProfitable ? "+" : ""}$${formatAmount(data.netProfit)}`,
          subtext: `${marginPercent}% Net Profit Margin`,
          variant: isProfitable ? "success" : "danger",
        },
        {
          label: "Operating Performance",
          value: isProfitable ? "Profitable" : "Operating Loss",
          subtext: isProfitable ? "Net Positive Return" : "Expenditures Exceed Income",
          variant: isProfitable ? "success" : "danger",
        },
      ],
    }
  );

  let y = 74;

  // 1. Operating Revenue Table
  y = addReportTable(
    doc,
    y,
    ["Revenue Stream / Account", "Category", "Account ID", "Amount (USD)"],
    [
      ...data.income.map((a) => [a.accountName, "Operating Revenue", a.accountId.slice(-8).toUpperCase(), `$${formatAmount(a.amount)}`]),
      ["TOTAL OPERATING REVENUE", "", "", `$${formatAmount(data.totalIncome)}`],
    ],
    {
      sectionTitle: "Revenue & Operating Income",
      sectionSubtitle: "Sales Invoices, Client Consulting & Assembly Receipts",
      highlightTotalRow: true,
      columnAlignments: ["left", "left", "center", "right"],
    }
  );

  // 2. Operating Expenses Table
  y = addReportTable(
    doc,
    y + 6,
    ["Expense Account", "Classification", "Account ID", "Amount (USD)"],
    [
      ...data.expenses.map((a) => [a.accountName, "Operations & Overhead", a.accountId.slice(-8).toUpperCase(), `$${formatAmount(a.amount)}`]),
      ["TOTAL OPERATING EXPENSES", "", "", `$${formatAmount(data.totalExpenses)}`],
    ],
    {
      sectionTitle: "Operating & Overhead Expenses",
      sectionSubtitle: "COGS, Facility Rent, Payroll & Utility Disbursals",
      highlightTotalRow: true,
      columnAlignments: ["left", "left", "center", "right"],
    }
  );

  // 3. Financial Performance Summary Table
  y = addReportTable(
    doc,
    y + 6,
    ["Performance Breakdown", "Financial Calculation", "Total (USD)"],
    [
      ["Gross Operating Income", "Total Earned Revenue", `$${formatAmount(data.totalIncome)}`],
      ["Less: Direct & Operating Expenses", "Cost of Sales, Salaries & Facilities", `($${formatAmount(data.totalExpenses)})`],
      ["NET OPERATING PROFIT / (LOSS)", "Income minus Operating Expenses", `$${formatAmount(data.netProfit)}`],
    ],
    {
      sectionTitle: "Net Earnings Summary",
      sectionSubtitle: "Bottom-Line Operating Performance",
      highlightTotalRow: true,
      columnAlignments: ["left", "left", "right"],
    }
  );

  // Certification & Sign-off Block
  addCertificationBlock(doc, y);

  // Stamp running footers & save
  finalizeReportDoc(doc, `profit-loss-${from}-to-${to}.pdf`);
}

function Section({ title, accounts, total }: { title: string; accounts: ProfitLossAccount[]; total: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-sm text-muted-foreground">
                No {title.toLowerCase()} in this range.
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((account) => (
              <TableRow key={account.accountId}>
                <TableCell>{account.accountName}</TableCell>
                <TableCell className="text-right">{formatAmount(account.amount)}</TableCell>
              </TableRow>
            ))
          )}
          <TableRow>
            <TableCell className="font-medium">Total {title}</TableCell>
            <TableCell className="text-right font-medium">{formatAmount(total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

export function ProfitLossView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Reading straight from the URL (falling back to this month) is what
  // makes this page shareable and back-button-safe.
  const from = searchParams.get("from") ?? firstOfMonth();
  const to = searchParams.get("to") ?? today();

  const { data, isLoading, isError, refetch } = useProfitLoss(from, to);

  function handleRangeChange(field: "from" | "to", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", field === "from" ? value : from);
    params.set("to", field === "to" ? value : to);
    router.replace(`?${params.toString()}`);
  }

  const isProfit = data ? Number(data.netProfit) >= 0 : true;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profit &amp; Loss</h1>
          <p className="text-sm text-muted-foreground">Income and expenses over a date range.</p>
        </div>

        {data && (
          <Button variant="outline" onClick={() => downloadProfitLossPdf(from, to, data)}>
            <Download className="size-4" />
            Download PDF
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:w-96">
        <div className="flex flex-col gap-2">
          <Label htmlFor="from">
            From
            <RequiredMark />
          </Label>
          <Input id="from" type="date" value={from} onChange={(e) => handleRangeChange("from", e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="to">
            To
            <RequiredMark />
          </Label>
          <Input id="to" type="date" value={to} onChange={(e) => handleRangeChange("to", e.target.value)} />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load the profit &amp; loss report. Please try again.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.income.length === 0 && data.expenses.length === 0 && (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No income or expenses in this range yet.
        </p>
      )}

      {!isLoading && !isError && data && (data.income.length > 0 || data.expenses.length > 0) && (
        <div className="flex flex-col gap-8">
          <Section title="Income" accounts={data.income} total={data.totalIncome} />
          <Section title="Expenses" accounts={data.expenses} total={data.totalExpenses} />

          <div className="flex justify-between gap-8 self-end rounded-lg border p-4 text-sm">
            <span className="font-semibold">Net Profit</span>
            <span className={`font-semibold ${isProfit ? "text-success" : "text-destructive"}`}>
              {formatAmount(data.netProfit)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
