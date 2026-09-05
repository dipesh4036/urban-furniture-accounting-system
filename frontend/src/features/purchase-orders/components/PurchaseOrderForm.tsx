"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ProductCombobox } from "@/components/common/ProductCombobox";
import { RequiredMark } from "@/components/common/RequiredMark";
import { VendorCombobox } from "@/components/common/VendorCombobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useCreatePurchaseOrder } from "../hooks/usePurchaseOrders";
import {
  emptyPurchaseOrderItem,
  purchaseOrderFormSchema,
  type PurchaseOrderFormValues,
} from "../validators/purchase-orders.validator";

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function PurchaseOrderForm({ onSuccess }: { onSuccess?: () => void } = {}) {
  const createPurchaseOrder = useCreatePurchaseOrder();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues: {
      vendorId: "",
      date: "",
      items: [{ ...emptyPurchaseOrderItem }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // Watches every line's quantity/unitPrice as the user types, so the
  // total footer updates live - not just when the form is submitted.
  const items = useWatch({ control, name: "items" });
  const total = roundToCents(
    items?.reduce((sum, item) => sum + (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0), 0) ?? 0
  );

  async function onSubmit(values: PurchaseOrderFormValues) {
    try {
      await createPurchaseOrder.mutateAsync(values);
      toast.success("Purchase order created");
      reset({ vendorId: "", date: "", items: [{ ...emptyPurchaseOrderItem }] });
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-lg border p-6">
      <h2 className="text-sm font-semibold">New Purchase Order</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="vendorId">
            Vendor
            <RequiredMark />
          </Label>
          <Controller
            control={control}
            name="vendorId"
            render={({ field }) => (
              <VendorCombobox value={field.value} onChange={field.onChange} invalid={!!errors.vendorId} />
            )}
          />
          {errors.vendorId && <p className="text-sm text-destructive">{errors.vendorId.message}</p>}
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
        <div className="grid grid-cols-[1fr_100px_140px_40px] gap-2 px-1 text-sm font-medium text-muted-foreground">
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
          <span />
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[1fr_100px_140px_40px] items-start gap-2">
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
          onClick={() => append({ ...emptyPurchaseOrderItem })}
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

      <Button type="submit" disabled={createPurchaseOrder.isPending} className="self-start">
        {createPurchaseOrder.isPending && <Spinner />}
        {createPurchaseOrder.isPending ? "Saving..." : "Create Purchase Order"}
      </Button>
    </form>
  );
}
