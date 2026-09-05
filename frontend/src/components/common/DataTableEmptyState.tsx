"use client";

import type { LucideIcon } from "lucide-react";
import { SearchX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DataTableEmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  onReset?: () => void;
  onClear?: () => void;
  className?: string;
}

export function DataTableEmptyState({
  icon: CustomIcon,
  title = "No matching records found",
  description = "No results match your search and filter criteria. Try adjusting your query or resetting filters.",
  onReset,
  onClear,
  className = "",
}: DataTableEmptyStateProps) {
  const IconComponent = CustomIcon ?? SearchX;
  const handleReset = onReset ?? onClear;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 p-8 text-center bg-muted/20 ${className}`}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-muted/60 text-muted-foreground ring-1 ring-border/50">
        <IconComponent className="size-5" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {handleReset && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="mt-2 text-xs"
        >
          <RotateCcw className="mr-1.5 size-3.5" />
          Clear All Filters
        </Button>
      )}
    </div>
  );
}

