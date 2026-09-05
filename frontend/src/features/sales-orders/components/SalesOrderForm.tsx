"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { CustomerCombobox } from "@/components/common/CustomerCombobox";
import { ProductCombobox } from "@/components/common/ProductCombobox";
import { RequiredMark } from "@/components/common/RequiredMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useCreateSalesOrder } from "../hooks/useSalesOrders";
import {
  emptySalesOrderItem,
  salesOrderFormSchema,
  type SalesOrderFormValues,
} from "../validators/sales-orders.validator";

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function SalesOrderForm({ onSuccess }: { onSuccess?: () => void } = {}) {
  const createSalesOrder = useCreateSalesOrder();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SalesOrderFormValues>({
    resolver: zodResolver(salesOrderFormSchema),
    defaultValues: {
      customerId: "",
      date: "",
      items: [{ ...emptySalesOrderItem }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // Watches every line's quantity/unitPrice/tax as the user types, so the
  // total footer updates live - not just when the form is submitted.
  const items = useWatch({ control, name: "items" });
  const total = roundToCents(
    items?.reduce(
      (sum, item) => sum + (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0) + (Number(item?.tax) || 0),
      0
    ) ?? 0
  );

  async function onSubmit(values: SalesOrderFormValues) {
    try {
      await createSalesOrder.mutateAsync(values);
      toast.success("Sales order created");
      reset({ customerId: "", date: "", items: [{ ...emptySalesOrderItem }] });
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-lg border p-6">
      <h2 className="text-sm font-semibold">New Sales Order</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="customerId">
            Customer
            <RequiredMark />
          </Label>
          <Controller
            control={control}
            name="customerId"
            render={({ field }) => (
              <CustomerCombobox value={field.value} onChange={field.onChange} invalid={!!errors.customerId} />
            )}
          />
          {errors.customerId && <p className="text-sm text-destructive">{errors.customerId.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="date">
            Date
            <RequiredMark />
          </Label>
          <Input id="date" type="date" aria-invalid={!!errors.date} {...register("date")} />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-[1fr_90px_120px_100px_40px] gap-2 px-1 text-sm font-medium text-muted-foreground">
          <span>
            Product
            <RequiredMark />
          </span>
          <span>
            Quantity
            <RequiredMark />
          </span>
          <span>
            Unit Price
            <RequiredMark />
          </span>
          <span>
            Tax
            <RequiredMark />
          </span>
          <span />
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[1fr_90px_120px_100px_40px] items-start gap-2">
            <Controller
              control={control}
              name={`items.${index}.productId`}
              render={({ field: productField }) => (
                <ProductCombobox
                  value={productField.value}
                  onChange={productField.onChange}
                  invalid={!!errors.items?.[index]?.productId}
                />
              )}
            />

            <Input
              type="number"
              step="1"
              min="1"
              aria-invalid={!!errors.items?.[index]?.quantity}
              {...register(`items.${index}.quantity`, { valueAsNumber: true })}
            />

            <Input
              type="number"
              step="0.01"
              min="0"
              aria-invalid={!!errors.items?.[index]?.unitPrice}
              {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
            />

            <Input
              type="number"
              step="0.01"
              min="0"
              aria-invalid={!!errors.items?.[index]?.tax}
              {...register(`items.${index}.tax`, { valueAsNumber: true })}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              disabled={fields.length <= 1}
              aria-label="Remove line"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => append({ ...emptySalesOrderItem })}
        >
          <Plus className="size-4" />
          Add product
        </Button>

        {errors.items?.root && <p className="text-sm text-destructive">{errors.items.root.message}</p>}
        {errors.items?.message && <p className="text-sm text-destructive">{errors.items.message}</p>}
      </div>

      <div className="flex justify-between gap-8 self-end border-t pt-1 text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-medium">{total.toFixed(2)}</span>
      </div>

      <Button type="submit" disabled={createSalesOrder.isPending} className="self-start">
        {createSalesOrder.isPending && <Spinner />}
        {createSalesOrder.isPending ? "Saving..." : "Create Sales Order"}
      </Button>
    </form>
  );
}
