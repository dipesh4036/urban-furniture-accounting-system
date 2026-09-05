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
import { getFirstErrorField } from "@/lib/formErrors";
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
    mode: "onBlur",
    reValidateMode: "onChange",
    // The Select must start with a defined value (empty string, not
    // undefined) or base-ui logs a "switching from uncontrolled to
    // controlled" warning the moment a real type gets picked.
    defaultValues: { name: "", type: "" as AnalyticTypeOption },
  });

  const firstErrorField = getFirstErrorField(errors);

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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">New Analytic Account</DialogTitle>
          <DialogDescription>
            Track revenues and expenditures by cost center, department, or project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">
              Analytic Account Name
              <RequiredMark />
            </Label>
            <Input
              id="name"
              placeholder="e.g. Design Studio, Marketing Project, Warehouse Ops"
              aria-invalid={firstErrorField === "name"}
              {...register("name")}
            />
            {firstErrorField === "name" && errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="type">
              Tracking Category
              <RequiredMark />
            </Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="w-full" aria-invalid={firstErrorField === "type"}>
                    <SelectValue placeholder="Select tracking category" />
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
            {firstErrorField === "type" && errors.type && (
              <p className="text-xs text-destructive">{errors.type.message}</p>
            )}
          </div>

          <DialogFooter className="mt-2 pt-4 border-t border-border/40 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createAnalyticAccount.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createAnalyticAccount.isPending}>
              {createAnalyticAccount.isPending && <Spinner className="mr-2 size-4" />}
              {createAnalyticAccount.isPending ? "Saving..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
