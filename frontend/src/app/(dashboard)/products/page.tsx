"use client";

import { useState } from "react";
import { Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { ViewToggle, type ViewMode } from "@/components/common/ViewToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { DataTableEmptyState } from "@/components/common/DataTableEmptyState";
import { ProductFormDialog } from "@/features/products/components/ProductFormDialog";
import { useArchiveProduct, useProducts } from "@/features/products/hooks/useProducts";
import { useDataTable } from "@/hooks/useDataTable";
import type { Product } from "@/features/products/services/products.service";

function formatPrice(value: string): string {
  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ProductsPage() {
  const [view, setView] = useState<ViewMode>("list");
  const { data, isLoading, isError, refetch } = useProducts();
  const archiveProduct = useArchiveProduct();

  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    resetFilters,
    isFiltered,
    currentPage,
    pageSize,
    setPage,
    setPageSize,
    totalItems,
    totalPages,
    paginatedData,
    startIndex,
    endIndex,
  } = useDataTable<Product>({
    data: data?.products,
    defaultPageSize: 10,
    searchFields: ["name", "category", "type"],
    initialFilters: { type: "ALL", status: "ALL" },
    filterPredicate: (item: Product, activeFilters: Record<string, string>) => {
      if (activeFilters.type && activeFilters.type !== "ALL" && item.type !== activeFilters.type) {
        return false;
      }
      if (activeFilters.status && activeFilters.status !== "ALL") {
        if (activeFilters.status === "ACTIVE" && !item.isActive) return false;
        if (activeFilters.status === "ARCHIVED" && item.isActive) return false;
      }
      return true;
    },
  });

  const handleArchive = async (id: string) => {
    try {
      await archiveProduct.mutateAsync(id);
      toast.success("Product archived");
    } catch {
      toast.error("Failed to archive product");
    }
  };

  return (
    <div className="flex flex-col gap-6">
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
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search products by name, category, or type..."
            filterOptions={[
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
                  { label: "Archived", value: "ARCHIVED" },
                ],
              },
            ]}
            selectedFilters={filters}
            onFilterChange={setFilter}
            isFiltered={isFiltered}
            onResetFilters={resetFilters}
            totalResults={totalItems}
            unfilteredTotal={data.products.length}
          />

          {paginatedData.length === 0 ? (
            <DataTableEmptyState onReset={resetFilters} />
          ) : (
            <>
              {view === "list" ? (
                <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Sales Price (₹)</TableHead>
                        <TableHead className="text-right">Cost (₹)</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-semibold text-foreground">{product.name}</TableCell>
                          <TableCell>
                            <StatusBadge status={product.type} showDot={false} size="sm" />
                          </TableCell>
                          <TableCell className="text-right font-medium text-foreground tabular-nums">
                            ₹{formatPrice(product.salesPrice)}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground tabular-nums">
                            ₹{formatPrice(product.costPrice)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{product.category}</TableCell>
                          <TableCell>
                            <StatusBadge status={product.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <ProductFormDialog product={product} trigger={<Button variant="outline" size="sm">Edit</Button>} />
                              {product.isActive && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleArchive(product.id)}
                                  disabled={archiveProduct.isPending}
                                >
                                  Archive
                                </Button>
                              )}
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paginatedData.map((product) => (
                      <Card key={product.id} className="flex flex-col justify-between transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Package className="size-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                <StatusBadge status={product.type} showDot={false} size="sm" />
                                <span className="text-[11px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted/60">
                                  {product.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 pb-3 text-sm">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Sales Price:</span>
                            <span className="font-semibold text-foreground tabular-nums">₹{formatPrice(product.salesPrice)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Cost:</span>
                            <span className="text-muted-foreground tabular-nums">₹{formatPrice(product.costPrice)}</span>
                          </div>
                          <div className="pt-1">
                            <StatusBadge status={product.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 border-t pt-3">
                          <ProductFormDialog
                            product={product}
                            trigger={
                              <Button variant="outline" size="sm" className="h-8 text-xs">
                                Edit
                              </Button>
                            }
                          />
                          {product.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleArchive(product.id)}
                              disabled={archiveProduct.isPending}
                            >
                              Archive
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
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
