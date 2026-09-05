"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnalyticAccountFormDialog } from "@/features/analytic-accounts/components/AnalyticAccountFormDialog";
import { useAnalyticAccounts } from "@/features/analytic-accounts/hooks/useAnalyticAccounts";
import type { AnalyticType } from "@/features/analytic-accounts/services/analytic-accounts.service";

function typeVariant(type: AnalyticType): "default" | "secondary" {
  return type === "INCOME" ? "default" : "secondary";
}

export default function AnalyticAccountsPage() {
  const { data, isLoading, isError, refetch } = useAnalyticAccounts();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytic Accounts</h1>
          <p className="text-sm text-muted-foreground">Cost/revenue centers Budgets are tracked against.</p>
        </div>

        <AnalyticAccountFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              New Analytic Account
            </Button>
          }
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load analytic accounts. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.analyticAccounts.length === 0 && (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No analytic accounts yet. Create the first one above.
        </p>
      )}

      {!isLoading && !isError && data && data.analyticAccounts.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.analyticAccounts.map((analyticAccount) => (
              <TableRow key={analyticAccount.id}>
                <TableCell className="font-medium">{analyticAccount.name}</TableCell>
                <TableCell>
                  <Badge variant={typeVariant(analyticAccount.type)}>{analyticAccount.type}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
