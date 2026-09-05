"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { RequiredMark } from "@/components/common/RequiredMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBalanceSheet } from "@/features/reports/hooks/useReports";
import type { BalanceSheetAccount } from "@/features/reports/services/reports.service";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatAmount(value: string): string {
  return Number(value).toFixed(2);
}

// The backend only gives a combined totalLiabilitiesAndCapital, not one
// per section - so each section's own subtotal is summed here instead.
function sumBalances(accounts: BalanceSheetAccount[]): string {
  return accounts.reduce((sum, account) => sum + Number(account.balance), 0).toString();
}

function Section({ title, accounts, total }: { title: string; accounts: BalanceSheetAccount[]; total: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold">{title}</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account</TableHead>
            <TableHead className="text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-sm text-muted-foreground">
                No {title.toLowerCase()} accounts have activity as of this date.
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((account) => (
              <TableRow key={account.accountId}>
                <TableCell>{account.accountName}</TableCell>
                <TableCell className="text-right">{formatAmount(account.balance)}</TableCell>
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

export function BalanceSheetView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Reading straight from the URL (falling back to today) is what makes
  // this page shareable and back-button-safe - the date lives in the
  // URL, not just component state.
  const asOf = searchParams.get("asOf") ?? today();

  const { data, isLoading, isError, refetch } = useBalanceSheet(asOf);

  function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("asOf", event.target.value);
    router.replace(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Balance Sheet</h1>
        <p className="text-sm text-muted-foreground">Assets, liabilities, and capital as of a given date.</p>
      </div>

      <div className="flex flex-col gap-2 sm:w-64">
        <Label htmlFor="asOf">
          As Of
          <RequiredMark />
        </Label>
        <Input id="asOf" type="date" value={asOf} onChange={handleDateChange} />
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load the balance sheet. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading &&
        !isError &&
        data &&
        data.assets.length === 0 &&
        data.liabilities.length === 0 &&
        data.capital.length === 0 && (
          <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
            No account activity as of this date yet.
          </p>
        )}

      {!isLoading &&
        !isError &&
        data &&
        (data.assets.length > 0 || data.liabilities.length > 0 || data.capital.length > 0) && (
          <div className="flex flex-col gap-8">
            <Section title="Assets" accounts={data.assets} total={data.totalAssets} />
            <Section title="Liabilities" accounts={data.liabilities} total={sumBalances(data.liabilities)} />
            <Section title="Capital" accounts={data.capital} total={sumBalances(data.capital)} />

            <div className="flex justify-between gap-8 self-end border-t pt-2 text-sm">
              <span className="text-muted-foreground">Total Liabilities + Capital</span>
              <span className="font-medium">{formatAmount(data.totalLiabilitiesAndCapital)}</span>
            </div>
          </div>
        )}
    </div>
  );
}
