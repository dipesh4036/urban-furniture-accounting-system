"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useContacts } from "@/features/contacts/hooks/useContacts";
import { cn } from "@/lib/utils";

interface VendorComboboxProps {
  value: string;
  onChange: (contactId: string) => void;
  invalid?: boolean;
}

// A searchable dropdown of Contacts that can act as a vendor - type
// VENDOR or BOTH (plan.md Module 9: a Purchase Order's vendor must be
// one of those two). useContacts only filters by a single type, so BOTH
// contacts are fetched and the VENDOR/BOTH filter happens here instead.
export function VendorCombobox({ value, onChange, invalid }: VendorComboboxProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useContacts({ limit: 100 });

  const vendors = (data?.contacts ?? []).filter((contact) => contact.type === "VENDOR" || contact.type === "BOTH");
  const selectedVendor = vendors.find((vendor) => vendor.id === value);

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
            {selectedVendor?.name ?? (isLoading ? "Loading..." : "Select vendor")}
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[var(--anchor-width)] p-0">
        <Command>
          <CommandInput placeholder="Search vendors..." />
          <CommandList>
            <CommandEmpty>No vendor found.</CommandEmpty>
            <CommandGroup>
              {vendors.map((vendor) => (
                <CommandItem
                  key={vendor.id}
                  value={vendor.name}
                  onSelect={() => {
                    onChange(vendor.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("size-4", vendor.id === value ? "opacity-100" : "opacity-0")} />
                  {vendor.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
