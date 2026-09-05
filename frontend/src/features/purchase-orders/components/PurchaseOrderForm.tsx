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

import { cn } from "@/lib/utils";

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

interface PurchaseOrderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  inDialog?: boolean;
}

export function PurchaseOrderForm({ onSuccess, onCancel, inDialog = false }: PurchaseOrderFormProps = {}) {
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
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-5", !inDialog && "rounded-lg border p-6")}>
      {!inDialog && <h2 className="text-base font-semibold tracking-tight">New Purchase Order</h2>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
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
          {errors.vendorId && <p className="text-xs text-destructive">{errors.vendorId.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">
            PO Date
            <RequiredMark />
          </Label>
          <Input id="date" type="date" aria-invalid={!!errors.date} {...register("date")} />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>
      </div>

      {/* PO Line Items */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Purchase Order Items
          </span>
        </div>

          <div className="overflow-x-auto pb-1">
          <div className="flex min-w-[540px] flex-col gap-2">
            <div className="grid grid-cols-[1fr_90px_130px_40px] gap-2 px-1 text-xs font-medium text-muted-foreground">
              <span>
                Product
                <RequiredMark />
              </span>
              <span>
                Qty
                <RequiredMark />
              </span>
              <span>
                Unit Price (₹)
                <RequiredMark />
              </span>
              <span />
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_90px_130px_40px] items-start gap-2">
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
                  placeholder="1"
                  aria-invalid={!!errors.items?.[index]?.quantity}
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />

                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="₹500.00"
                  aria-invalid={!!errors.items?.[index]?.unitPrice}
                  {...register(`items.${index}.unitPrice`)}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                  aria-label="Remove line"
                >
                  <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start mt-1"
              onClick={() => append({ ...emptyPurchaseOrderItem })}
            >
              <Plus className="size-3.5" />
              Add product line
            </Button>

            {errors.items?.root && <p className="text-xs text-destructive">{errors.items.root.message}</p>}
            {errors.items?.message && <p className="text-xs text-destructive">{errors.items.message}</p>}
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm">
        <span className="font-medium text-muted-foreground">Order Total</span>
        <span className="text-base font-semibold tracking-tight">₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>

      <div
        className={cn(
          "flex items-center justify-end gap-2 pt-3",
          inDialog ? "border-t border-border/40" : "self-start"
        )}
      >
        {inDialog && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createPurchaseOrder.isPending}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={createPurchaseOrder.isPending}>
          {createPurchaseOrder.isPending && <Spinner className="mr-2 size-4" />}
          {createPurchaseOrder.isPending ? "Saving..." : "Create Purchase Order"}
        </Button>
      </div>
    </form>
  );
}
