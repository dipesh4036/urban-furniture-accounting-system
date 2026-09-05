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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Staff User</DialogTitle>
          <DialogDescription>
            Create an Admin or Accountant account.
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm onSuccess={() => setOpen(false)} inDialog />
      </DialogContent>
    </Dialog>
  );
}
