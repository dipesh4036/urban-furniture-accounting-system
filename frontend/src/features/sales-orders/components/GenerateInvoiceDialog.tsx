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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGenerateInvoice } from "../hooks/useSalesOrders";
import { generateInvoiceFormSchema, type GenerateInvoiceFormValues } from "../validators/sales-orders.validator";

interface GenerateInvoiceDialogProps {
  salesOrderId: string;
  trigger: React.ReactElement;
}

export function GenerateInvoiceDialog({ salesOrderId, trigger }: GenerateInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const generateInvoice = useGenerateInvoice();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GenerateInvoiceFormValues>({
    resolver: zodResolver(generateInvoiceFormSchema),
    defaultValues: { invoiceDate: "", dueDate: "" },
  });

  async function onSubmit(values: GenerateInvoiceFormValues) {
    try {
      await generateInvoice.mutateAsync({ id: salesOrderId, input: values });
      toast.success("Invoice generated and emailed to the customer");
      reset();
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
          <DialogTitle>Generate Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="invoiceDate">
              Invoice Date
              <RequiredMark />
            </Label>
            <Input
              id="invoiceDate"
              type="date"
              aria-invalid={!!errors.invoiceDate}
              {...register("invoiceDate")}
            />
            {errors.invoiceDate && <p className="text-sm text-destructive">{errors.invoiceDate.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="dueDate">
              Due Date
              <RequiredMark />
            </Label>
            <Input id="dueDate" type="date" aria-invalid={!!errors.dueDate} {...register("dueDate")} />
            {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={generateInvoice.isPending}>
              {generateInvoice.isPending ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
