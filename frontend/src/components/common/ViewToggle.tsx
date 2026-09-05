"use client";

import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "list" | "kanban";

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center rounded-lg border bg-muted/40 p-1">
      <Button
        variant={view === "list" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className="h-7 px-2 text-xs"
        aria-label="List view"
      >
        <List className="mr-1.5 size-3.5" />
        List
      </Button>
      <Button
        variant={view === "kanban" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("kanban")}
        className="h-7 px-2 text-xs"
        aria-label="Kanban view"
      >
        <LayoutGrid className="mr-1.5 size-3.5" />
        Kanban
      </Button>
    </div>
  );
}
