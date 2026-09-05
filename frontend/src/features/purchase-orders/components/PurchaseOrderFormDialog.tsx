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
import { PurchaseOrderForm } from "./PurchaseOrderForm";

interface PurchaseOrderFormDialogProps {
  trigger: React.ReactElement;
}

export function PurchaseOrderFormDialog({ trigger }: PurchaseOrderFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">New Purchase Order</DialogTitle>
          <DialogDescription>
            Place an order with a vendor for raw materials, hardware, or inventory items.
          </DialogDescription>
        </DialogHeader>
        <PurchaseOrderForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          inDialog
        />
      </DialogContent>
    </Dialog>
  );
}
