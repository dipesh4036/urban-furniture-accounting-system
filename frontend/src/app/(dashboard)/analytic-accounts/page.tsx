"use client";

import { useState } from "react";
import { BarChart3, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { ViewToggle, type ViewMode } from "@/components/common/ViewToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnalyticAccountFormDialog } from "@/features/analytic-accounts/components/AnalyticAccountFormDialog";
import { useAnalyticAccounts } from "@/features/analytic-accounts/hooks/useAnalyticAccounts";
import type { AnalyticType } from "@/features/analytic-accounts/services/analytic-accounts.service";

function typeVariant(type: AnalyticType): "default" | "secondary" {
  return type === "INCOME" ? "default" : "secondary";
}

export default function AnalyticAccountsPage() {
  const [view, setView] = useState<ViewMode>("list");
  const { data, isLoading, isError, refetch } = useAnalyticAccounts();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytic Accounts</h1>
          <p className="text-sm text-muted-foreground">Cost/revenue centers Budgets are tracked against.</p>
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={setView} />
          <AnalyticAccountFormDialog
            trigger={
              <Button size="sm">
                <Plus className="mr-2 size-4" />
                New Analytic Account
              </Button>
            }
          />
        </div>
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
        <>
          {view === "list" ? (
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
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.analyticAccounts.map((analyticAccount) => (
                <Card key={analyticAccount.id} className="flex flex-col justify-between transition-all hover:shadow-md">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {analyticAccount.type === "INCOME" ? (
                          <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
                        ) : analyticAccount.type === "EXPENSE" ? (
                          <TrendingDown className="size-5 text-rose-600 dark:text-rose-400" />
                        ) : (
                          <BarChart3 className="size-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-1">{analyticAccount.name}</h3>
                        <Badge variant={typeVariant(analyticAccount.type)} className="mt-1 text-[10px]">
                          {analyticAccount.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 text-xs text-muted-foreground">
                    <div className="rounded-md bg-muted/40 p-2 text-center">
                      <span className="font-medium text-foreground">Tracked Analytic Center</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

