"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { RequiredMark } from "@/components/common/RequiredMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProfitLoss } from "@/features/reports/hooks/useReports";
import type { ProfitLossAccount } from "@/features/reports/services/reports.service";

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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profit &amp; Loss</h1>
        <p className="text-sm text-muted-foreground">Income and expenses over a date range.</p>
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
