"use client";

import { Search, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export interface DataTableFilterOption {
  label: string;
  value: string;
}

export interface DataTableFilterConfig {
  key: string;
  label?: string;
  title?: string;
  placeholder?: string;
  options: DataTableFilterOption[];
  defaultValue?: string;
}

export interface DataTableToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  filters?: DataTableFilterConfig[];
  filterOptions?: DataTableFilterConfig[];
  activeFilters?: Record<string, string>;
  selectedFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  isFiltered?: boolean;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  totalResults?: number;
  filteredCount?: number;
  unfilteredTotal?: number;
  totalCount?: number;
  extraActions?: React.ReactNode;
  className?: string;
}

export function DataTableToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search records...",
  filters,
  filterOptions,
  activeFilters,
  selectedFilters,
  onFilterChange,
  isFiltered,
  hasActiveFilters,
  onResetFilters,
  totalResults,
  filteredCount,
  unfilteredTotal,
  totalCount,
  extraActions,
  className = "",
}: DataTableToolbarProps) {
  const actualFilters = filters ?? filterOptions ?? [];
  const actualActiveFilters = activeFilters ?? selectedFilters ?? {};
  const actualIsFiltered = isFiltered ?? hasActiveFilters ?? false;
  const actualTotalResults = totalResults ?? filteredCount;
  const actualUnfilteredTotal = unfilteredTotal ?? totalCount;

  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      {/* Search and Filters cluster */}
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {/* Search Input - made wider/longer per user request */}
        <div className="relative w-full sm:w-80 md:w-96 lg:w-[380px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 pl-9 pr-8 text-xs bg-background shadow-xs transition-all focus:border-primary/50"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-full"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Dynamic Filters with full label display */}
        {actualFilters.map((filter) => {
          const currentValue = actualActiveFilters[filter.key] ?? filter.defaultValue ?? "ALL";
          const matchedOption = filter.options.find((opt) => opt.value === currentValue);
          const fallbackLabel = filter.title ?? filter.label ?? `All ${filter.key}s`;
          const displayLabel = matchedOption ? matchedOption.label : fallbackLabel;

          return (
            <div key={filter.key} className="flex items-center">
              <Select
                value={currentValue}
                onValueChange={(val) => {
                  if (val !== null) {
                    onFilterChange?.(filter.key, val);
                  }
                }}
              >
                <SelectTrigger className="h-9 min-w-[145px] sm:min-w-[160px] px-3 text-xs bg-background shadow-xs font-normal">
                  <span className="truncate text-left flex-1">{displayLabel}</span>
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}

        {/* Reset Filters Button */}
        {actualIsFiltered && onResetFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80"
          >
            <RotateCcw className="mr-1.5 size-3.5" />
            Reset
          </Button>
        )}

        {/* Filtered Count Badge */}
        {actualIsFiltered && actualTotalResults !== undefined && (
          <Badge variant="secondary" className="text-[11px] font-normal py-1 px-2.5">
            {actualTotalResults} {actualTotalResults === 1 ? "result" : "results"}
            {actualUnfilteredTotal !== undefined && ` (of ${actualUnfilteredTotal})`}
          </Badge>
        )}
      </div>

      {/* Optional Right Action buttons (e.g. view toggle, export) */}
      {extraActions && (
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {extraActions}
        </div>
      )}
    </div>
  );
}


