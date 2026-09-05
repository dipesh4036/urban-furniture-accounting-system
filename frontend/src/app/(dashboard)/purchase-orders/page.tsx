"use client";

import { CheckCircle2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { DataTableEmptyState } from "@/components/common/DataTableEmptyState";
import { ConvertToBillDialog } from "@/features/purchase-orders/components/ConvertToBillDialog";
import { PurchaseOrderFormDialog } from "@/features/purchase-orders/components/PurchaseOrderFormDialog";
import { useConfirmPurchaseOrder, usePurchaseOrders } from "@/features/purchase-orders/hooks/usePurchaseOrders";
import { useDataTable } from "@/hooks/useDataTable";
import type { PurchaseOrder } from "@/features/purchase-orders/services/purchase-orders.service";

function poTotal(po: PurchaseOrder): number {
  return po.items.reduce((sum, item) => sum + item.quantity * Number(item.unitPrice), 0);
}

export default function PurchaseOrdersPage() {
  const { data, isLoading, isError, refetch } = usePurchaseOrders();
  const confirmMutation = useConfirmPurchaseOrder();

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
  } = useDataTable<PurchaseOrder>({
    data: data?.purchaseOrders,
    defaultPageSize: 10,
    searchFields: ["poNumber", (po) => po.vendor.name, (po) => new Date(po.date).toLocaleDateString()],
    initialFilters: { status: "ALL" },
  });

  const handleConfirm = async (id: string, poNumber: string) => {
    try {
      await confirmMutation.mutateAsync(id);
      toast.success(`Purchase Order ${poNumber} confirmed successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to confirm purchase order");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground">Orders placed with vendors.</p>
        </div>
        <PurchaseOrderFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              New Purchase Order
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
          <p className="text-sm text-muted-foreground">Couldn&apos;t load purchase orders. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.purchaseOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No purchase orders yet.</p>
          <PurchaseOrderFormDialog
            trigger={
              <Button size="sm" variant="outline">
                <Plus className="size-4" />
                Create Purchase Order
              </Button>
            }
          />
        </div>
      )}

      {!isLoading && !isError && data && data.purchaseOrders.length > 0 && (
        <div className="flex flex-col gap-4">
          <DataTableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search PO number, vendor, date..."
            filters={[
              {
                key: "status",
                label: "All Statuses",
                options: [
                  { label: "All Statuses", value: "ALL" },
                  { label: "Draft", value: "DRAFT" },
                  { label: "Confirmed", value: "CONFIRMED" },
                  { label: "Billed", value: "BILLED" },
                  { label: "Cancelled", value: "CANCELLED" },
                ],
              },
            ]}
            activeFilters={filters}
            onFilterChange={setFilter}
            isFiltered={isFiltered}
            onResetFilters={resetFilters}
            totalResults={totalItems}
            unfilteredTotal={data.purchaseOrders.length}
          />

          {paginatedData.length === 0 ? (
            <DataTableEmptyState onReset={resetFilters} />
          ) : (
            <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total (₹)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((po: PurchaseOrder) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-semibold text-foreground">{po.poNumber}</TableCell>
                      <TableCell className="font-medium text-foreground">{po.vendor.name}</TableCell>
                      <TableCell className="text-muted-foreground tabular-nums">{new Date(po.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <StatusBadge status={po.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground tabular-nums">
                        ₹{poTotal(po).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {po.status === "DRAFT" && (
                            <Button
                              variant="default"
                              size="sm"
                              disabled={confirmMutation.isPending}
                              onClick={() => handleConfirm(po.id, po.poNumber)}
                            >
                              <CheckCircle2 className="size-3.5" />
                              Confirm Order
                            </Button>
                          )}
                          {po.status === "CONFIRMED" && (
                            <ConvertToBillDialog
                              purchaseOrderId={po.id}
                              trigger={
                                <Button variant="outline" size="sm">
                                  Convert to Bill
                                </Button>
                              }
                            />
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
