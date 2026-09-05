"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Camera, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RequiredMark } from "@/components/common/RequiredMark";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
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
import { uploadFile } from "@/features/uploads/services/uploads.service";
import { toFileUrl } from "@/lib/api";
import { getFirstErrorField } from "@/lib/formErrors";
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
  salesPrice: "" as unknown as number,
  costPrice: "" as unknown as number,
  category: "",
  image: undefined,
};

function valuesFromProduct(product?: Product): ProductFormValues {
  if (!product) return emptyValues;
  return {
    name: product.name,
    type: product.type,
    salesPrice: Number(product.salesPrice),
    costPrice: Number(product.costPrice),
    category: product.category,
    image: product.image ?? undefined,
  };
}

interface ProductFormDialogProps {
  // Pass a product to edit it. Leave it out to create a new one.
  product?: Product;
  // The element that opens the dialog when clicked (e.g. a <Button>).
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProductFormDialog({
  product,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ProductFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (controlledOnOpenChange) controlledOnOpenChange(val);
    if (!isControlled) setInternalOpen(val);
  };
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!product;

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isSaving = createProduct.isPending || updateProduct.isPending;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: valuesFromProduct(product),
  });

  const productImage = useWatch({ control, name: "image" });
  const firstErrorField = getFirstErrorField(errors);

  // Reset the form back to this product's values (or blank, for create)
  // every time the dialog opens - otherwise a previously edited product's
  // leftover values could show up when creating a new one.
  useEffect(() => {
    if (open) {
      reset(valuesFromProduct(product));
    }
  }, [open, product, reset]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await uploadFile(file);
      setValue("image", url, { shouldValidate: true });
      toast.success("Product image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemovePhoto() {
    setValue("image", undefined, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

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
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {isEditing ? "Edit Product" : "New Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update product specifications, categorization, pricing, and image."
              : "Add a physical good, service, or combo item to your catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex flex-col gap-5">
          {/* Product image uploader */}
          <div className="flex items-center gap-4 rounded-lg border border-dashed border-border/80 p-3.5 bg-muted/20">
            <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background shadow-xs">
              {productImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={toFileUrl(productImage)}
                  alt="Product preview"
                  className="size-full object-cover"
                />
              ) : (
                <Package className="size-7 text-muted-foreground/60" />
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-xs">
                  <Spinner className="size-5 text-primary" />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground">Product Image</span>
              <p className="text-xs text-muted-foreground">
                Optional. PNG, JPG or WEBP (max. 5MB)
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 text-xs"
                >
                  <Camera className="mr-1.5 size-3.5" />
                  {productImage ? "Change image" : "Upload image"}
                </Button>
                {productImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isUploading}
                    onClick={handleRemovePhoto}
                    className="h-7 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-1 size-3.5" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">
                Product Name
                <RequiredMark />
              </Label>
              <Input
                id="name"
                placeholder="e.g. Ergonomic Office Chair"
                aria-invalid={firstErrorField === "name"}
                {...register("name")}
              />
              {firstErrorField === "name" && errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type">
                Product Type
                <RequiredMark />
              </Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="type" className="w-full" aria-invalid={firstErrorField === "type"}>
                      <SelectValue placeholder="Select type" />
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
              {firstErrorField === "type" && errors.type && (
                <p className="text-xs text-destructive">{errors.type.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">
              Category
              <RequiredMark />
            </Label>
            <Input
              id="category"
              placeholder="e.g. Seating, Desks, Storage, Lighting"
              aria-invalid={firstErrorField === "category"}
              {...register("category")}
            />
            {firstErrorField === "category" && errors.category && (
              <p className="text-xs text-destructive">{errors.category.message}</p>
            )}
          </div>

          {/* Pricing & Valuation Section */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="border-t border-border/50 pt-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pricing & Valuation
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="salesPrice">
                  Sales Price (₹)
                  <RequiredMark />
                </Label>
                <Input
                  id="salesPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="₹500.00"
                  aria-invalid={firstErrorField === "salesPrice"}
                  {...register("salesPrice")}
                />
                {firstErrorField === "salesPrice" && errors.salesPrice && (
                  <p className="text-xs text-destructive">{errors.salesPrice.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="costPrice">
                  Cost Price (₹)
                  <RequiredMark />
                </Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="₹300.00"
                  aria-invalid={firstErrorField === "costPrice"}
                  {...register("costPrice")}
                />
                {firstErrorField === "costPrice" && errors.costPrice && (
                  <p className="text-xs text-destructive">{errors.costPrice.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2 pt-4 border-t border-border/40 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving || isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isUploading}>
              {isSaving && <Spinner className="mr-2 size-4" />}
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
