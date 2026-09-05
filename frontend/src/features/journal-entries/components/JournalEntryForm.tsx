"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { AccountCombobox } from "@/components/common/AccountCombobox";
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

// Rounds to the nearest cent before comparing debit/credit totals, so a
// floating point rounding error (e.g. 0.1 + 0.2 = 0.30000000000000004)
// never blocks a genuinely balanced entry from being submitted.
function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function JournalEntryForm() {
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-lg border p-6">
      <h2 className="text-sm font-semibold">New Journal Entry</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="journalId">Journal</Label>
          <Controller
            control={control}
            name="journalId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="journalId" className="w-full" aria-invalid={!!errors.journalId}>
                  {/*
                    SelectValue can only show a label by matching the
                    selected value against an `items` list passed to
                    Select itself - it does NOT read the text inside
                    <SelectItem> children. Without this render-function
                    form, it falls back to printing the raw value (here,
                    the journal's id) instead of its name.
                  */}
                  <SelectValue placeholder={isLoadingJournals ? "Loading..." : "Select a journal"}>
                    {(selectedId: string) =>
                      journalsData?.journals.find((journal) => journal.id === selectedId)?.name ??
                      (isLoadingJournals ? "Loading..." : "Select a journal")
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
          {errors.journalId && <p className="text-sm text-destructive">{errors.journalId.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" aria-invalid={!!errors.date} {...register("date")} />
          {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="reference">Reference</Label>
          <Input id="reference" aria-invalid={!!errors.reference} {...register("reference")} />
          {errors.reference && <p className="text-sm text-destructive">{errors.reference.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-[1fr_140px_140px_40px] gap-2 px-1 text-sm font-medium text-muted-foreground">
          <span>Account</span>
          <span>Debit</span>
          <span>Credit</span>
          <span />
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[1fr_140px_140px_40px] items-start gap-2">
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
              aria-invalid={!!errors.items?.[index]?.debit}
              {...register(`items.${index}.debit`, { valueAsNumber: true })}
            />

            <Input
              type="number"
              step="0.01"
              min="0"
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
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => append({ ...emptyJournalItem })}
        >
          <Plus className="size-4" />
          Add line
        </Button>

        {errors.items?.root && <p className="text-sm text-destructive">{errors.items.root.message}</p>}
        {errors.items?.message && <p className="text-sm text-destructive">{errors.items.message}</p>}
      </div>

      <div className="flex flex-col gap-1 self-end text-sm">
        <div className="flex justify-between gap-8">
          <span className="text-muted-foreground">Total Debit</span>
          <span className="font-medium">{totalDebit.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="text-muted-foreground">Total Credit</span>
          <span className="font-medium">{totalCredit.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-8 border-t pt-1">
          <span className="text-muted-foreground">Difference</span>
          <span className={isBalanced ? "font-medium text-success" : "font-medium text-destructive"}>
            {difference.toFixed(2)}
          </span>
        </div>
      </div>

      <Button type="submit" disabled={!isBalanced || createJournalEntry.isPending} className="self-start">
        {createJournalEntry.isPending && <Spinner />}
        {createJournalEntry.isPending ? "Saving..." : "Save Journal Entry"}
      </Button>
    </form>
  );
}
