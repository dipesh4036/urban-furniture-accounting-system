"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useContacts } from "@/features/contacts/hooks/useContacts";
import { cn } from "@/lib/utils";

interface CustomerComboboxProps {
  value: string;
  onChange: (contactId: string) => void;
  invalid?: boolean;
}

// A searchable dropdown of Contacts that can act as a customer - type
// CUSTOMER or BOTH (plan.md Module 10: a Sales Order's customer must be
// one of those two). useContacts only filters by a single type, so BOTH
// contacts are fetched and the CUSTOMER/BOTH filter happens here instead.
export function CustomerCombobox({ value, onChange, invalid }: CustomerComboboxProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useContacts({ limit: 100 });

  const customers = (data?.contacts ?? []).filter(
    (contact) => contact.type === "CUSTOMER" || contact.type === "BOTH"
  );
  const selectedCustomer = customers.find((customer) => customer.id === value);

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
            {selectedCustomer?.name ?? (isLoading ? "Loading..." : "Select customer")}
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[var(--anchor-width)] p-0">
        <Command>
          <CommandInput placeholder="Search customers..." />
          <CommandList>
            <CommandEmpty>No customer found.</CommandEmpty>
            <CommandGroup>
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={customer.name}
                  onSelect={() => {
                    onChange(customer.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("size-4", customer.id === value ? "opacity-100" : "opacity-0")} />
                  {customer.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
