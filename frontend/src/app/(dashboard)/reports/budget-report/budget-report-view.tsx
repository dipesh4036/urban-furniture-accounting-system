"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { RequiredMark } from "@/components/common/RequiredMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBudgetReport } from "@/features/reports/hooks/useReports";

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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Budget Report</h1>
        <p className="text-sm text-muted-foreground">Planned vs actual spend per analytic account.</p>
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
