"use client";

import { BookOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { DataTableEmptyState } from "@/components/common/DataTableEmptyState";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { AccountFormDialog } from "@/features/accounts/components/AccountFormDialog";
import { useAccounts, useUpdateAccount } from "@/features/accounts/hooks/useAccounts";
import type { AccountType } from "@/features/accounts/services/accounts.service";

export default function AccountsPage() {
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
    initialFilters: { type: "ALL", status: "ALL" },
  });

  // Server-side search/filter/pagination - every keystroke (debounced)
  // and every filter/page change triggers a fresh GET /accounts request.
  const { data, isLoading, isError, refetch } = useAccounts({
    search: search || undefined,
    type: filters.type === "ALL" ? undefined : (filters.type as AccountType),
    status: filters.status === "ALL" ? undefined : (filters.status as "ACTIVE" | "ARCHIVED"),
    page: currentPage,
    limit: pageSize,
  });
  const updateAccount = useUpdateAccount();

  const paginatedData = data?.accounts ?? [];
  const totalItems = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 0;

  async function handleArchive(id: string) {
    try {
      await updateAccount.mutateAsync({ id, input: { isActive: false } });
      toast.success("Account archived");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chart of Accounts</h1>
          <p className="text-sm text-muted-foreground">Ledger accounts used to classify transactions.</p>
        </div>

        <AccountFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              New Account
            </Button>
          }
        />
      </div>

      {/* Toolbar */}
      <DataTableToolbar
        searchQuery={searchInput}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search accounts by name or type..."
        filterOptions={[
          {
            key: "type",
            title: "Type",
            options: [
              { label: "All Types", value: "ALL" },
              { label: "Asset", value: "ASSET" },
              { label: "Liability", value: "LIABILITY" },
              { label: "Capital", value: "CAPITAL" },
              { label: "Income", value: "INCOME" },
              { label: "Expense", value: "EXPENSE" },
            ],
          },
          {
            key: "status",
            title: "Status",
            options: [
              { label: "All Statuses", value: "ALL" },
              { label: "Active", value: "ACTIVE" },
              { label: "Archived", value: "ARCHIVED" },
            ],
          },
        ]}
        selectedFilters={filters}
        onFilterChange={setFilter}
        hasActiveFilters={isFiltered}
        onResetFilters={resetFilters}
        totalCount={totalItems}
        filteredCount={totalItems}
      />

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load accounts. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && totalItems === 0 && !isFiltered && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No accounts yet.</p>
          <AccountFormDialog trigger={<Button>Create your first account</Button>} />
        </div>
      )}

      {!isLoading && !isError && totalItems === 0 && isFiltered && (
        <DataTableEmptyState
          icon={BookOpen}
          title="No accounts match your criteria"
          description="Try resetting your filters or adjusting your search term."
          onClear={resetFilters}
        />
      )}

      {!isLoading && !isError && paginatedData.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-semibold text-foreground">{account.name}</TableCell>
                    <TableCell>
                      <StatusBadge status={account.type} showDot={false} size="sm" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={account.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <AccountFormDialog account={account} trigger={<Button variant="outline" size="sm">Edit</Button>} />
                        {account.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleArchive(account.id)}
                            disabled={updateAccount.isPending}
                          >
                            Archive
                          </Button>
                        )}
                      </div>
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
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      )}
    </div>
  );
}

