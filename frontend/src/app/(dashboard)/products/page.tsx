"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductFormDialog } from "@/features/products/components/ProductFormDialog";
import { useArchiveProduct, useProducts } from "@/features/products/hooks/useProducts";

function formatPrice(value: string): string {
  return Number(value).toFixed(2);
}

export default function ProductsPage() {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Goods and services you sell or buy.</p>
        </div>

        <ProductFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              New Product
            </Button>
          }
        />
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
          <ProductFormDialog trigger={<Button>Create your first product</Button>} />
        </div>
      )}

      {!isLoading && !isError && data && data.products.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Sales Price</TableHead>
              <TableHead>Cost</TableHead>
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
                <TableCell>{formatPrice(product.salesPrice)}</TableCell>
                <TableCell>{formatPrice(product.costPrice)}</TableCell>
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
      )}
    </div>
  );
}
