"use client";

import { useState } from "react";
import { Eye, MoreVertical, Package, Pencil, Plus, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { ViewToggle, type ViewMode } from "@/components/common/ViewToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { DataTableEmptyState } from "@/components/common/DataTableEmptyState";
import { ProductFormDialog } from "@/features/products/components/ProductFormDialog";
import { ProductDetailsDialog } from "@/features/products/components/ProductDetailsDialog";
import { useActivateProduct, useDeactivateProduct, useProducts } from "@/features/products/hooks/useProducts";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { toFileUrl } from "@/lib/api";
import { cn } from "cn";
import type { Product, ProductType } from "@/features/products/services/products.service";

function formatPrice(value: string): string {
  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ProductsPage() {
  const [view, setView] = useState<ViewMode>("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [draggedProductId, setDraggedProductId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const {
    searchInput,
    search,
    setSearchQuery,
    filters,
    setFilter,
    resetFilters,
    isFiltered,
    currentPage,
    pageSize,
    setPage,
    setPageSize,
  } = useServerDataTable({
    defaultPageSize: 10,
    initialFilters: { type: "ALL", status: "ALL" },
  });

  // Server-side search/filter/pagination - every keystroke (debounced)
  // and every filter/page change triggers a fresh GET /products request.
  const { data, isLoading, isError, refetch } = useProducts({
    search: search || undefined,
    type: filters.type === "ALL" ? undefined : (filters.type as ProductType),
    status: filters.status === "ALL" ? undefined : (filters.status as "ACTIVE" | "INACTIVE"),
    page: currentPage,
    limit: pageSize,
  });
  const deactivateProduct = useDeactivateProduct();
  const activateProduct = useActivateProduct();

  const totalItems = data?.meta.total || 0;
  const totalPages = data?.meta.totalPages || 0;
  const paginatedData = data?.products || [];
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateProduct.mutateAsync(id);
      toast.success("Product set to inactive");
    } catch {
      toast.error("Failed to deactivate product");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateProduct.mutateAsync(id);
      toast.success("Product set to active");
    } catch {
      toast.error("Failed to activate product");
    }
  };

  // Drag and Drop handlers for Kanban
  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedProductId(id);
  }

  function handleDragEnd() {
    setDraggedProductId(null);
    setDragOverColumn(null);
  }

  function handleDragOver(e: React.DragEvent, columnId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  }

  function handleDragLeave(e: React.DragEvent, columnId: string) {
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  }

  async function handleDrop(e: React.DragEvent, targetStatus: "ACTIVE" | "INACTIVE") {
    e.preventDefault();
    setDragOverColumn(null);
    const id = e.dataTransfer.getData("text/plain") || draggedProductId;
    if (!id) return;

    const product = paginatedData.find((p) => p.id === id);
    if (!product) return;

    if (targetStatus === "ACTIVE" && !product.isActive) {
      await handleActivate(id);
    } else if (targetStatus === "INACTIVE" && product.isActive) {
      await handleDeactivate(id);
    }
    setDraggedProductId(null);
  }

  // Kanban status groups
  const activeProducts = paginatedData.filter((p) => p.isActive);
  const inactiveProducts = paginatedData.filter((p) => !p.isActive);

  function renderProductCard(product: Product) {
    const isDragging = draggedProductId === product.id;

    return (
      <Card
        key={product.id}
        draggable
        onDragStart={(e) => handleDragStart(e, product.id)}
        onDragEnd={handleDragEnd}
        onClick={() => setViewingProduct(product)}
        className={cn(
          "flex flex-col justify-between transition-all hover:shadow-md hover:border-primary/40 group bg-card cursor-grab active:cursor-grabbing",
          isDragging && "opacity-40 ring-2 ring-primary/40 border-dashed"
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2.5 p-3.5">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={toFileUrl(product.image)}
                alt={product.name}
                className="size-10 rounded-lg object-cover border border-border/60 shrink-0"
              />
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Package className="size-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3
                className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors"
                title={product.name}
              >
                {product.name}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <StatusBadge status={product.type} showDot={false} size="sm" />
                <span className="text-[11px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted/60 truncate max-w-[120px]">
                  {product.category}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="size-7 text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <MoreVertical className="size-3.5" />
                    <span className="sr-only">Actions</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setViewingProduct(product)}>
                  <Eye className="size-3.5 mr-2 text-muted-foreground" />
                  <span>View Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                  <Pencil className="size-3.5 mr-2 text-muted-foreground" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {product.isActive ? (
                  <DropdownMenuItem
                    onClick={() => handleDeactivate(product.id)}
                    disabled={deactivateProduct.isPending}
                    className="text-destructive focus:text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
                  >
                    <UserX className="size-3.5 mr-2" />
                    <span>Deactivate</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleActivate(product.id)}
                    disabled={activateProduct.isPending}
                    className="text-emerald-600 focus:text-emerald-600 data-highlighted:bg-emerald-50 dark:data-highlighted:bg-emerald-950/40 data-highlighted:text-emerald-600"
                  >
                    <UserCheck className="size-3.5 mr-2" />
                    <span>Activate</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-3.5 pt-0 text-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Sales Price:</span>
            <span className="font-semibold text-foreground tabular-nums">₹{formatPrice(product.salesPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Cost:</span>
            <span className="text-muted-foreground tabular-nums">₹{formatPrice(product.costPrice)}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Goods and services you sell or buy.</p>
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={setView} />
          <ProductFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                New Product
              </Button>
            }
          />
        </div>
      </div>

      {/* Controlled View Product Details Modal */}
      <ProductDetailsDialog
        product={viewingProduct}
        open={!!viewingProduct}
        onOpenChange={(open) => {
          if (!open) setViewingProduct(null);
        }}
        onEdit={(product) => setEditingProduct(product)}
      />

      {/* Controlled Edit Product Modal */}
      <ProductFormDialog
        product={editingProduct ?? undefined}
        open={!!editingProduct}
        onOpenChange={(open) => {
          if (!open) setEditingProduct(null);
        }}
      />

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load products. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.products.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No products yet.</p>
          <ProductFormDialog trigger={<Button size="sm">Create your first product</Button>} />
        </div>
      )}

      {!isLoading && !isError && data && data.products.length > 0 && (
        <div className="flex flex-col gap-4">
          <DataTableToolbar
            searchQuery={searchInput}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search products by name, category, or type..."
            filters={[
              {
                key: "type",
                label: "All Types",
                options: [
                  { label: "All Types", value: "ALL" },
                  { label: "Goods", value: "GOODS" },
                  { label: "Service", value: "SERVICE" },
                ],
              },
              {
                key: "status",
                label: "All Statuses",
                options: [
                  { label: "All Statuses", value: "ALL" },
                  { label: "Active", value: "ACTIVE" },
                  { label: "Inactive", value: "INACTIVE" },
                ],
              },
            ]}
            activeFilters={filters}
            onFilterChange={setFilter}
            isFiltered={isFiltered}
            onResetFilters={resetFilters}
            totalResults={totalItems}
            unfilteredTotal={totalItems}
          />

          {paginatedData.length === 0 ? (
            <DataTableEmptyState onReset={resetFilters} />
          ) : (
            <>
              {view === "list" ? (
                <div className="w-full rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[180px]">Product Name</TableHead>
                        <TableHead className="w-[110px]">Type</TableHead>
                        <TableHead className="w-[130px] text-right">Sales Price (₹)</TableHead>
                        <TableHead className="w-[140px] text-right pr-6">Cost (₹)</TableHead>
                        <TableHead className="min-w-[140px] pl-6">Category</TableHead>
                        <TableHead className="w-[110px]">Status</TableHead>
                        <TableHead className="w-[90px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="max-w-[220px]">
                            <div className="flex items-center gap-3 min-w-0">
                              {product.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={toFileUrl(product.image)}
                                  alt={product.name}
                                  className="size-9 rounded-lg object-cover border border-border/60 shrink-0"
                                />
                              ) : (
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-xs border border-border/40">
                                  <Package className="size-4.5 text-primary/70" />
                                </div>
                              )}
                              <span className="font-semibold text-foreground truncate" title={product.name}>
                                {product.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={product.type} showDot={false} size="sm" />
                          </TableCell>
                          <TableCell className="text-right font-medium text-foreground tabular-nums">
                            ₹{formatPrice(product.salesPrice)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground tabular-nums pr-6">
                            ₹{formatPrice(product.costPrice)}
                          </TableCell>
                          <TableCell className="text-muted-foreground pl-6">
                            <span className="truncate block max-w-[150px]" title={product.category}>
                              {product.category}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={product.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                onClick={() => setViewingProduct(product)}
                                title="View Details"
                              >
                                <Eye className="size-4" />
                                <span className="sr-only">View Details</span>
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                    >
                                      <MoreVertical className="size-4" />
                                      <span className="sr-only">Actions</span>
                                    </Button>
                                  }
                                />
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuItem onClick={() => setViewingProduct(product)}>
                                    <Eye className="size-3.5 mr-2 text-muted-foreground" />
                                    <span>View Details</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                                    <Pencil className="size-3.5 mr-2 text-muted-foreground" />
                                    <span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {product.isActive ? (
                                    <DropdownMenuItem
                                      onClick={() => handleDeactivate(product.id)}
                                      disabled={deactivateProduct.isPending}
                                      className="text-destructive focus:text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
                                    >
                                      <UserX className="size-3.5 mr-2" />
                                      <span>Deactivate</span>
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => handleActivate(product.id)}
                                      disabled={activateProduct.isPending}
                                      className="text-emerald-600 focus:text-emerald-600 data-highlighted:bg-emerald-50 dark:data-highlighted:bg-emerald-950/40 data-highlighted:text-emerald-600"
                                    >
                                      <UserCheck className="size-3.5 mr-2" />
                                      <span>Activate</span>
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <DataTablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Kanban Status Board with Drag and Drop */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Column 1: Active */}
                    <div
                      onDragOver={(e) => handleDragOver(e, "ACTIVE")}
                      onDragLeave={(e) => handleDragLeave(e, "ACTIVE")}
                      onDrop={(e) => handleDrop(e, "ACTIVE")}
                      className={cn(
                        "flex flex-col gap-3 rounded-xl border p-4 transition-all min-h-[420px]",
                        dragOverColumn === "ACTIVE"
                          ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/30"
                          : "border-border/70 bg-muted/20"
                      )}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-emerald-500" />
                          <h3 className="font-semibold text-sm text-foreground">Active</h3>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            {activeProducts.length}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium">Drop to activate</span>
                      </div>

                      <div className="flex flex-col gap-3 flex-1">
                        {activeProducts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center flex-1 rounded-lg border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground">
                            No active products
                          </div>
                        ) : (
                          activeProducts.map((product) => renderProductCard(product))
                        )}
                      </div>
                    </div>

                    {/* Column 2: Inactive */}
                    <div
                      onDragOver={(e) => handleDragOver(e, "INACTIVE")}
                      onDragLeave={(e) => handleDragLeave(e, "INACTIVE")}
                      onDrop={(e) => handleDrop(e, "INACTIVE")}
                      className={cn(
                        "flex flex-col gap-3 rounded-xl border p-4 transition-all min-h-[420px]",
                        dragOverColumn === "INACTIVE"
                          ? "border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 ring-2 ring-rose-500/30"
                          : "border-border/70 bg-muted/20"
                      )}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-rose-500" />
                          <h3 className="font-semibold text-sm text-foreground">Inactive</h3>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                            {inactiveProducts.length}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium">Drop to deactivate</span>
                      </div>

                      <div className="flex flex-col gap-3 flex-1">
                        {inactiveProducts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center flex-1 rounded-lg border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground">
                            No inactive products
                          </div>
                        ) : (
                          inactiveProducts.map((product) => renderProductCard(product))
                        )}
                      </div>
                    </div>
                  </div>

                  <DataTablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    className="border bg-card rounded-lg"
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
