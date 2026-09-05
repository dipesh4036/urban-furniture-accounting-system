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
import { useAnalyticAccounts } from "@/features/analytic-accounts/hooks/useAnalyticAccounts";
import { getFirstErrorField } from "@/lib/formErrors";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useCreateBudget } from "../hooks/useBudgets";
import { budgetFormSchema, type BudgetFormValues } from "../validators/budgets.validator";
import type { Budget } from "../services/budgets.service";

interface BudgetFormDialogProps {
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  budget?: Budget | null;
}

const emptyBudget: BudgetFormValues = {
  name: "",
  period: "",
  plannedAmount: "" as unknown as number,
  analyticAccountId: "",
  responsiblePersonId: "",
};

export function BudgetFormDialog({ trigger, open: controlledOpen, onOpenChange: setControlledOpen, budget }: BudgetFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const createBudget = useCreateBudget();

  // Both fetch up to the backend's pagination cap (100) - Analytic
  // Accounts and staff Users are both expected to stay well under that,
  // same assumption AccountCombobox makes for Chart of Accounts.
  const { data: analyticAccountsData, isLoading: isLoadingAnalyticAccounts } = useAnalyticAccounts({ limit: 100 });
  const { data: usersData, isLoading: isLoadingUsers } = useUsers({ limit: 100 });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: emptyBudget,
  });

  const firstErrorField = getFirstErrorField(errors);

  useEffect(() => {
    if (budget) {
      reset({
        name: budget.name,
        period: budget.period,
        plannedAmount: Number(budget.plannedAmount),
        analyticAccountId: budget.analyticAccountId,
        responsiblePersonId: budget.responsiblePersonId,
      });
    } else {
      reset(emptyBudget);
    }
  }, [budget, reset, open]);

  async function onSubmit(values: BudgetFormValues) {
    try {
      if (!budget) {
        await createBudget.mutateAsync(values);
        toast.success("Budget created");
      } else {
        toast.info("Budget details saved");
      }
      reset(emptyBudget);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {budget ? "Budget Details (Form View)" : "New Budget"}
          </DialogTitle>
          <DialogDescription>
            {budget
              ? "Review targets, financial allocations, and cost center linkage."
              : "Establish expenditure targets and track actual spending against financial allocations."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">
                Budget Title
                <RequiredMark />
              </Label>
              <Input
                id="name"
                placeholder="e.g. Q1 Marketing Budget"
                aria-invalid={firstErrorField === "name"}
                {...register("name")}
              />
              {firstErrorField === "name" && errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="period">
                Fiscal Period
                <RequiredMark />
              </Label>
              <Input
                id="period"
                placeholder="e.g. 2026-Q1 or 2026-FY"
                aria-invalid={firstErrorField === "period"}
                {...register("period")}
              />
              {firstErrorField === "period" && errors.period && (
                <p className="text-xs text-destructive">{errors.period.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plannedAmount">
                Planned Allocation (₹)
                <RequiredMark />
              </Label>
              <Input
                id="plannedAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="₹5,000.00"
                aria-invalid={firstErrorField === "plannedAmount"}
                {...register("plannedAmount")}
              />
              {firstErrorField === "plannedAmount" && errors.plannedAmount && (
                <p className="text-xs text-destructive">{errors.plannedAmount.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="analyticAccountId">
                Cost Center (Analytic Account)
                <RequiredMark />
              </Label>
              <Controller
                control={control}
                name="analyticAccountId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="analyticAccountId" className="w-full" aria-invalid={firstErrorField === "analyticAccountId"}>
                      <SelectValue placeholder={isLoadingAnalyticAccounts ? "Loading..." : "Select cost center"}>
                        {(selectedId: string) =>
                          analyticAccountsData?.analyticAccounts.find((a) => a.id === selectedId)?.name ??
                          (isLoadingAnalyticAccounts ? "Loading..." : "Select cost center")
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {analyticAccountsData?.analyticAccounts.map((analyticAccount) => (
                        <SelectItem key={analyticAccount.id} value={analyticAccount.id}>
                          {analyticAccount.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {firstErrorField === "analyticAccountId" && errors.analyticAccountId && (
                <p className="text-xs text-destructive">{errors.analyticAccountId.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="responsiblePersonId">
              Budget Owner / Manager
              <RequiredMark />
            </Label>
            <Controller
              control={control}
              name="responsiblePersonId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="responsiblePersonId" className="w-full" aria-invalid={firstErrorField === "responsiblePersonId"}>
                    <SelectValue placeholder={isLoadingUsers ? "Loading..." : "Select responsible manager"}>
                      {(selectedId: string) =>
                        usersData?.users.find((user) => user.id === selectedId)?.name ??
                        (isLoadingUsers ? "Loading..." : "Select responsible manager")
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {usersData?.users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {firstErrorField === "responsiblePersonId" && errors.responsiblePersonId && (
              <p className="text-xs text-destructive">{errors.responsiblePersonId.message}</p>
            )}
          </div>

          <DialogFooter className="mt-2 pt-4 border-t border-border/40 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createBudget.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createBudget.isPending}>
              {createBudget.isPending && <Spinner className="mr-2 size-4" />}
              {createBudget.isPending ? "Saving..." : "Create Budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
