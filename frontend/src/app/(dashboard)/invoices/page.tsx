"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { DataTableEmptyState } from "@/components/common/DataTableEmptyState";
import { RecordPaymentDialog } from "@/features/customer-invoices/components/RecordPaymentDialog";
import { useCustomerInvoices } from "@/features/customer-invoices/hooks/useCustomerInvoices";
import { useDataTable } from "@/hooks/useDataTable";
import type { CustomerInvoice, DocStatus } from "@/features/customer-invoices/services/customer-invoices.service";

function statusVariant(status: DocStatus): "default" | "secondary" | "outline" {
  if (status === "PAID") return "default";
  if (status === "PARTIALLY_PAID") return "secondary";
  return "outline"; // UNPAID
}

export default function InvoicesPage() {
  const { data, isLoading, isError, refetch } = useCustomerInvoices();

  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    resetFilters,
    isFiltered,
    currentPage,
    pageSize,
    setPage,
    setPageSize,
    totalItems,
    totalPages,
    paginatedData,
    startIndex,
    endIndex,
  } = useDataTable<CustomerInvoice>({
    data: data?.customerInvoices,
    defaultPageSize: 10,
    searchFields: ["invoiceNumber", (inv) => inv.customer.name, (inv) => new Date(inv.dueDate).toLocaleDateString()],
    initialFilters: { status: "ALL", emailSent: "ALL" },
    filterPredicate: (invoice, currentFilters) => {
      // Filter by Status
      if (currentFilters.status && currentFilters.status !== "ALL") {
        if (invoice.status !== currentFilters.status) return false;
      }
      // Filter by Email Sent
      if (currentFilters.emailSent && currentFilters.emailSent !== "ALL") {
        if (currentFilters.emailSent === "SENT" && !invoice.emailSentAt) return false;
        if (currentFilters.emailSent === "NOT_SENT" && invoice.emailSentAt) return false;
      }
      return true;
    },
  });

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

      {!isLoading && !isError && data && data.customerInvoices.length === 0 && (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No invoices yet. Generate one from a confirmed sales order on the Sales Orders page.
        </p>
      )}

      {!isLoading && !isError && data && data.customerInvoices.length > 0 && (
        <div className="flex flex-col gap-4">
          <DataTableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search invoice #, customer, due date..."
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
              {
                key: "emailSent",
                label: "All Delivery",
                options: [
                  { label: "All Delivery", value: "ALL" },
                  { label: "Email Sent", value: "SENT" },
                  { label: "Not Sent", value: "NOT_SENT" },
                ],
              },
            ]}
            activeFilters={filters}
            onFilterChange={setFilter}
            isFiltered={isFiltered}
            onResetFilters={resetFilters}
            totalResults={totalItems}
            unfilteredTotal={data.customerInvoices.length}
          />

          {paginatedData.length === 0 ? (
            <DataTableEmptyState onReset={resetFilters} />
          ) : (
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead>Email Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customer.name}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">₹{Number(invoice.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        {invoice.emailSentAt ? (
                          <CheckCircle2 className="size-4 text-success" aria-label="Email sent" />
                        ) : (
                          <XCircle className="size-4 text-muted-foreground" aria-label="Email not sent" />
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
