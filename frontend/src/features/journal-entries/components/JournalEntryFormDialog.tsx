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
import { JournalEntryForm } from "./JournalEntryForm";

interface JournalEntryFormDialogProps {
  trigger: React.ReactElement;
}

export function JournalEntryFormDialog({ trigger }: JournalEntryFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">New Journal Entry</DialogTitle>
          <DialogDescription>
            Record balanced double-entry debits and credits across general ledger accounts.
          </DialogDescription>
        </DialogHeader>
        <JournalEntryForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          inDialog
        />
      </DialogContent>
    </Dialog>
  );
}
