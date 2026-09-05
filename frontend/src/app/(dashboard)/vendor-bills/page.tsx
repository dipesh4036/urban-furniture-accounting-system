"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RecordPaymentDialog } from "@/features/vendor-bills/components/RecordPaymentDialog";
import { useVendorBills } from "@/features/vendor-bills/hooks/useVendorBills";
import type { DocStatus } from "@/features/vendor-bills/services/vendor-bills.service";

function statusVariant(status: DocStatus): "default" | "secondary" | "outline" {
  if (status === "PAID") return "default";
  if (status === "PARTIALLY_PAID") return "secondary";
  return "outline"; // UNPAID
}

export default function VendorBillsPage() {
  const { data, isLoading, isError, refetch } = useVendorBills();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vendor Bills</h1>
        <p className="text-sm text-muted-foreground">Bills to pay.</p>
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

      {!isLoading && !isError && data && data.vendorBills.length === 0 && (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No vendor bills yet. Convert a confirmed purchase order into one from the Purchase Orders page.
        </p>
      )}

      {!isLoading && !isError && data && data.vendorBills.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill Number</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.vendorBills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-medium">{bill.billNumber}</TableCell>
                <TableCell>{bill.vendor.name}</TableCell>
                <TableCell>{new Date(bill.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(bill.status)}>{bill.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{Number(bill.totalAmount).toFixed(2)}</TableCell>
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
      )}
    </div>
  );
}
