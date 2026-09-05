"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { JournalEntryFormDialog } from "@/features/journal-entries/components/JournalEntryFormDialog";
import { useJournalEntries } from "@/features/journal-entries/hooks/useJournalEntries";

function formatAmount(value: string): string {
  return Number(value).toFixed(2);
}

export default function JournalEntriesPage() {
  const { data, isLoading, isError, refetch } = useJournalEntries();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Journal Entries</h1>
          <p className="text-sm text-muted-foreground">Manual debit/credit entries.</p>
        </div>

        <JournalEntryFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              New Entry
            </Button>
          }
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="size-6" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load journal entries. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.entries.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No journal entries yet.</p>
          <JournalEntryFormDialog trigger={<Button>Create your first entry</Button>} />
        </div>
      )}

      {!isLoading && !isError && data && data.entries.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Lines</TableHead>
              <TableHead className="text-right">Total Debit</TableHead>
              <TableHead className="text-right">Total Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.entries.map((entry) => {
              const totalDebit = entry.items.reduce((sum, item) => sum + Number(item.debit), 0);
              const totalCredit = entry.items.reduce((sum, item) => sum + Number(item.credit), 0);

              return (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{entry.reference}</TableCell>
                  <TableCell>{entry.items.length}</TableCell>
                  <TableCell className="text-right">{formatAmount(totalDebit.toString())}</TableCell>
                  <TableCell className="text-right">{formatAmount(totalCredit.toString())}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
