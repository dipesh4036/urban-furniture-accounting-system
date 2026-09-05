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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProduct, useUpdateProduct } from "../hooks/useProducts";
import type { Product, ProductType } from "../services/products.service";
import { productFormSchema, productTypes, type ProductFormValues } from "../validators/products.validator";

const productTypeLabels: Record<ProductType, string> = {
  GOODS: "Goods",
  SERVICE: "Service",
  COMBO: "Combo",
};

const emptyValues: ProductFormValues = {
  name: "",
  type: "" as ProductType,
  salesPrice: 0,
  costPrice: 0,
  category: "",
};

function valuesFromProduct(product?: Product): ProductFormValues {
  if (!product) return emptyValues;
  return {
    name: product.name,
    type: product.type,
    salesPrice: Number(product.salesPrice),
    costPrice: Number(product.costPrice),
    category: product.category,
  };
}

interface ProductFormDialogProps {
  // Pass a product to edit it. Leave it out to create a new one.
  product?: Product;
  // The element that opens the dialog when clicked (e.g. a <Button>).
  // base-ui's DialogTrigger takes over this element's click behavior via
  // its `render` prop instead of Radix's `asChild` pattern.
  trigger: React.ReactElement;
}

export function ProductFormDialog({ product, trigger }: ProductFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!product;

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isSaving = createProduct.isPending || updateProduct.isPending;

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: valuesFromProduct(product),
  });

  // Reset the form back to this product's values (or blank, for create)
  // every time the dialog opens - otherwise a previously edited product's
  // leftover values could show up when creating a new one.
  useEffect(() => {
    if (open) {
      reset(valuesFromProduct(product));
    }
  }, [open, product, reset]);

  async function onSubmit(values: ProductFormValues) {
    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id: product.id, input: values });
        toast.success("Product updated");
      } else {
        await createProduct.mutateAsync(values);
        toast.success("Product created");
      }
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
          <DialogTitle>{isEditing ? "Edit product" : "New product"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              Name
              <RequiredMark />
            </Label>
            <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="type">
              Type
              <RequiredMark />
            </Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="w-full" aria-invalid={!!errors.type}>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {productTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="salesPrice">
                Sales price
                <RequiredMark />
              </Label>
              <Input
                id="salesPrice"
                type="number"
                step="0.01"
                min="0"
                aria-invalid={!!errors.salesPrice}
                {...register("salesPrice")}
              />
              {errors.salesPrice && <p className="text-sm text-destructive">{errors.salesPrice.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="costPrice">
                Cost price
                <RequiredMark />
              </Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                aria-invalid={!!errors.costPrice}
                {...register("costPrice")}
              />
              {errors.costPrice && <p className="text-sm text-destructive">{errors.costPrice.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">
              Category
              <RequiredMark />
            </Label>
            <Input id="category" aria-invalid={!!errors.category} {...register("category")} />
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
