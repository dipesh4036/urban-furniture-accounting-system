"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Spinner } from "@/components/ui/spinner";
import { getFirstErrorField } from "@/lib/formErrors";
import { useConvertToBill } from "../hooks/usePurchaseOrders";
import { convertToBillFormSchema, type ConvertToBillFormValues } from "../validators/purchase-orders.validator";

interface ConvertToBillDialogProps {
  purchaseOrderId: string;
  trigger: React.ReactElement;
}

export function ConvertToBillDialog({ purchaseOrderId, trigger }: ConvertToBillDialogProps) {
  const [open, setOpen] = useState(false);
  const convertToBill = useConvertToBill();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConvertToBillFormValues>({
    resolver: zodResolver(convertToBillFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { invoiceDate: "", dueDate: "" },
  });

  const firstErrorField = getFirstErrorField(errors);

  async function onSubmit(values: ConvertToBillFormValues) {
    try {
      await convertToBill.mutateAsync({ id: purchaseOrderId, input: values });
      toast.success("Converted to vendor bill");
      reset();
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
          <DialogTitle className="text-lg font-semibold tracking-tight">Convert to Vendor Bill</DialogTitle>
          <DialogDescription>
            Generate an accounts payable bill from this confirmed purchase order.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invoiceDate">
                Bill Date
                <RequiredMark />
              </Label>
              <Input
                id="invoiceDate"
                type="date"
                aria-invalid={firstErrorField === "invoiceDate"}
                {...register("invoiceDate")}
              />
              {firstErrorField === "invoiceDate" && errors.invoiceDate && (
                <p className="text-xs text-destructive">{errors.invoiceDate.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDate">
                Payment Due Date
                <RequiredMark />
              </Label>
              <Input id="dueDate" type="date" aria-invalid={firstErrorField === "dueDate"} {...register("dueDate")} />
              {firstErrorField === "dueDate" && errors.dueDate && (
                <p className="text-xs text-destructive">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-2 pt-4 border-t border-border/40 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={convertToBill.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={convertToBill.isPending}>
              {convertToBill.isPending && <Spinner className="mr-2 size-4" />}
              {convertToBill.isPending ? "Converting..." : "Convert to Bill"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
