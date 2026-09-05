"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { cn } from "@/lib/utils";

interface AccountComboboxProps {
  value: string;
  onChange: (accountId: string) => void;
  invalid?: boolean;
}

// A searchable dropdown of Chart of Accounts entries, so picking the
// right one doesn't mean scrolling through a long plain list. Fetches up
// to 100 accounts (the backend's pagination cap) - the Chart of Accounts
// is expected to stay well under that. Shared by any form that needs to
// pick an account (Journal's Default Account, each Journal Entry line).
export function AccountCombobox({ value, onChange, invalid }: AccountComboboxProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useAccounts({ limit: 100 });

  const accounts = data?.accounts ?? [];
  const selectedAccount = accounts.find((account) => account.id === value);

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
            {selectedAccount?.name ?? (isLoading ? "Loading..." : "Select account")}
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[var(--anchor-width)] p-0">
        <Command>
          <CommandInput placeholder="Search accounts..." />
          <CommandList>
            <CommandEmpty>No account found.</CommandEmpty>
            <CommandGroup>
              {accounts.map((account) => (
                <CommandItem
                  key={account.id}
                  value={account.name}
                  onSelect={() => {
                    onChange(account.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("size-4", account.id === value ? "opacity-100" : "opacity-0")} />
                  {account.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
