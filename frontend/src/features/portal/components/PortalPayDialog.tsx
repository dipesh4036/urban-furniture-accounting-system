"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CreditCard, DollarSign } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePayCustomerInvoice } from "@/features/customer-invoices/hooks/useCustomerInvoices";
import {
  paymentFormSchema,
  paymentMethodLabels,
  paymentMethods,
  type PaymentFormValues,
} from "@/features/customer-invoices/validators/customer-invoices.validator";
import { usePayVendorBill } from "@/features/vendor-bills/hooks/useVendorBills";

interface PortalPayDialogProps {
  type: "invoice" | "bill";
  id: string;
  referenceNumber: string;
  balanceDue: number;
  trigger?: React.ReactElement;
  onSuccess?: () => void;
}

export function PortalPayDialog({
  type,
  id,
  referenceNumber,
  balanceDue,
  trigger,
  onSuccess,
}: PortalPayDialogProps) {
  const [open, setOpen] = useState(false);
  const payInvoice = usePayCustomerInvoice();
  const payBill = usePayVendorBill();

  const isPending = payInvoice.isPending || payBill.isPending;

  const today = new Date().toISOString().split("T")[0];

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: balanceDue > 0 ? balanceDue : 0,
      method: "ONLINE",
      date: today,
    },
  });

  async function onSubmit(values: PaymentFormValues) {
    try {
      if (type === "invoice") {
        await payInvoice.mutateAsync({ invoiceId: id, input: values });
        toast.success(`Payment recorded for Invoice ${referenceNumber}`);
      } else {
        await payBill.mutateAsync({ billId: id, input: values });
        toast.success(`Payment recorded for Bill ${referenceNumber}`);
      }

      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment submission failed");
    }
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (newOpen) {
      reset({
        amount: balanceDue > 0 ? balanceDue : 0,
        method: "ONLINE",
        date: today,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              <CreditCard className="size-3.5" />
              Pay Now
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <CreditCard className="size-5 text-primary" />
            Pay {type === "invoice" ? "Invoice" : "Bill"} {referenceNumber}
          </DialogTitle>
          <DialogDescription>
            Enter payment amount and method to settle your {type === "invoice" ? "customer invoice" : "vendor bill"}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
          {/* Summary pill */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border text-sm">
            <span className="text-muted-foreground">Outstanding Balance</span>
            <span className="text-base font-bold text-foreground">
              ${balanceDue.toFixed(2)}
            </span>
          </div>

          {/* Amount input */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount" className="text-xs font-semibold">
              Payment Amount ($)
              <RequiredMark />
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={balanceDue > 0 ? balanceDue : undefined}
              aria-invalid={!!errors.amount}
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Method select */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="method" className="text-xs font-semibold">
              Payment Method
              <RequiredMark />
            </Label>
            <Controller
              control={control}
              name="method"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="method" className="w-full" aria-invalid={!!errors.method}>
                    <SelectValue placeholder="Select method">
                      {(selected: string) =>
                        paymentMethodLabels[selected as keyof typeof paymentMethodLabels] ??
                        "Select method"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((m) => (
                      <SelectItem key={m} value={m}>
                        {paymentMethodLabels[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.method && (
              <p className="text-xs text-destructive">{errors.method.message}</p>
            )}
          </div>

          {/* Date input */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date" className="text-xs font-semibold">
              Payment Date
              <RequiredMark />
            </Label>
            <Input
              id="date"
              type="date"
              aria-invalid={!!errors.date}
              {...register("date")}
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
