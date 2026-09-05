"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { RequiredMark } from "@/components/common/RequiredMark";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useCreateAnalyticAccount } from "../hooks/useAnalyticAccounts";
import {
  analyticAccountFormSchema,
  analyticTypes,
  type AnalyticAccountFormValues,
  type AnalyticTypeOption,
} from "../validators/analytic-accounts.validator";

const analyticTypeLabels: Record<AnalyticTypeOption, string> = {
  INCOME: "Income",
  EXPENSE: "Expense",
};

interface AnalyticAccountFormDialogProps {
  trigger: React.ReactElement;
}

// No edit/archive here - plan.md Module 11 only defines create + list
// for Analytic Accounts, so this dialog is create-only (unlike
// AccountFormDialog, which also handles editing an existing Account).
export function AnalyticAccountFormDialog({ trigger }: AnalyticAccountFormDialogProps) {
  const [open, setOpen] = useState(false);
  const createAnalyticAccount = useCreateAnalyticAccount();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnalyticAccountFormValues>({
    resolver: zodResolver(analyticAccountFormSchema),
    // The Select must start with a defined value (empty string, not
    // undefined) or base-ui logs a "switching from uncontrolled to
    // controlled" warning the moment a real type gets picked.
    defaultValues: { name: "", type: "" as AnalyticTypeOption },
  });

  async function onSubmit(values: AnalyticAccountFormValues) {
    try {
      await createAnalyticAccount.mutateAsync(values);
      toast.success("Analytic account created");
      reset({ name: "", type: "" as AnalyticTypeOption });
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Analytic Account</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              Name
              <RequiredMark />
            </Label>
            <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="type">
              Type
              <RequiredMark />
            </Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="w-full" aria-invalid={!!errors.type}>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {analyticTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {analyticTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createAnalyticAccount.isPending}>
              {createAnalyticAccount.isPending && <Spinner />}
              {createAnalyticAccount.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
