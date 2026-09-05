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
import { usePayCustomerInvoice } from "../hooks/useCustomerInvoices";
import {
  paymentFormSchema,
  paymentMethodLabels,
  paymentMethods,
  type PaymentFormValues,
} from "../validators/customer-invoices.validator";

interface RecordPaymentDialogProps {
  invoiceId: string;
  trigger: React.ReactElement;
}

export function RecordPaymentDialog({ invoiceId, trigger }: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const payCustomerInvoice = usePayCustomerInvoice();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { amount: 0, method: "" as never, date: "" },
  });

  const firstErrorField = getFirstErrorField(errors);

  async function onSubmit(values: PaymentFormValues) {
    try {
      await payCustomerInvoice.mutateAsync({ invoiceId, input: values });
      toast.success("Payment recorded successfully");
      reset({ amount: 0, method: "" as never, date: "" });
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
          <DialogTitle className="text-lg font-semibold tracking-tight">Record Payment</DialogTitle>
          <DialogDescription>
            Register incoming payment received from the customer against this invoice.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">
                Payment Amount (₹)
                <RequiredMark />
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                aria-invalid={firstErrorField === "amount"}
                {...register("amount", { valueAsNumber: true })}
              />
              {firstErrorField === "amount" && errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">
                Payment Date
                <RequiredMark />
              </Label>
              <Input id="date" type="date" aria-invalid={firstErrorField === "date"} {...register("date")} />
              {firstErrorField === "date" && errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="method">
              Payment Method
              <RequiredMark />
            </Label>
            <Controller
              control={control}
              name="method"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="method" className="w-full" aria-invalid={firstErrorField === "method"}>
                    <SelectValue placeholder="Select payment method">
                      {(selected: string) =>
                        paymentMethodLabels[selected as keyof typeof paymentMethodLabels] ?? "Select payment method"
                      }
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
            {firstErrorField === "method" && errors.method && (
              <p className="text-xs text-destructive">{errors.method.message}</p>
            )}
          </div>

          <DialogFooter className="mt-2 pt-4 border-t border-border/40 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={payCustomerInvoice.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={payCustomerInvoice.isPending}>
              {payCustomerInvoice.isPending && <Spinner className="mr-2 size-4" />}
              {payCustomerInvoice.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
