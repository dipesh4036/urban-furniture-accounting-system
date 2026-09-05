"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConvertToBillDialog } from "@/features/purchase-orders/components/ConvertToBillDialog";
import { PurchaseOrderForm } from "@/features/purchase-orders/components/PurchaseOrderForm";
import { usePurchaseOrders } from "@/features/purchase-orders/hooks/usePurchaseOrders";
import type { PurchaseOrder } from "@/features/purchase-orders/services/purchase-orders.service";

function poTotal(po: PurchaseOrder): number {
  return po.items.reduce((sum, item) => sum + item.quantity * Number(item.unitPrice), 0);
}

function statusVariant(status: PurchaseOrder["status"]): "default" | "secondary" | "outline" {
  if (status === "CONFIRMED") return "default";
  if (status === "BILLED") return "secondary";
  return "outline"; // DRAFT, CANCELLED
}

export default function PurchaseOrdersPage() {
  const { data, isLoading, isError, refetch } = usePurchaseOrders();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Purchase Orders</h1>
        <p className="text-sm text-muted-foreground">Orders placed with vendors.</p>
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
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No purchase orders yet. Create the first one below.
        </p>
      )}

      {!isLoading && !isError && data && data.purchaseOrders.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.purchaseOrders.map((po) => (
              <TableRow key={po.id}>
                <TableCell className="font-medium">{po.poNumber}</TableCell>
                <TableCell>{po.vendor.name}</TableCell>
                <TableCell>{new Date(po.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(po.status)}>{po.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{poTotal(po).toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {/*
                    The backend only accepts convert-to-bill while status is
                    CONFIRMED (422 otherwise) - so the action stays hidden
                    for any other status instead of letting it fail. Note:
                    nothing in the current API moves a PO from DRAFT to
                    CONFIRMED yet, so this action has no way to become
                    available until that endpoint exists.
                  */}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <PurchaseOrderForm />
    </div>
  );
}
