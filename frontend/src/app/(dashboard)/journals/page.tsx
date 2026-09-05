"use client";

import { useMemo } from "react";
import { BookMarked, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { DataTableEmptyState } from "@/components/common/DataTableEmptyState";
import { useDataTable } from "@/hooks/useDataTable";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { JournalFormDialog } from "@/features/journals/components/JournalFormDialog";
import { useJournals } from "@/features/journals/hooks/useJournals";
import type { Journal, JournalType } from "@/features/journals/services/journals.service";

export default function JournalsPage() {
  const { data, isLoading, isError, refetch } = useJournals();
  const { data: accountsData } = useAccounts({ limit: 100 });

  function accountNameFor(accountId: string): string {
    return accountsData?.accounts.find((account) => account.id === accountId)?.name ?? accountId;
  }

  const rawJournals = useMemo(() => data?.journals ?? [], [data?.journals]);

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
  } = useDataTable<Journal>({
    data: rawJournals,
    searchFields: ["name", "type", (j) => accountNameFor(j.defaultAccountId)],
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
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Journals</h1>
          <p className="text-sm text-muted-foreground">Sales, purchase, bank, and cash journals.</p>
        </div>

        <JournalFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              New Journal
            </Button>
          }
        />
      </div>

      {/* Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search journals by name or default account..."
        filterOptions={[
          {
            key: "type",
            title: "Type",
            options: [
              { label: "All Types", value: "ALL" },
              { label: "Sale", value: "SALE" },
              { label: "Purchase", value: "PURCHASE" },
              { label: "Cash", value: "CASH" },
              { label: "Bank", value: "BANK" },
              { label: "General", value: "GENERAL" },
            ],
          },
        ]}
        selectedFilters={filters}
        onFilterChange={setFilter}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        totalCount={rawJournals.length}
        filteredCount={filteredData.length}
      />

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load journals. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && rawJournals.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No journals yet.</p>
          <JournalFormDialog trigger={<Button>Create your first journal</Button>} />
        </div>
      )}

      {!isLoading && !isError && rawJournals.length > 0 && filteredData.length === 0 && (
        <DataTableEmptyState
          icon={BookMarked}
          title="No journals match your criteria"
          description="Try resetting your filters or adjusting your search term."
          onClear={resetFilters}
        />
      )}

      {!isLoading && !isError && paginatedData.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Default Account</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((journal) => (
                  <TableRow key={journal.id}>
                    <TableCell className="font-medium">{journal.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {journal.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{accountNameFor(journal.defaultAccountId)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

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

