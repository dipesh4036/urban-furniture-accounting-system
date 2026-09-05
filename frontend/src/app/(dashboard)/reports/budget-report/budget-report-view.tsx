"use client";

import { Download } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { RequiredMark } from "@/components/common/RequiredMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBudgetReport } from "@/features/reports/hooks/useReports";
import type { BudgetReportResult } from "@/features/reports/services/reports.service";
import { addCertificationBlock, addReportTable, createReportDoc, finalizeReportDoc } from "@/features/reports/utils/reportPdf";

// "-" for null, not "0.00" - a null actual/variance means it genuinely
// hasn't been computed yet (no analytic linkage on JournalItem), which
// is a different thing than an actual zero.
function formatAmount(value: string | null): string {
  return value === null ? "-" : Number(value).toFixed(2);
}

function defaultPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-Q${Math.floor(now.getMonth() / 3) + 1}`;
}

async function downloadBudgetReportPdf(period: string, data: BudgetReportResult) {
  const totalPlanned = data.budgets.reduce(
    (sum, b) => sum + Number(b.plannedAmount),
    0
  );
  const expenseBudgets = data.budgets.filter((b) => b.analyticAccountType === "EXPENSE");
  const incomeBudgets = data.budgets.filter((b) => b.analyticAccountType === "INCOME");

  const doc = await createReportDoc(
    "Budget Performance Report",
    `Fiscal Period: ${period} • Departmental & Analytic Cost Center Allocations`,
    {
      kpiCards: [
        {
          label: "Total Budget Planned",
          value: `$${totalPlanned.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          subtext: `${data.budgets.length} Budget Targets`,
          variant: "default",
        },
        {
          label: "Expense Budgets",
          value: `${expenseBudgets.length} Centers`,
          subtext: `$${expenseBudgets.reduce((sum, b) => sum + Number(b.plannedAmount), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} Allocated`,
          variant: "warning",
        },
        {
          label: "Revenue Targets",
          value: `${incomeBudgets.length} Targets`,
          subtext: `$${incomeBudgets.reduce((sum, b) => sum + Number(b.plannedAmount), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })} Goal`,
          variant: "success",
        },
        {
          label: "Reporting Period",
          value: period,
          subtext: "Quarterly Fiscal Scope",
          variant: "default",
        },
      ],
    }
  );

  let y = 74;

  // 1. Detailed Departmental Budget Table
  y = addReportTable(
    doc,
    y,
    ["Budget Line", "Analytic Cost Center", "Category", "Responsible Manager", "Planned (USD)", "Actual (USD)", "Variance (USD)"],
    [
      ...data.budgets.map((b) => [
        b.budgetName,
        b.analyticAccountName,
        b.analyticAccountType,
        b.responsiblePerson.name,
        `$${formatAmount(b.plannedAmount)}`,
        b.actualAmount === null ? "-" : `$${formatAmount(b.actualAmount)}`,
        b.variance === null ? "-" : `$${formatAmount(b.variance)}`,
      ]),
      [
        "TOTAL PLANNED BUDGET",
        "",
        "",
        "",
        `$${totalPlanned.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        "-",
        "-",
      ],
    ],
    {
      sectionTitle: "Departmental Budget Allocations",
      sectionSubtitle: `Operational, Marketing, and Sales Financial Targets for ${period}`,
      highlightTotalRow: true,
      columnAlignments: ["left", "left", "center", "left", "right", "right", "right"],
    }
  );

  // 2. Departmental Distribution Summary Table
  y = addReportTable(
    doc,
    y + 6,
    ["Department Classification", "Allocated Centers", "Total Planned Allocation (USD)", "Budget Share"],
    [
      [
        "Operational & Expense Departments",
        `${expenseBudgets.length} Accounts`,
        `$${expenseBudgets.reduce((sum, b) => sum + Number(b.plannedAmount), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        totalPlanned > 0
          ? `${((expenseBudgets.reduce((sum, b) => sum + Number(b.plannedAmount), 0) / totalPlanned) * 100).toFixed(1)}%`
          : "0.0%",
      ],
      [
        "Revenue & Commercial Targets",
        `${incomeBudgets.length} Accounts`,
        `$${incomeBudgets.reduce((sum, b) => sum + Number(b.plannedAmount), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        totalPlanned > 0
          ? `${((incomeBudgets.reduce((sum, b) => sum + Number(b.plannedAmount), 0) / totalPlanned) * 100).toFixed(1)}%`
          : "0.0%",
      ],
      [
        "TOTAL CONSOLIDATED ALLOCATION",
        `${data.budgets.length} Cost Centers`,
        `$${totalPlanned.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        "100.0%",
      ],
    ],
    {
      sectionTitle: "Budget Allocation by Department Class",
      sectionSubtitle: "Consolidated Expense vs. Revenue Distribution",
      highlightTotalRow: true,
      columnAlignments: ["left", "center", "right", "right"],
    }
  );

  // Certification & Sign-off Block
  addCertificationBlock(doc, y);

  // Stamp running footers & save
  finalizeReportDoc(doc, `budget-report-${period}.pdf`);
}

export function BudgetReportView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Reading straight from the URL is what makes this page shareable and
  // back-button-safe - the period lives in the URL, not just component
  // state.
  const period = searchParams.get("period") ?? defaultPeriod();

  const { data, isLoading, isError, refetch } = useBudgetReport(period);

  function handlePeriodChange(event: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", event.target.value);
    router.replace(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budget Report</h1>
          <p className="text-sm text-muted-foreground">Planned vs actual spend per analytic account.</p>
        </div>

        {data && (
          <Button variant="outline" onClick={() => downloadBudgetReportPdf(period, data)}>
            <Download className="size-4" />
            Download PDF
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:w-64">
        <Label htmlFor="period">
          Period
          <RequiredMark />
        </Label>
        <Input id="period" placeholder="e.g. 2026-Q1" value={period} onChange={handlePeriodChange} />
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load the budget report. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.budgets.length === 0 && (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No budgets for this period yet.
        </p>
      )}

      {!isLoading && !isError && data && data.budgets.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Budget</TableHead>
              <TableHead>Analytic Account</TableHead>
              <TableHead>Responsible Person</TableHead>
              <TableHead className="text-right">Planned</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-right">Variance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.budgets.map((budget) => (
              <TableRow key={budget.budgetId}>
                <TableCell className="font-medium">{budget.budgetName}</TableCell>
                <TableCell>
                  {budget.analyticAccountName}{" "}
                  <Badge variant="outline" className="ml-1">
                    {budget.analyticAccountType}
                  </Badge>
                </TableCell>
                <TableCell>{budget.responsiblePerson.name}</TableCell>
                <TableCell className="text-right">{formatAmount(budget.plannedAmount)}</TableCell>
                <TableCell className="text-right">{formatAmount(budget.actualAmount)}</TableCell>
                <TableCell className="text-right">{formatAmount(budget.variance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
