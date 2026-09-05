"use client";

import { useState } from "react";
import { Eye, FileText, Calendar, CreditCard, Receipt, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useVendorBills } from "@/features/vendor-bills/hooks/useVendorBills";
import type { VendorBill, DocStatus } from "@/features/vendor-bills/services/vendor-bills.service";

function statusBadge(status: DocStatus) {
  switch (status) {
    case "PAID":
      return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">Paid</Badge>;
    case "PARTIALLY_PAID":
      return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20">Partially Paid</Badge>;
    default:
      return <Badge variant="outline" className="text-muted-foreground">Unpaid</Badge>;
  }
}

function calculatePaidAmount(bill: VendorBill): number {
  if (!bill.payments || bill.payments.length === 0) return 0;
  return bill.payments.reduce((acc, p) => acc + Number(p.amount), 0);
}

export default function PortalBillsPage() {
  const { data, isLoading, isError, refetch } = useVendorBills();
  const [selectedBill, setSelectedBill] = useState<VendorBill | null>(null);

  const bills = data?.vendorBills ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Bills</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review bills and payment statuses for supplies provided to Urban Furniture.
          </p>
        </div>
      </div>

      {/* State 1: Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-border bg-card">
          <Spinner className="size-8 text-primary mb-3" />
          <p className="text-sm text-muted-foreground font-medium">Loading your bills...</p>
        </div>
      )}

      {/* State 2: Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-destructive/20 bg-destructive/5 text-center">
          <AlertCircle className="size-10 text-destructive mb-3" />
          <h3 className="text-base font-semibold text-foreground">Failed to load bills</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
            We encountered an error while fetching your vendor bills.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="size-4" />
            Try Again
          </Button>
        </div>
      )}

      {/* State 3: Empty */}
      {!isLoading && !isError && bills.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-border bg-card text-center">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
            <FileText className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground">No bills found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            You currently have no vendor bills recorded in the system.
          </p>
        </div>
      )}

      {/* State 4: Success Table */}
      {!isLoading && !isError && bills.length > 0 && (
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[160px] font-semibold">Bill #</TableHead>
                  <TableHead className="font-semibold">Invoice Date</TableHead>
                  <TableHead className="font-semibold">Due Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Total Amount</TableHead>
                  <TableHead className="text-right font-semibold">Balance Due</TableHead>
                  <TableHead className="text-right font-semibold w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => {
                  const total = Number(bill.totalAmount);
                  const paid = calculatePaidAmount(bill);
                  const balanceDue = Math.max(0, total - paid);

                  return (
                    <TableRow key={bill.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">
                        {bill.billNumber}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(bill.invoiceDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(bill.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{statusBadge(bill.status)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {balanceDue === 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">$0.00</span>
                        ) : (
                          <span className="text-foreground">${balanceDue.toFixed(2)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBill(bill)}
                          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="size-3.5" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Read-Only Vendor Bill Detail Dialog */}
      <Dialog open={!!selectedBill} onOpenChange={(open) => !open && setSelectedBill(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedBill && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-4">
                  <DialogTitle className="text-xl font-bold">
                    Vendor Bill {selectedBill.billNumber}
                  </DialogTitle>
                  {statusBadge(selectedBill.status)}
                </div>
                <DialogDescription>
                  Detailed breakdown of this vendor bill.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-6 py-2">
                {/* Meta Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/40 border border-border">
                  <div>
                    <span className="text-xs text-muted-foreground">Invoice Date</span>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {new Date(selectedBill.invoiceDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Due Date</span>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {new Date(selectedBill.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Total Amount</span>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      ${Number(selectedBill.totalAmount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Balance Due</span>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      ${Math.max(0, Number(selectedBill.totalAmount) - calculatePaidAmount(selectedBill)).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Vendor Details */}
                <div className="flex flex-col gap-1.5 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Vendor
                  </span>
                  <p className="font-medium text-foreground">{selectedBill.vendor.name}</p>
                  <p className="text-muted-foreground text-xs">{selectedBill.vendor.email}</p>
                  {Boolean(selectedBill.vendor.city || selectedBill.vendor.state) && (
                    <p className="text-muted-foreground text-xs">
                      {String([selectedBill.vendor.city, selectedBill.vendor.state].filter(Boolean).join(", "))}
                    </p>
                  )}
                </div>

                {/* Line Items if available */}
                {selectedBill.purchaseOrder && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Order Items (PO: {selectedBill.purchaseOrder.poNumber})
                    </span>
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40">
                            <TableHead className="text-xs font-medium">Item</TableHead>
                            <TableHead className="text-xs font-medium text-right">Qty</TableHead>
                            <TableHead className="text-xs font-medium text-right">Unit Price</TableHead>
                            <TableHead className="text-xs font-medium text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBill.purchaseOrder.items?.map((item, idx: number) => {
                            const lineTotal = Number(item.quantity) * Number(item.unitPrice);
                            return (
                              <TableRow key={item.id || idx}>
                                <TableCell className="text-xs font-medium">Item #{idx + 1}</TableCell>
                                <TableCell className="text-xs text-right">{item.quantity}</TableCell>
                                <TableCell className="text-xs text-right">${Number(item.unitPrice).toFixed(2)}</TableCell>
                                <TableCell className="text-xs text-right font-medium">${lineTotal.toFixed(2)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Payment History */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Payment History
                  </span>
                  {selectedBill.payments && selectedBill.payments.length > 0 ? (
                    <div className="rounded-lg border border-border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40">
                            <TableHead className="text-xs font-medium">Date</TableHead>
                            <TableHead className="text-xs font-medium">Method</TableHead>
                            <TableHead className="text-xs font-medium">Type</TableHead>
                            <TableHead className="text-xs font-medium text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBill.payments.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell className="text-xs">
                                {new Date(p.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-xs font-medium">{p.method}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{p.type}</TableCell>
                              <TableCell className="text-xs text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                +${Number(p.amount).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-2 italic">
                      No payments recorded yet against this bill.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
