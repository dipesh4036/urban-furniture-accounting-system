import { useEffect, useMemo, useState } from "react";

// Server-side counterpart to useDataTable.ts. Instead of filtering an
// already-fetched array client-side, this hook only tracks UI state
// (search text, filters, page, page size) and debounces the search text
// so callers can pass it straight into a React Query hook's params -
// the actual filtering/pagination happens in the database via the
// list endpoint's `search`/`page`/`limit` query params (see e.g.
// backend/src/services/contacts.service.ts's listContacts).
export interface UseServerDataTableOptions<TFilters extends Record<string, string>> {
  defaultPageSize?: number;
  initialFilters?: TFilters;
  debounceMs?: number;
}

export interface UseServerDataTableReturn<TFilters extends Record<string, string>> {
  // What the search input should show right away (not debounced).
  searchInput: string;
  // What should actually be sent to the API (debounced).
  search: string;
  setSearchQuery: (query: string) => void;

  filters: TFilters;
  setFilter: (key: string, value: string) => void;
  resetFilters: () => void;
  isFiltered: boolean;

  currentPage: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

export function useServerDataTable<TFilters extends Record<string, string> = Record<string, string>>({
  defaultPageSize = 10,
  initialFilters = {} as TFilters,
  debounceMs = 400,
}: UseServerDataTableOptions<TFilters> = {}): UseServerDataTableReturn<TFilters> {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFiltersState] = useState<TFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);

  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), debounceMs);
    return () => clearTimeout(timeout);
  }, [searchInput, debounceMs]);

  const setSearchQuery = (query: string) => {
    setSearchInput(query);
    setCurrentPage(1);
  };

  const setFilter = (key: string, value: string) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setFiltersState(initialFilters);
    setCurrentPage(1);
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  };

  const setPage = (page: number) => {
    setCurrentPage(page);
  };

  const isFiltered = useMemo(() => {
    if (search.trim().length > 0) return true;
    for (const [key, val] of Object.entries(filters)) {
      const initialVal = (initialFilters as Record<string, string>)[key] ?? "ALL";
      if (val !== initialVal && val !== "ALL" && val !== "") {
        return true;
      }
    }
    return false;
  }, [search, filters, initialFilters]);

  return {
    searchInput,
    search,
    setSearchQuery,
    filters,
    setFilter,
    resetFilters,
    isFiltered,
    currentPage,
    setPage,
    pageSize,
    setPageSize,
  };
}
