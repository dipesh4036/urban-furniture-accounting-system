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
import { ProductFormDialog } from "@/features/products/components/ProductFormDialog";
import { useArchiveProduct, useProducts } from "@/features/products/hooks/useProducts";

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

  async function handleArchive(id: string) {
    try {
      await archiveProduct.mutateAsync(id);
      toast.success("Product archived");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Goods and services you sell or buy.</p>
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={setView} />
          <ProductFormDialog
            trigger={
              <Button size="sm">
                <Plus className="mr-2 size-4" />
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
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No products yet.</p>
          <ProductFormDialog trigger={<Button size="sm">Create your first product</Button>} />
        </div>
      )}

      {!isLoading && !isError && data && data.products.length > 0 && (
        <>
          {view === "list" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sales Price (₹)</TableHead>
                  <TableHead>Cost (₹)</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.type}</TableCell>
                    <TableCell>₹{formatPrice(product.salesPrice)}</TableCell>
                    <TableCell>₹{formatPrice(product.costPrice)}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Archived"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
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
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {data.products.map((product) => (
                <Card key={product.id} className="flex flex-col justify-between transition-all hover:shadow-md">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Package className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-1">{product.name}</h3>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-[10px]">
                            {product.type}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {product.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-3 text-sm">
                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-2.5">
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground">Sales Price</p>
                        <p className="font-semibold text-foreground">₹{formatPrice(product.salesPrice)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-muted-foreground">Cost Price</p>
                        <p className="font-semibold text-muted-foreground">₹{formatPrice(product.costPrice)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Archived"}
                      </Badge>
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
          )}
        </>
      )}
    </div>
  );
}

