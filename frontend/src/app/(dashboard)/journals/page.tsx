"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import { JournalFormDialog } from "@/features/journals/components/JournalFormDialog";
import { useJournals } from "@/features/journals/hooks/useJournals";

export default function JournalsPage() {
  const { data, isLoading, isError, refetch } = useJournals();
  // Journals only store the default account's id, not its name - so we
  // fetch the accounts list too, just to look names up by id for display.
  const { data: accountsData } = useAccounts({ limit: 100 });

  function accountNameFor(accountId: string): string {
    return accountsData?.accounts.find((account) => account.id === accountId)?.name ?? accountId;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Journals</h1>
          <p className="text-sm text-muted-foreground">Sales, purchase, bank, and cash journals.</p>
        </div>

        <JournalFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              New Journal
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
          <p className="text-sm text-muted-foreground">Couldn&apos;t load journals. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.journals.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No journals yet.</p>
          <JournalFormDialog trigger={<Button>Create your first journal</Button>} />
        </div>
      )}

      {!isLoading && !isError && data && data.journals.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Default Account</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.journals.map((journal) => (
              <TableRow key={journal.id}>
                <TableCell className="font-medium">{journal.name}</TableCell>
                <TableCell>{journal.type}</TableCell>
                <TableCell>{accountNameFor(journal.defaultAccountId)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
