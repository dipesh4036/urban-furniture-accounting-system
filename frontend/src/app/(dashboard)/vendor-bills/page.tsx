"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { DataTableEmptyState } from "@/components/common/DataTableEmptyState";
import { RecordPaymentDialog } from "@/features/vendor-bills/components/RecordPaymentDialog";
import { useVendorBills } from "@/features/vendor-bills/hooks/useVendorBills";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import type { DocStatus } from "@/features/vendor-bills/services/vendor-bills.service";

export default function VendorBillsPage() {
  const {
    searchInput,
    search,
    setSearchQuery,
    filters,
    setFilter,
    resetFilters,
    isFiltered,
    currentPage,
    pageSize,
    setPage,
    setPageSize,
  } = useServerDataTable({
    defaultPageSize: 10,
    initialFilters: { status: "ALL" },
  });

  // Server-side search/filter/pagination - every keystroke (debounced)
  // and every filter/page change triggers a fresh GET /vendor-bills request.
  const { data, isLoading, isError, refetch } = useVendorBills({
    search: search || undefined,
    status: filters.status === "ALL" ? undefined : (filters.status as DocStatus),
    page: currentPage,
    limit: pageSize,
  });

  const paginatedData = data?.vendorBills ?? [];
  const totalItems = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 0;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Vendor Bills</h1>
        <p className="text-sm text-muted-foreground">Bills to pay vendors.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load vendor bills. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && totalItems === 0 && !isFiltered && (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No vendor bills yet. Convert a confirmed purchase order into one from the Purchase Orders page.
        </p>
      )}

      {!isLoading && !isError && (totalItems > 0 || isFiltered) && (
        <div className="flex flex-col gap-4">
          <DataTableToolbar
            searchQuery={searchInput}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search bill # or vendor..."
            filters={[
              {
                key: "status",
                label: "All Statuses",
                options: [
                  { label: "All Statuses", value: "ALL" },
                  { label: "Unpaid", value: "UNPAID" },
                  { label: "Partially Paid", value: "PARTIALLY_PAID" },
                  { label: "Paid", value: "PAID" },
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

          {paginatedData.length === 0 ? (
            <DataTableEmptyState onReset={resetFilters} />
          ) : (
            <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-semibold text-foreground">{bill.billNumber}</TableCell>
                      <TableCell className="font-medium text-foreground">{bill.vendor.name}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <StatusBadge status={bill.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground tabular-nums">
                        ₹{Number(bill.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        {bill.status !== "PAID" && (
                          <RecordPaymentDialog
                            billId={bill.id}
                            trigger={
                              <Button variant="outline" size="sm">
                                Record Payment
                              </Button>
                            }
                          />
                        )}
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
