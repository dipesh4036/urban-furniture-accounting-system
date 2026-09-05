"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BudgetFormDialog } from "@/features/budgets/components/BudgetFormDialog";
import { useBudgets } from "@/features/budgets/hooks/useBudgets";

export default function BudgetsPage() {
  const { data, isLoading, isError, refetch } = useBudgets();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted-foreground">Planned vs actual spend.</p>
        </div>

        <BudgetFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              New Budget
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
          <p className="text-sm text-muted-foreground">Couldn&apos;t load budgets. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.budgets.length === 0 && (
        <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
          No budgets yet. Create the first one above.
        </p>
      )}

      {!isLoading && !isError && data && data.budgets.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Analytic Account</TableHead>
              <TableHead>Responsible Person</TableHead>
              <TableHead className="text-right">Planned Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.budgets.map((budget) => (
              <TableRow key={budget.id}>
                <TableCell className="font-medium">{budget.name}</TableCell>
                <TableCell>{budget.period}</TableCell>
                <TableCell>{budget.analyticAccount.name}</TableCell>
                <TableCell>{budget.responsiblePerson.name}</TableCell>
                <TableCell className="text-right">{Number(budget.plannedAmount).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
