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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Sales Order</DialogTitle>
          <DialogDescription>
            Create an order from a customer with line items and taxes.
          </DialogDescription>
        </DialogHeader>
        <SalesOrderForm onSuccess={() => setOpen(false)} inDialog />
      </DialogContent>
    </Dialog>
  );
}
