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
import { usePayVendorBill } from "../hooks/useVendorBills";
import { paymentFormSchema, paymentMethods, paymentMethodLabels, type PaymentFormValues } from "../validators/vendor-bills.validator";

interface RecordPaymentDialogProps {
  billId: string;
  trigger: React.ReactElement;
}

export function RecordPaymentDialog({ billId, trigger }: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const payVendorBill = usePayVendorBill();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { amount: 0, method: "" as never, date: "" },
  });

  async function onSubmit(values: PaymentFormValues) {
    try {
      await payVendorBill.mutateAsync({ billId, input: values });
      toast.success("Payment recorded");
      reset({ amount: 0, method: "" as never, date: "" });
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
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">
              Amount
              <RequiredMark />
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              aria-invalid={!!errors.amount}
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="method">
              Method
              <RequiredMark />
            </Label>
            <Controller
              control={control}
              name="method"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="method" className="w-full" aria-invalid={!!errors.method}>
                    {/*
                      base-ui's SelectValue only shows a label by matching
                      the value against a render function - it doesn't
                      read SelectItem's children, or it prints the raw
                      enum value instead (see base-ui-select-label-bug).
                    */}
                    <SelectValue placeholder="Select a method">
                      {(selected: string) => paymentMethodLabels[selected as keyof typeof paymentMethodLabels] ?? "Select a method"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method} value={method}>
                        {paymentMethodLabels[method]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.method && <p className="text-sm text-destructive">{errors.method.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="date">
              Date
              <RequiredMark />
            </Label>
            <Input id="date" type="date" aria-invalid={!!errors.date} {...register("date")} />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={payVendorBill.isPending}>
              {payVendorBill.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
