"use client";

import { CheckCircle2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GenerateInvoiceDialog } from "@/features/sales-orders/components/GenerateInvoiceDialog";
import { SalesOrderFormDialog } from "@/features/sales-orders/components/SalesOrderFormDialog";
import { useConfirmSalesOrder, useSalesOrders } from "@/features/sales-orders/hooks/useSalesOrders";
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
  const confirmMutation = useConfirmSalesOrder();

  const handleConfirm = async (id: string, soNumber: string) => {
    try {
      await confirmMutation.mutateAsync(id);
      toast.success(`Sales Order ${soNumber} confirmed successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to confirm sales order");
    }
  };

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
            {data.salesOrders.map((so: SalesOrder) => (
              <TableRow key={so.id}>

                <TableCell className="font-medium">{so.soNumber}</TableCell>
                <TableCell>{so.customer.name}</TableCell>
                <TableCell>{new Date(so.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(so.status)}>{so.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{soTotal(so).toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {so.status === "DRAFT" && (
                      <Button
                        variant="default"
                        size="sm"
                        disabled={confirmMutation.isPending}
                        onClick={() => handleConfirm(so.id, so.soNumber)}
                      >
                        <CheckCircle2 className="size-3.5 mr-1" />
                        Confirm Order
                      </Button>
                    )}
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
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

