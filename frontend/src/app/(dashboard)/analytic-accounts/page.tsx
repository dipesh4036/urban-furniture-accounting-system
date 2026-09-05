"use client";

import { useMemo, useState } from "react";
import { BarChart3, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { ViewToggle, type ViewMode } from "@/components/common/ViewToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { DataTableEmptyState } from "@/components/common/DataTableEmptyState";
import { useDataTable } from "@/hooks/useDataTable";
import { AnalyticAccountFormDialog } from "@/features/analytic-accounts/components/AnalyticAccountFormDialog";
import { useAnalyticAccounts } from "@/features/analytic-accounts/hooks/useAnalyticAccounts";
import type { AnalyticAccount, AnalyticType } from "@/features/analytic-accounts/services/analytic-accounts.service";

function typeVariant(type: AnalyticType): "default" | "secondary" {
  return type === "INCOME" ? "default" : "secondary";
}

export default function AnalyticAccountsPage() {
  const [view, setView] = useState<ViewMode>("list");
  const { data, isLoading, isError, refetch } = useAnalyticAccounts();

  const rawAnalyticAccounts = useMemo(() => data?.analyticAccounts ?? [], [data?.analyticAccounts]);

  const {
    paginatedData,
    filteredData,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    resetFilters,
    hasActiveFilters,
    totalItems,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
  } = useDataTable<AnalyticAccount>({
    data: rawAnalyticAccounts,
    searchFields: ["name", "type"],
    filterPredicate: (item, currentFilters) => {
      const typeFilter = currentFilters.type;
      if (typeFilter && typeFilter !== "ALL" && item.type !== typeFilter) {
        return false;
      }
      return true;
    },
    defaultPageSize: 10,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytic Accounts</h1>
          <p className="text-sm text-muted-foreground">Cost/revenue centers Budgets are tracked against.</p>
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={setView} />
          <AnalyticAccountFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                New Analytic Account
              </Button>
            }
          />
        </div>
      </div>

      {/* Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search analytic accounts by name..."
        filterOptions={[
          {
            key: "type",
            title: "Type",
            options: [
              { label: "All Types", value: "ALL" },
              { label: "Income", value: "INCOME" },
              { label: "Expense", value: "EXPENSE" },
            ],
          },
        ]}
        selectedFilters={filters}
        onFilterChange={setFilter}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        totalCount={rawAnalyticAccounts.length}
        filteredCount={filteredData.length}
      />

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

      {!isLoading && !isError && rawAnalyticAccounts.length === 0 && (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No analytic accounts yet. Create the first one above.
        </p>
      )}

      {!isLoading && !isError && rawAnalyticAccounts.length > 0 && filteredData.length === 0 && (
        <DataTableEmptyState
          icon={BarChart3}
          title="No analytic accounts match your criteria"
          description="Try resetting your filters or adjusting your search term."
          onClear={resetFilters}
        />
      )}

      {!isLoading && !isError && paginatedData.length > 0 && (
        <div className="flex flex-col gap-4">
          {view === "list" ? (
            <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((analyticAccount) => (
                    <TableRow key={analyticAccount.id}>
                      <TableCell className="font-medium">{analyticAccount.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={typeVariant(analyticAccount.type)}>{analyticAccount.type}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedData.map((analyticAccount) => (
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

          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
    </div>
  );
}


