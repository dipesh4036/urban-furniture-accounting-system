"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { AccountCombobox } from "@/components/common/AccountCombobox";
import { RequiredMark } from "@/components/common/RequiredMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useJournals } from "@/features/journals/hooks/useJournals";
import { useCreateJournalEntry } from "../hooks/useJournalEntries";
import {
  emptyJournalItem,
  journalEntryFormSchema,
  type JournalEntryFormValues,
} from "../validators/journal-entries.validator";

import { cn } from "@/lib/utils";

// Rounds to the nearest cent before comparing debit/credit totals, so a
// floating point rounding error (e.g. 0.1 + 0.2 = 0.30000000000000004)
// never blocks a genuinely balanced entry from being submitted.
function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

interface JournalEntryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  inDialog?: boolean;
}

export function JournalEntryForm({ onSuccess, onCancel, inDialog = false }: JournalEntryFormProps = {}) {
  const { data: journalsData, isLoading: isLoadingJournals } = useJournals({ limit: 100 });
  const createJournalEntry = useCreateJournalEntry();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntryFormSchema),
    defaultValues: {
      journalId: "",
      date: "",
      reference: "",
      // Two separate copies, not the same object twice - sharing one
      // object reference across both array slots is what was causing
      // only 1 row to actually show up.
      items: [{ ...emptyJournalItem }, { ...emptyJournalItem }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // Watches every line's debit/credit as the user types, so the totals
  // footer and the submit button's disabled state update live - not just
  // when the form is submitted.
  const items = useWatch({ control, name: "items" });
  const totalDebit = roundToCents(items?.reduce((sum, item) => sum + (Number(item?.debit) || 0), 0) ?? 0);
  const totalCredit = roundToCents(items?.reduce((sum, item) => sum + (Number(item?.credit) || 0), 0) ?? 0);
  const difference = roundToCents(totalDebit - totalCredit);
  const isBalanced = difference === 0;

  async function onSubmit(values: JournalEntryFormValues) {
    try {
      await createJournalEntry.mutateAsync(values);
      toast.success("Journal entry created");
      reset({ journalId: "", date: "", reference: "", items: [{ ...emptyJournalItem }, { ...emptyJournalItem }] });
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-5", !inDialog && "rounded-lg border p-6")}>
      {!inDialog && <h2 className="text-base font-semibold tracking-tight">New Journal Entry</h2>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="journalId">
            Journal
            <RequiredMark />
          </Label>
          <Controller
            control={control}
            name="journalId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="journalId" className="w-full" aria-invalid={!!errors.journalId}>
                  <SelectValue placeholder={isLoadingJournals ? "Loading..." : "Select journal"}>
                    {(selectedId: string) =>
                      journalsData?.journals.find((journal) => journal.id === selectedId)?.name ??
                      (isLoadingJournals ? "Loading..." : "Select journal")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {journalsData?.journals.map((journal) => (
                    <SelectItem key={journal.id} value={journal.id}>
                      {journal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.journalId && <p className="text-xs text-destructive">{errors.journalId.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">
            Entry Date
            <RequiredMark />
          </Label>
          <Input id="date" type="date" aria-invalid={!!errors.date} {...register("date")} />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reference">
            Reference
            <RequiredMark />
          </Label>
          <Input
            id="reference"
            placeholder="e.g. INV/2026/001"
            aria-invalid={!!errors.reference}
            {...register("reference")}
          />
          {errors.reference && <p className="text-xs text-destructive">{errors.reference.message}</p>}
        </div>
      </div>

      {/* Journal Entry Lines */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Debit & Credit Lines (Double Entry)
          </span>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-[540px] flex-col gap-2">
            <div className="grid grid-cols-[1fr_130px_130px_40px] gap-2 px-1 text-xs font-medium text-muted-foreground">
              <span>
                Account
                <RequiredMark />
              </span>
              <span>
                Debit ($)
                <RequiredMark />
              </span>
              <span>
                Credit ($)
                <RequiredMark />
              </span>
              <span />
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_130px_130px_40px] items-start gap-2">
                <Controller
                  control={control}
                  name={`items.${index}.accountId`}
                  render={({ field: accountField }) => (
                    <AccountCombobox
                      value={accountField.value}
                      onChange={accountField.onChange}
                      invalid={!!errors.items?.[index]?.accountId}
                    />
                  )}
                />

                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  aria-invalid={!!errors.items?.[index]?.debit}
                  {...register(`items.${index}.debit`, { valueAsNumber: true })}
                />

                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  aria-invalid={!!errors.items?.[index]?.credit}
                  {...register(`items.${index}.credit`, { valueAsNumber: true })}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 2}
                  aria-label="Remove line"
                >
                  <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start mt-1"
              onClick={() => append({ ...emptyJournalItem })}
            >
              <Plus className="mr-1.5 size-3.5" />
              Add line
            </Button>

            {errors.items?.root && <p className="text-xs text-destructive">{errors.items.root.message}</p>}
            {errors.items?.message && <p className="text-xs text-destructive">{errors.items.message}</p>}
          </div>
        </div>
      </div>

      {/* Balance Verification Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 p-3.5 text-sm">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Debit</span>
            <span className="font-semibold text-foreground">${totalDebit.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Total Credit</span>
            <span className="font-semibold text-foreground">${totalCredit.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Status:</span>
          {isBalanced ? (
            <span className="inline-flex items-center rounded-md bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
              Balanced (Diff: $0.00)
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-destructive/15 px-2.5 py-1 text-xs font-semibold text-destructive">
              Unbalanced (Diff: ${Math.abs(difference).toFixed(2)})
            </span>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex items-center justify-end gap-2 pt-3",
          inDialog ? "border-t border-border/40" : "self-start"
        )}
      >
        {inDialog && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createJournalEntry.isPending}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!isBalanced || createJournalEntry.isPending}
        >
          {createJournalEntry.isPending && <Spinner className="mr-2 size-4" />}
          {createJournalEntry.isPending ? "Saving..." : "Save Journal Entry"}
        </Button>
      </div>
    </form>
  );
}
