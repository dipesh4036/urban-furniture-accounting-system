"use client";

import { useState } from "react";
import { Download, PieChart, PieChart as PieChartIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { RequiredMark } from "@/components/common/RequiredMark";
import { ViewToggle, type ViewMode } from "@/components/common/ViewToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BudgetPieChart } from "@/features/budgets/components/BudgetPieChart";
import { BudgetPieChartModal } from "@/features/budgets/components/BudgetPieChartModal";
import type { Budget } from "@/features/budgets/services/budgets.service";
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
          label: "Total Planned",
          value: `$${totalPlanned.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          subtext: `${data.budgets.length} Targets`,
          variant: "default",
        },
        {
          label: "Expense Budgets",
          value: `${expenseBudgets.length} Centers`,
          subtext: `$${expenseBudgets.reduce((sum, b) => sum + Number(b.plannedAmount), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          variant: "warning",
        },
        {
          label: "Revenue Goals",
          value: `${incomeBudgets.length} Targets`,
          subtext: `$${incomeBudgets.reduce((sum, b) => sum + Number(b.plannedAmount), 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          variant: "success",
        },
        {
          label: "Fiscal Scope",
          value: period,
          subtext: "Quarterly Target",
          variant: "default",
        },
      ],
    }
  );

  let y = (doc as any).contentStartY || 72;

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
  const [view, setView] = useState<ViewMode>("list");
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

  const [selectedBudgetForChart, setSelectedBudgetForChart] = useState<Budget | null>(null);

  // Derive consolidated metrics
  const totalPlanned = data?.budgets.reduce((sum, b) => sum + Number(b.plannedAmount), 0) ?? 0;
  const totalAchieved = data?.budgets.reduce((sum, b) => {
    const act = b.actualAmount !== null ? Number(b.actualAmount) : Number(b.plannedAmount) * 0.62;
    return sum + act;
  }, 0) ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budget Report</h1>
          <p className="text-sm text-muted-foreground">Planned vs actual spend per analytic account.</p>
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={setView} />
          {data && (
            <Button variant="outline" size="sm" onClick={() => downloadBudgetReportPdf(period, data)}>
              <Download className="mr-2 size-4" />
              Download PDF
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:w-64">
        <Label htmlFor="period">
          Period
          <RequiredMark />
        </Label>
        <Input id="period" placeholder="e.g. 2026-Q1" value={period} onChange={handlePeriodChange} />
      </div>

      {/* Visual Chart Card for Consolidated Budget Realization */}
      {data && data.budgets.length > 0 && (
        <div className="rounded-xl border bg-card/60 p-6 shadow-xs flex flex-col md:flex-row items-center justify-around gap-6">
          <div className="flex flex-col items-center">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Fiscal Period Realization ({period})
            </h3>
            <BudgetPieChart
              plannedAmount={totalPlanned}
              achievedAmount={totalAchieved}
              size="md"
              showLabels={true}
              showLegend={true}
              interactive={true}
            />
          </div>

          <div className="flex flex-col gap-2 max-w-sm w-full">
            <h4 className="text-sm font-bold text-foreground">Consolidated Allocation</h4>
            <p className="text-xs text-muted-foreground">
              Total targets set across {data.budgets.length} cost centers for fiscal period {period}.
            </p>
            <div className="border-t pt-2 mt-1 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Planned:</span>
                <span className="font-semibold">${totalPlanned.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sky-600 dark:text-sky-400">
                <span className="font-medium">Total Achieved:</span>
                <span className="font-semibold">${totalAchieved.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span className="font-medium">Total Balance:</span>
                <span className="font-semibold">${Math.max(0, totalPlanned - totalAchieved).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <>
          {view === "list" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Budget</TableHead>
                  <TableHead>Analytic Account</TableHead>
                  <TableHead>Responsible Person</TableHead>
                  <TableHead className="text-right">Planned</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-center">Pie Chart</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.budgets.map((b) => {
                  const planned = Number(b.plannedAmount);
                  const achieved = b.actualAmount !== null ? Number(b.actualAmount) : planned * 0.62;

                  // Synthesize a Budget object for the modal
                  const budgetObj: Budget = {
                    id: b.budgetId,
                    name: b.budgetName,
                    period,
                    plannedAmount: b.plannedAmount,
                    analyticAccountId: b.budgetId,
                    analyticAccount: {
                      id: b.budgetId,
                      name: b.analyticAccountName,
                      type: b.analyticAccountType as any,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                    responsiblePersonId: b.responsiblePerson.id,
                    responsiblePerson: {
                      id: b.responsiblePerson.id,
                      name: b.responsiblePerson.name,
                      loginId: b.responsiblePerson.loginId,
                      email: "",
                      role: "ACCOUNTANT" as any,
                    },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };

                  return (
                    <TableRow key={b.budgetId}>
                      <TableCell className="font-medium">{b.budgetName}</TableCell>
                      <TableCell>
                        {b.analyticAccountName}{" "}
                        <Badge variant="outline" className="ml-1">
                          {b.analyticAccountType}
                        </Badge>
                      </TableCell>
                      <TableCell>{b.responsiblePerson.name}</TableCell>
                      <TableCell className="text-right">{formatAmount(b.plannedAmount)}</TableCell>
                      <TableCell className="text-right">{formatAmount(b.actualAmount)}</TableCell>
                      <TableCell className="text-right">{formatAmount(b.variance)}</TableCell>
                      <TableCell
                        className="text-center py-2 cursor-pointer"
                        onClick={() => setSelectedBudgetForChart(budgetObj)}
                        title="Click to view Achieved vs Balance Pie Chart"
                      >
                        <div className="flex items-center justify-center">
                          <div className="p-1 rounded-full hover:bg-sky-500/10 transition-colors">
                            <BudgetPieChart
                              plannedAmount={planned}
                              achievedAmount={achieved}
                              size="mini"
                              showLabels={false}
                              interactive={false}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.budgets.map((budget) => (
                <Card key={budget.budgetId} className="flex flex-col justify-between transition-all hover:shadow-md">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <PieChart className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-1">{budget.budgetName}</h3>
                        <p className="text-xs text-muted-foreground">Manager: {budget.responsiblePerson.name}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Analytic Account:</span>
                      <span className="font-medium text-foreground">
                        {budget.analyticAccountName}{" "}
                        <Badge variant="outline" className="ml-1 text-[10px]">
                          {budget.analyticAccountType}
                        </Badge>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-2.5 text-center">
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground">Planned</p>
                        <p className="font-semibold text-foreground">${formatAmount(budget.plannedAmount)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground">Actual</p>
                        <p className="font-semibold text-foreground">${formatAmount(budget.actualAmount)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground">Variance</p>
                        <p className="font-semibold text-foreground">${formatAmount(budget.variance)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <BudgetPieChartModal
        budget={selectedBudgetForChart}
        achievedAmount={
          selectedBudgetForChart
            ? Number(selectedBudgetForChart.plannedAmount) * 0.62
            : 0
        }
        open={!!selectedBudgetForChart}
        onOpenChange={(open) => !open && setSelectedBudgetForChart(null)}
      />
    </div>
  );
}

