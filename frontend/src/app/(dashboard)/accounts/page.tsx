"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AccountFormDialog } from "@/features/accounts/components/AccountFormDialog";
import { useAccounts, useUpdateAccount } from "@/features/accounts/hooks/useAccounts";

export default function AccountsPage() {
  const { data, isLoading, isError, refetch } = useAccounts();
  const updateAccount = useUpdateAccount();

  // Archiving is just PATCH /accounts/:id with { isActive: false } - there's
  // no separate archive endpoint (see accounts.service.ts).
  async function handleArchive(id: string) {
    try {
      await updateAccount.mutateAsync({ id, input: { isActive: false } });
      toast.success("Account archived");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Chart of Accounts</h1>
          <p className="text-sm text-muted-foreground">Ledger accounts used to classify transactions.</p>
        </div>

        <AccountFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              New Account
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
          <p className="text-sm text-muted-foreground">Couldn&apos;t load accounts. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.accounts.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No accounts yet.</p>
          <AccountFormDialog trigger={<Button>Create your first account</Button>} />
        </div>
      )}

      {!isLoading && !isError && data && data.accounts.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>{account.type}</TableCell>
                <TableCell>
                  <Badge variant={account.isActive ? "default" : "secondary"}>
                    {account.isActive ? "Active" : "Archived"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <AccountFormDialog account={account} trigger={<Button variant="outline" size="sm">Edit</Button>} />
                    {account.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchive(account.id)}
                        disabled={updateAccount.isPending}
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
