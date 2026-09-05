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
import { CreateUserForm } from "./CreateUserForm";

interface UserFormDialogProps {
  trigger: React.ReactElement;
}

export function UserFormDialog({ trigger }: UserFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">New Staff User</DialogTitle>
          <DialogDescription>
            Create an internal staff member with Admin or Accountant access permissions.
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          inDialog
        />
      </DialogContent>
    </Dialog>
  );
}
