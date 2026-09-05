"use client";

import { BookMarked, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { DataTableEmptyState } from "@/components/common/DataTableEmptyState";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { JournalFormDialog } from "@/features/journals/components/JournalFormDialog";
import { useJournals } from "@/features/journals/hooks/useJournals";

export default function JournalsPage() {
  const { data: accountsData } = useAccounts({ limit: 100 });

  function accountNameFor(accountId: string): string {
    return accountsData?.accounts.find((account) => account.id === accountId)?.name ?? accountId;
  }

  const { searchInput, search, setSearchQuery, resetFilters, isFiltered, currentPage, setPage, pageSize, setPageSize } =
    useServerDataTable({ defaultPageSize: 10 });

  // Server-side search/pagination - every keystroke (debounced) and page
  // change triggers a fresh GET /journals request.
  const { data, isLoading, isError, refetch } = useJournals({
    search: search || undefined,
    page: currentPage,
    limit: pageSize,
  });

  const paginatedData = data?.journals ?? [];
  const totalItems = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 0;

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
        searchQuery={searchInput}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search journals by name..."
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
          <p className="text-sm text-muted-foreground">Couldn&apos;t load journals. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && totalItems === 0 && !isFiltered && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No journals yet.</p>
          <JournalFormDialog trigger={<Button>Create your first journal</Button>} />
        </div>
      )}

      {!isLoading && !isError && totalItems === 0 && isFiltered && (
        <DataTableEmptyState
          icon={BookMarked}
          title="No journals match your criteria"
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
                  <TableHead className="w-[40%] min-w-[220px]">Journal Name</TableHead>
                  <TableHead className="w-[25%] min-w-[140px]">Type</TableHead>
                  <TableHead className="w-[35%] min-w-[220px]">Default Account</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((journal) => (
                  <TableRow key={journal.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <BookOpen className="size-4" />
                        </div>
                        <span className="font-semibold text-foreground">{journal.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={journal.type} showDot={false} size="sm" />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {accountNameFor(journal.defaultAccountId)}
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
        </div>
      )}
    </div>
  );
}
