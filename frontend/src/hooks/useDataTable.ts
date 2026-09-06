import { useMemo, useState } from "react";

export interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  defaultValue?: string;
}

export interface UseDataTableOptions<T> {
  data: T[] | undefined | null;
  defaultPageSize?: number;
  searchFields?: (keyof T | string | ((item: T) => string | number | null | undefined))[];
  initialFilters?: Record<string, string>;
  filterPredicate?: (item: T, filters: Record<string, string>) => boolean;
  sortPredicate?: (a: T, b: T, sortKey: string, sortOrder: "asc" | "desc") => number;
}

export interface UseDataTableReturn<T> {
  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Filter state
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  resetFilters: () => void;
  isFiltered: boolean;
  hasActiveFilters: boolean;

  // Sort state
  sortKey: string;
  sortOrder: "asc" | "desc";
  setSort: (key: string, order?: "asc" | "desc") => void;

  // Pagination state
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Computed data
  totalItems: number;
  totalPages: number;
  paginatedData: T[];
  filteredData: T[];
  startIndex: number;
  endIndex: number;
}

export function useDataTable<T>({
  data = [],
  defaultPageSize = 10,
  searchFields = [],
  initialFilters = {},
  filterPredicate,
  sortPredicate,
}: UseDataTableOptions<T>): UseDataTableReturn<T> {
  const [searchQuery, setSearchQueryState] = useState("");
  const [filters, setFiltersState] = useState<Record<string, string>>(initialFilters);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);

  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    setCurrentPage(1);
  };

  const setFilter = (key: string, value: string) => {
    setFiltersState((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQueryState("");
    setFiltersState(initialFilters);
    setCurrentPage(1);
  };

  const setSort = (key: string, order?: "asc" | "desc") => {
    if (sortKey === key && !order) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder(order ?? "asc");
    }
    setCurrentPage(1);
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  };

  const setPage = (page: number) => {
    setCurrentPage(page);
  };

  // Check if any filters are active
  const isFiltered = useMemo(() => {
    if (searchQuery.trim().length > 0) return true;
    for (const [key, val] of Object.entries(filters)) {
      const initialVal = initialFilters[key] ?? "ALL";
      if (val !== initialVal && val !== "ALL" && val !== "") {
        return true;
      }
    }
    return false;
  }, [searchQuery, filters, initialFilters]);

  // Filter and search
  const filteredData = useMemo(() => {
    let result = safeData;

    // Search query filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((item) => {
        if (!searchFields || searchFields.length === 0) {
          // Fallback: search all primitive values of the object
          return Object.values(item as any).some((val) =>
            val !== null && val !== undefined && String(val).toLowerCase().includes(query)
          );
        }

        return searchFields.some((field) => {
          if (typeof field === "function") {
            const val = field(item);
            return val !== null && val !== undefined && String(val).toLowerCase().includes(query);
          }
          const val = (item as any)[field];
          if (typeof val === "object" && val !== null) {
            // nested object search (e.g. customer.name)
            return Object.values(val).some((subVal) =>
              subVal !== null && subVal !== undefined && String(subVal).toLowerCase().includes(query)
            );
          }
          return val !== null && val !== undefined && String(val).toLowerCase().includes(query);
        });
      });
    }

    // Custom or default predicate filter
    if (filterPredicate) {
      result = result.filter((item) => filterPredicate(item, filters));
    } else {
      // Default filtering on direct object properties
      result = result.filter((item) => {
        for (const [key, filterVal] of Object.entries(filters)) {
          if (!filterVal || filterVal === "ALL") continue;
          const itemVal = (item as any)[key];
          if (typeof itemVal === "boolean") {
            const boolVal = filterVal === "true" || filterVal === "ACTIVE";
            if (itemVal !== boolVal) return false;
          } else if (itemVal !== undefined && String(itemVal) !== filterVal) {
            return false;
          }
        }
        return true;
      });
    }

    // Sort
    if (sortKey) {
      if (sortPredicate) {
        result = [...result].sort((a, b) => sortPredicate(a, b, sortKey, sortOrder));
      } else {
        result = [...result].sort((a, b) => {
          const valA = (a as any)[sortKey];
          const valB = (b as any)[sortKey];

          if (valA === valB) return 0;
          if (valA === null || valA === undefined) return 1;
          if (valB === null || valB === undefined) return -1;

          let comp = 0;
          if (typeof valA === "number" && typeof valB === "number") {
            comp = valA - valB;
          } else if (valA instanceof Date || !isNaN(Date.parse(valA))) {
            comp = new Date(valA).getTime() - new Date(valB).getTime();
          } else {
            comp = String(valA).localeCompare(String(valB));
          }

          return sortOrder === "asc" ? comp : -comp;
        });
      }
    }

    return result;
  }, [safeData, searchQuery, searchFields, filters, filterPredicate, sortKey, sortOrder, sortPredicate]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure current page is within safe bounds
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(validCurrentPage * pageSize, totalItems);

  const paginatedData = useMemo(() => {
    const start = (validCurrentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, validCurrentPage, pageSize]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    resetFilters,
    isFiltered,
    hasActiveFilters: isFiltered,
    sortKey,
    sortOrder,
    setSort,
    currentPage: validCurrentPage,
    pageSize,
    setPage,
    setCurrentPage: setPage,
    setPageSize,
    totalItems,
    totalPages,
    paginatedData,
    filteredData,
    startIndex,
    endIndex,
  };
}

