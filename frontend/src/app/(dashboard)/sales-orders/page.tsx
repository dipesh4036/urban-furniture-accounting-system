"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GenerateInvoiceDialog } from "@/features/sales-orders/components/GenerateInvoiceDialog";
import { SalesOrderFormDialog } from "@/features/sales-orders/components/SalesOrderFormDialog";
import { useSalesOrders } from "@/features/sales-orders/hooks/useSalesOrders";
import type { SalesOrder } from "@/features/sales-orders/services/sales-orders.service";

function soTotal(so: SalesOrder): number {
  return so.items.reduce((sum, item) => sum + item.quantity * Number(item.unitPrice) + Number(item.tax), 0);
}

function statusVariant(status: SalesOrder["status"]): "default" | "secondary" | "outline" {
  if (status === "CONFIRMED") return "default";
  if (status === "BILLED") return "secondary";
  return "outline"; // DRAFT, CANCELLED
}

export default function SalesOrdersPage() {
  const { data, isLoading, isError, refetch } = useSalesOrders();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales Orders</h1>
          <p className="text-sm text-muted-foreground">Orders from customers.</p>
        </div>

        <SalesOrderFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              New Sales Order
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
          <p className="text-sm text-muted-foreground">Couldn&apos;t load sales orders. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.salesOrders.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No sales orders yet.</p>
          <SalesOrderFormDialog trigger={<Button>Create your first sales order</Button>} />
        </div>
      )}

      {!isLoading && !isError && data && data.salesOrders.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SO Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.salesOrders.map((so) => (
              <TableRow key={so.id}>
                <TableCell className="font-medium">{so.soNumber}</TableCell>
                <TableCell>{so.customer.name}</TableCell>
                <TableCell>{new Date(so.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(so.status)}>{so.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{soTotal(so).toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  {/*
                    The backend only accepts generate-invoice while status
                    is CONFIRMED (422 otherwise) - so the action stays
                    hidden for any other status instead of letting it
                    fail. Note: nothing in the current API moves a Sales
                    Order from DRAFT to CONFIRMED yet, so this action has
                    no way to become available until that endpoint exists.
                  */}
                  {so.status === "CONFIRMED" && (
                    <GenerateInvoiceDialog
                      salesOrderId={so.id}
                      trigger={
                        <Button variant="outline" size="sm">
                          Generate Invoice
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
    </div>
  );
}
