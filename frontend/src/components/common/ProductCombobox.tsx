"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProducts } from "@/features/products/hooks/useProducts";
import { cn } from "@/lib/utils";

interface ProductComboboxProps {
  value: string;
  onChange: (productId: string) => void;
  invalid?: boolean;
}

// A searchable dropdown of Products, for picking a line item on a Sales
// Order or Purchase Order. Same shape as AccountCombobox.
export function ProductCombobox({ value, onChange, invalid }: ProductComboboxProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useProducts({ limit: 100 });

  const products = data?.products ?? [];
  const selectedProduct = products.find((product) => product.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid}
            className="w-full justify-between font-normal"
          >
            {selectedProduct?.name ?? (isLoading ? "Loading..." : "Select product")}
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[var(--anchor-width)] p-0">
        <Command>
          <CommandInput placeholder="Search products..." />
          <CommandList>
            <CommandEmpty>No product found.</CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={() => {
                    onChange(product.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("size-4", product.id === value ? "opacity-100" : "opacity-0")} />
                  {product.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
