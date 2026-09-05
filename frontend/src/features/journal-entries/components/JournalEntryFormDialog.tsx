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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Journal Entry</DialogTitle>
          <DialogDescription>
            Record balanced double-entry debits and credits across ledger accounts.
          </DialogDescription>
        </DialogHeader>
        <JournalEntryForm onSuccess={() => setOpen(false)} inDialog />
      </DialogContent>
    </Dialog>
  );
}
