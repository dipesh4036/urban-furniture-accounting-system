"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

export type ViewMode = "list" | "kanban";

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export function ViewToggle({ view, onViewChange, className = "" }: ViewToggleProps) {
  return (
    <div className={cn("inline-flex h-9.5 min-h-[38px] items-center rounded-lg border border-border bg-muted/40 p-0.5 sm:p-1 gap-1 box-border", className)}>
      <Button
        variant={view === "list" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className={cn(
          "h-full min-h-[30px] rounded-md px-2.5 text-xs font-medium transition-all gap-1.5 shadow-none",
          view === "list"
            ? "bg-background shadow-xs text-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="List view"
      >
        <List className="size-3.5" />
        List
      </Button>
      <Button
        variant={view === "kanban" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("kanban")}
        className={cn(
          "h-full min-h-[30px] rounded-md px-2.5 text-xs font-medium transition-all gap-1.5 shadow-none",
          view === "kanban"
            ? "bg-background shadow-xs text-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Kanban view"
      >
        <LayoutGrid className="size-3.5" />
        Kanban
      </Button>
    </div>
  );
}
