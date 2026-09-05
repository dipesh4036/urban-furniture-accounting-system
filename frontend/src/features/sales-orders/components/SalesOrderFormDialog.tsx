"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SalesOrderForm } from "./SalesOrderForm";

interface SalesOrderFormDialogProps {
  trigger: React.ReactElement;
}

export function SalesOrderFormDialog({ trigger }: SalesOrderFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">New Sales Order</DialogTitle>
          <DialogDescription>
            Create a customer sales order with individual items, quantities, pricing, and taxes.
          </DialogDescription>
        </DialogHeader>
        <SalesOrderForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          inDialog
        />
      </DialogContent>
    </Dialog>
  );
}
