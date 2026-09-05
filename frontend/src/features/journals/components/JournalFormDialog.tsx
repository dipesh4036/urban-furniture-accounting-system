"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { useCreateJournal } from "../hooks/useJournals";
import { journalFormSchema, journalTypes, type JournalFormValues } from "../validators/journals.validator";

const journalTypeLabels: Record<JournalFormValues["type"], string> = {
  SALES: "Sales",
  PURCHASE: "Purchase",
  BANK: "Bank",
  CASH: "Cash",
};

interface JournalFormDialogProps {
  trigger: React.ReactElement;
}

export function JournalFormDialog({ trigger }: JournalFormDialogProps) {
  const [open, setOpen] = useState(false);
  const createJournal = useCreateJournal();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JournalFormValues>({
    resolver: zodResolver(journalFormSchema),
    defaultValues: { name: "", type: "" as JournalFormValues["type"], defaultAccountId: "" },
  });

  async function onSubmit(values: JournalFormValues) {
    try {
      await createJournal.mutateAsync(values);
      toast.success("Journal created");
      reset({ name: "", type: "" as JournalFormValues["type"], defaultAccountId: "" });
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          reset({ name: "", type: "" as JournalFormValues["type"], defaultAccountId: "" });
        }
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New journal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="w-full" aria-invalid={!!errors.type}>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {journalTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {journalTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="defaultAccountId">Default Account</Label>
            <Controller
              control={control}
              name="defaultAccountId"
              render={({ field }) => <AccountCombobox value={field.value} onChange={field.onChange} />}
            />
            {errors.defaultAccountId && (
              <p className="text-sm text-destructive">{errors.defaultAccountId.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createJournal.isPending}>
              {createJournal.isPending && <Spinner />}
              {createJournal.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// A searchable dropdown of Chart of Accounts entries, so picking the
// right one doesn't mean scrolling through a long plain list. Fetches up
// to 100 accounts (the backend's pagination cap) - the Chart of Accounts
// is expected to stay well under that.
function AccountCombobox({ value, onChange }: { value: string; onChange: (id: string) => void }) {
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
            className="w-full justify-between font-normal"
          >
            {selectedAccount?.name ?? (isLoading ? "Loading accounts..." : "Select an account")}
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
