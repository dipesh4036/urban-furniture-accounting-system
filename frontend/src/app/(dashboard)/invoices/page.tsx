"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RecordPaymentDialog } from "@/features/customer-invoices/components/RecordPaymentDialog";
import { useCustomerInvoices } from "@/features/customer-invoices/hooks/useCustomerInvoices";
import type { DocStatus } from "@/features/customer-invoices/services/customer-invoices.service";

function statusVariant(status: DocStatus): "default" | "secondary" | "outline" {
  if (status === "PAID") return "default";
  if (status === "PARTIALLY_PAID") return "secondary";
  return "outline"; // UNPAID
}

export default function InvoicesPage() {
  const { data, isLoading, isError, refetch } = useCustomerInvoices();

  return (
    <div className="flex flex-col gap-8">
      <div>
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
            {data.customerInvoices.map((invoice) => (
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
      )}
    </div>
  );
}
