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
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-4xl p-7">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <PieChartIcon className="size-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground truncate" title={budget.name}>
                  {budget.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate mt-0.5">
                  Fiscal Period: <strong className="text-foreground font-semibold">{budget.period}</strong> • Cost Center: <span className="font-medium text-foreground">{budget.analyticAccount?.name ?? "General"}</span>
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1 text-xs shrink-0">
              Active Target
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Visual Pie Chart */}
          <div className="md:col-span-6 flex flex-col items-center justify-center rounded-2xl border bg-card/60 p-5 shadow-xs">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
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
              <span className="text-sky-600 dark:text-sky-400 font-semibold">Cyan: Achieved ({achievedPct}%)</span> • <span className="text-rose-600 dark:text-rose-400 font-semibold">Red: Balance ({balancePct}%)</span>
            </p>
          </div>

          {/* Right Column: Key Metrics & Breakdown */}
          <div className="md:col-span-6 flex flex-col justify-between gap-3">
            <div className="rounded-xl border bg-muted/30 p-3.5 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Target Planned</span>
                <p className="text-xl font-bold text-foreground tracking-tight">
                  ₹{planned.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-background border">
                <IndianRupee className="size-4 text-muted-foreground" />
              </div>
            </div>

            <div className="rounded-xl border border-sky-500/25 bg-sky-500/5 p-3.5 flex items-center justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">Achieved Realization</span>
                  <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold py-0.5">
                    {achievedPct}%
                  </Badge>
                </div>
                <p className="text-xl font-bold text-sky-600 dark:text-sky-400 tracking-tight mt-0.5">
                  ₹{achieved.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                <TrendingUp className="size-4 text-sky-600 dark:text-sky-400" />
              </div>
            </div>

            <div className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-3.5 flex items-center justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Remaining Balance</span>
                  <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold py-0.5">
                    {balancePct}%
                  </Badge>
                </div>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400 tracking-tight mt-0.5">
                  ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <CheckCircle2 className="size-4 text-rose-600 dark:text-rose-400" />
              </div>
            </div>

            {/* Department & Manager info */}
            <div className="rounded-xl border bg-muted/20 p-3 text-xs flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Tag className="size-3.5 text-muted-foreground" />
                  Cost Center Account:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground truncate max-w-[160px]" title={budget.analyticAccount?.name}>
                    {budget.analyticAccount?.name ?? "-"}
                  </span>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono py-0">
                    {budget.analyticAccount?.type ?? "EXPENSE"}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <User className="size-3.5 text-muted-foreground" />
                  Responsible Manager:
                </span>
                <span className="font-semibold text-foreground truncate max-w-[180px]">
                  {budget.responsiblePerson?.name ?? "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {onOpenFormView && (
          <div className="mt-5 flex justify-end gap-2.5 border-t pt-4">
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
