"use client";

import { useState } from "react";
import { BarChart3, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { ViewToggle, type ViewMode } from "@/components/common/ViewToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { DataTableEmptyState } from "@/components/common/DataTableEmptyState";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { AnalyticAccountFormDialog } from "@/features/analytic-accounts/components/AnalyticAccountFormDialog";
import { useAnalyticAccounts } from "@/features/analytic-accounts/hooks/useAnalyticAccounts";
import type { AnalyticType } from "@/features/analytic-accounts/services/analytic-accounts.service";

export default function AnalyticAccountsPage() {
  const [view, setView] = useState<ViewMode>("list");

  const {
    searchInput,
    search,
    setSearchQuery,
    filters,
    setFilter,
    resetFilters,
    isFiltered,
    currentPage,
    setPage,
    pageSize,
    setPageSize,
  } = useServerDataTable({
    defaultPageSize: 10,
    initialFilters: { type: "ALL" },
  });

  // Server-side search/filter/pagination - every keystroke (debounced)
  // and every filter/page change triggers a fresh GET /analytic-accounts request.
  const { data, isLoading, isError, refetch } = useAnalyticAccounts({
    search: search || undefined,
    type: filters.type === "ALL" ? undefined : (filters.type as AnalyticType),
    page: currentPage,
    limit: pageSize,
  });

  const paginatedData = data?.analyticAccounts ?? [];
  const totalItems = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 0;

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
        searchQuery={searchInput}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search analytic accounts by name..."
        filters={[
          {
            key: "type",
            label: "All Types",
            options: [
              { label: "All Types", value: "ALL" },
              { label: "Income", value: "INCOME" },
              { label: "Expense", value: "EXPENSE" },
            ],
          },
        ]}
        activeFilters={filters}
        onFilterChange={setFilter}
        isFiltered={isFiltered}
        onResetFilters={resetFilters}
        totalResults={totalItems}
        unfilteredTotal={totalItems}
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

      {!isLoading && !isError && totalItems === 0 && !isFiltered && (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No analytic accounts yet. Create the first one above.
        </p>
      )}

      {!isLoading && !isError && totalItems === 0 && isFiltered && (
        <DataTableEmptyState
          icon={BarChart3}
          title="No analytic accounts match your criteria"
          description="Try resetting your filters or adjusting your search term."
          onReset={resetFilters}
        />
      )}

      {!isLoading && !isError && paginatedData.length > 0 && (
        <div className="flex flex-col gap-4">
          {view === "list" ? (
            <div className="w-full rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[65%] min-w-[280px]">Analytic Account Name</TableHead>
                    <TableHead className="w-[35%] min-w-[180px]">Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((analyticAccount) => (
                    <TableRow key={analyticAccount.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            {analyticAccount.type === "INCOME" ? (
                              <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
                            ) : analyticAccount.type === "EXPENSE" ? (
                              <TrendingDown className="size-4 text-rose-600 dark:text-rose-400" />
                            ) : (
                              <BarChart3 className="size-4 text-primary" />
                            )}
                          </div>
                          <span className="font-semibold text-foreground">{analyticAccount.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={analyticAccount.type} showDot={false} size="sm" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                startIndex={paginatedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                endIndex={Math.min(currentPage * pageSize, totalItems)}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          ) : (
            <div className="space-y-4">
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
                          <StatusBadge status={analyticAccount.type} showDot={false} size="sm" className="mt-1" />
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

              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                startIndex={paginatedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                endIndex={Math.min(currentPage * pageSize, totalItems)}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
