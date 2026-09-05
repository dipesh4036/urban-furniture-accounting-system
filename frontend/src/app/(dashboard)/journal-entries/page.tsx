"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { DataTableEmptyState } from "@/components/common/DataTableEmptyState";
import { JournalEntryFormDialog } from "@/features/journal-entries/components/JournalEntryFormDialog";
import { useJournalEntries } from "@/features/journal-entries/hooks/useJournalEntries";
import { useServerDataTable } from "@/hooks/useServerDataTable";

function formatAmount(value: string | number): string {
  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function JournalEntriesPage() {
  const { searchInput, search, setSearchQuery, resetFilters, isFiltered, currentPage, pageSize, setPage, setPageSize } =
    useServerDataTable({ defaultPageSize: 10 });

  // Server-side search/pagination - every keystroke (debounced) and page
  // change triggers a fresh GET /journal-entries request.
  const { data, isLoading, isError, refetch } = useJournalEntries({
    search: search || undefined,
    page: currentPage,
    limit: pageSize,
  });

  const paginatedData = data?.entries ?? [];
  const totalItems = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 0;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Journal Entries</h1>
          <p className="text-sm text-muted-foreground">Manual debit/credit entries.</p>
        </div>

        <JournalEntryFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              New Entry
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
          <p className="text-sm text-muted-foreground">Couldn&apos;t load journal entries. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && totalItems === 0 && !isFiltered && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No journal entries yet.</p>
          <JournalEntryFormDialog trigger={<Button>Create your first entry</Button>} />
        </div>
      )}

      {!isLoading && !isError && (totalItems > 0 || isFiltered) && (
        <div className="flex flex-col gap-4">
          <DataTableToolbar
            searchQuery={searchInput}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by reference..."
            isFiltered={isFiltered}
            onResetFilters={resetFilters}
            totalResults={totalItems}
            unfilteredTotal={totalItems}
          />

          {paginatedData.length === 0 ? (
            <DataTableEmptyState onReset={resetFilters} />
          ) : (
            <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Lines</TableHead>
                    <TableHead className="text-right">Total Debit (₹)</TableHead>
                    <TableHead className="text-right">Total Credit (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((entry) => {
                    const totalDebit = entry.items.reduce((sum, item) => sum + Number(item.debit), 0);
                    const totalCredit = entry.items.reduce((sum, item) => sum + Number(item.credit), 0);

                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="text-muted-foreground tabular-nums">{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-semibold text-foreground">{entry.reference}</TableCell>
                        <TableCell>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium text-foreground">
                            {entry.items.length} {entry.items.length === 1 ? "line" : "lines"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium text-foreground tabular-nums">
                          ₹{formatAmount(totalDebit.toString())}
                        </TableCell>
                        <TableCell className="text-right font-medium text-foreground tabular-nums">
                          ₹{formatAmount(totalCredit.toString())}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
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
