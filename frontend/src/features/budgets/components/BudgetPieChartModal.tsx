"use client";

import { CheckCircle2, IndianRupee, PieChart as PieChartIcon, TrendingUp, User, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BudgetPieChart } from "./BudgetPieChart";
import type { Budget } from "../services/budgets.service";

interface BudgetPieChartModalProps {
  budget: Budget | null;
  achievedAmount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenFormView?: (budget: Budget) => void;
}

export function BudgetPieChartModal({
  budget,
  achievedAmount,
  open,
  onOpenChange,
  onOpenFormView,
}: BudgetPieChartModalProps) {
  if (!budget) return null;

  const planned = Number(budget.plannedAmount) || 0;
  const achieved = Math.max(0, achievedAmount);
  const balance = Math.max(0, planned - achieved);
  const achievedPct = planned > 0 ? Math.min(100, Math.round((achieved / planned) * 100)) : 0;
  const balancePct = Math.max(0, 100 - achievedPct);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <PieChartIcon className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  {budget.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Budget Performance & Allocation Breakdown • Fiscal Period: {budget.period}
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-0.5">
              Confirm
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-4 flex flex-col items-center gap-6">
          {/* Main Visual: Pie Chart faithfully styled after user drawing */}
          <div className="flex flex-col items-center rounded-xl border bg-card/60 p-6 shadow-xs w-full">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Budget Realization (Achieved vs Balance)
            </h4>

            <BudgetPieChart
              plannedAmount={planned}
              achievedAmount={achieved}
              size="lg"
              showLabels={true}
              showLegend={true}
              interactive={true}
            />

            <p className="mt-3 text-[11px] text-muted-foreground italic text-center">
              Cyan hatched slice represents <strong className="text-sky-600 dark:text-sky-400 font-semibold">Achieved</strong> spend/revenue; Red hatched slice represents the unspent <strong className="text-rose-600 dark:text-rose-400 font-semibold">Balance</strong>.
            </p>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 w-full">
            <div className="rounded-lg border bg-muted/30 p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Planned Total</span>
                <IndianRupee className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-2">
                <p className="text-lg font-bold tracking-tight text-foreground">
                  ₹{planned.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] text-muted-foreground">Target Budget</span>
              </div>
            </div>

            <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-medium text-sky-600 dark:text-sky-400">
                <span>Achieved</span>
                <TrendingUp className="size-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="mt-2">
                <p className="text-lg font-bold tracking-tight text-sky-600 dark:text-sky-400">
                  ₹{achieved.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] font-semibold text-sky-600/80">
                  {achievedPct}% Realized
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-medium text-rose-600 dark:text-rose-400">
                <span>Balance</span>
                <CheckCircle2 className="size-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="mt-2">
                <p className="text-lg font-bold tracking-tight text-rose-600 dark:text-rose-400">
                  ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] font-semibold text-rose-600/80">
                  {balancePct}% Remaining
                </span>
              </div>
            </div>
          </div>

          {/* Details footer */}
          <div className="rounded-lg border bg-muted/20 p-4 w-full text-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Cost Center:</span>
              <span className="font-semibold text-foreground">{budget.analyticAccount?.name ?? "-"}</span>
              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                {budget.analyticAccount?.type ?? "EXPENSE"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Responsible:</span>
              <span className="font-semibold text-foreground">{budget.responsiblePerson?.name ?? "-"}</span>
            </div>
          </div>
        </div>

        {onOpenFormView && (
          <div className="mt-6 flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                onOpenChange(false);
                onOpenFormView(budget);
              }}
            >
              Open Form View
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
