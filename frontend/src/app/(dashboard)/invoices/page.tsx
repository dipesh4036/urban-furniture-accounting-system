"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { DataTableEmptyState } from "@/components/common/DataTableEmptyState";
import { RecordPaymentDialog } from "@/features/customer-invoices/components/RecordPaymentDialog";
import { useCustomerInvoices } from "@/features/customer-invoices/hooks/useCustomerInvoices";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import type { DocStatus } from "@/features/customer-invoices/services/customer-invoices.service";

export default function InvoicesPage() {
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
  // and every filter/page change triggers a fresh GET /customer-invoices request.
  const { data, isLoading, isError, refetch } = useCustomerInvoices({
    search: search || undefined,
    status: filters.status === "ALL" ? undefined : (filters.status as DocStatus),
    page: currentPage,
    limit: pageSize,
  });

  const paginatedData = data?.customerInvoices ?? [];
  const totalItems = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 0;
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Invoices</h1>
        <p className="text-sm text-muted-foreground">Invoices to collect from customers.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load invoices. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && totalItems === 0 && !isFiltered && (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No invoices yet. Generate one from a confirmed sales order on the Sales Orders page.
        </p>
      )}

      {!isLoading && !isError && (totalItems > 0 || isFiltered) && (
        <div className="flex flex-col gap-4">
          <DataTableToolbar
            searchQuery={searchInput}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search invoice # or customer..."
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
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead className="text-center">Email Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-semibold text-foreground">{invoice.invoiceNumber}</TableCell>
                      <TableCell className="font-medium text-foreground">{invoice.customer.name}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground tabular-nums">
                        ₹{Number(invoice.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        {invoice.emailSentAt ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="size-4 text-emerald-500" />
                            <span>Sent</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <XCircle className="size-4 text-muted-foreground/60" />
                            <span>No</span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {invoice.status !== "PAID" && (
                          <RecordPaymentDialog
                            invoiceId={invoice.id}
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
