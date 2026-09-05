"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { RequiredMark } from "@/components/common/RequiredMark";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useCreateAccount, useUpdateAccount } from "../hooks/useAccounts";
import type { Account, AccountType } from "../services/accounts.service";
import { accountFormSchema, accountTypes, type AccountFormValues } from "../validators/accounts.validator";

const accountTypeLabels: Record<AccountType, string> = {
  ASSET: "Asset",
  LIABILITY: "Liability",
  EXPENSE: "Expense",
  INCOME: "Income",
  CAPITAL: "Capital",
};

interface AccountFormDialogProps {
  // Pass an account to edit it. Leave it out to create a new one.
  account?: Account;
  // The element that opens the dialog when clicked (e.g. a <Button>).
  // base-ui's DialogTrigger takes over this element's click behavior via
  // its `render` prop instead of Radix's `asChild` pattern.
  trigger: React.ReactElement;
}

export function AccountFormDialog({ account, trigger }: AccountFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!account;

  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const isSaving = createAccount.isPending || updateAccount.isPending;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    // The Select must start with a defined value (empty string, not
    // undefined) or base-ui logs a "switching from uncontrolled to
    // controlled" warning the moment a real type gets picked. "" isn't a
    // valid AccountType, so it still fails Zod validation on submit until
    // the user actually picks one - it's just a placeholder starting value.
    defaultValues: { name: account?.name ?? "", type: account?.type ?? ("" as AccountType) },
  });

  // Reset the form back to this account's values (or blank, for create)
  // every time the dialog opens - otherwise a previously edited account's
  // leftover values could show up when creating a new one.
  useEffect(() => {
    if (open) {
      reset({ name: account?.name ?? "", type: account?.type ?? ("" as AccountType) });
    }
  }, [open, account, reset]);

  async function onSubmit(values: AccountFormValues) {
    try {
      if (isEditing) {
        await updateAccount.mutateAsync({ id: account.id, input: values });
        toast.success("Account updated");
      } else {
        await createAccount.mutateAsync(values);
        toast.success("Account created");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {isEditing ? "Edit Account" : "New Account"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modify account title or category classification in your Chart of Accounts."
              : "Add a new account to your general ledger Chart of Accounts."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">
              Account Name
              <RequiredMark />
            </Label>
            <Input
              id="name"
              placeholder="e.g. Cash in Hand, Inventory, Sales Revenue"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="type">
              Account Type
              <RequiredMark />
            </Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="w-full" aria-invalid={!!errors.type}>
                    <SelectValue placeholder="Select account classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {accountTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
          </div>

          <DialogFooter className="mt-2 pt-4 border-t border-border/40 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Spinner className="mr-2 size-4" />}
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
