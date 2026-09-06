"use client";

import { Package, Pencil, Calendar, Tag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { toFileUrl } from "@/lib/api";
import type { Product } from "../services/products.service";

interface ProductDetailsDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: Product) => void;
}

function formatPrice(value: string | number): string {
  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ProductDetailsDialog({
  product,
  open,
  onOpenChange,
  onEdit,
}: ProductDetailsDialogProps) {
  if (!product) return null;

  const salesPrice = Number(product.salesPrice) || 0;
  const costPrice = Number(product.costPrice) || 0;
  const profitMargin = salesPrice - costPrice;
  const marginPercent = salesPrice > 0 ? ((profitMargin / salesPrice) * 100).toFixed(1) : "0.0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle className="text-xl font-semibold tracking-tight text-foreground line-clamp-1">
              {product.name}
            </DialogTitle>
          </div>
          <DialogDescription>
            Detailed specifications, inventory classification, and pricing metrics.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-2">
          {/* Top Banner: Image & Identity */}
          <div className="flex items-center gap-4 rounded-xl border border-border/80 p-4 bg-muted/20">
            <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-background shadow-xs">
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={toFileUrl(product.image)}
                  alt={product.name}
                  className="size-full object-cover"
                />
              ) : (
                <Package className="size-9 text-primary/70" />
              )}
            </div>

            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <h3 className="font-semibold text-base text-foreground truncate" title={product.name}>
                {product.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={product.type} showDot={false} size="sm" />
                <StatusBadge status={product.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                <Tag className="size-3.5" />
                <span className="font-medium text-foreground">{product.category}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Financial Analysis */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Financial Breakdown
            </span>
            <div className="grid grid-cols-3 gap-3">
              {/* Sales Price */}
              <div className="flex flex-col gap-1 rounded-xl border border-border/70 bg-card p-3.5 shadow-xs">
                <span className="text-[11px] font-medium text-muted-foreground">Sales Price</span>
                <span className="text-base font-bold text-foreground tabular-nums">
                  ₹{formatPrice(salesPrice)}
                </span>
              </div>

              {/* Cost Price */}
              <div className="flex flex-col gap-1 rounded-xl border border-border/70 bg-card p-3.5 shadow-xs">
                <span className="text-[11px] font-medium text-muted-foreground">Cost Price</span>
                <span className="text-base font-semibold text-muted-foreground tabular-nums">
                  ₹{formatPrice(costPrice)}
                </span>
              </div>

              {/* Profit Margin */}
              <div className="flex flex-col gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 shadow-xs">
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                  <TrendingUp className="size-3" />
                  <span>Margin</span>
                </div>
                <span className="text-base font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                  ₹{formatPrice(profitMargin)}
                </span>
                <span className="text-[10px] text-emerald-600/90 dark:text-emerald-400 font-medium">
                  {marginPercent}% markup
                </span>
              </div>
            </div>
          </div>

          {/* Metadata info */}
          <div className="flex flex-col gap-2.5 border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Created Date
              </span>
              <span className="font-medium text-foreground">{formatDate(product.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Last Updated
              </span>
              <span className="font-medium text-foreground">{formatDate(product.updatedAt)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 pt-4 border-t border-border/40 flex flex-row items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onEdit && (
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onEdit(product);
              }}
            >
              <Pencil className="mr-1.5 size-3.5" />
              Edit Product
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
