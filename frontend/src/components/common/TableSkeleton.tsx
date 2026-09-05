import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  // How many columns and rows to draw. Should roughly match the real
  // table that's about to load in, so the loading state doesn't jump
  // around once the real data arrives.
  columns: number;
  rows?: number;
}

// A loading placeholder shaped like an actual table (a header row plus a
// few body rows), instead of a few generic full-width bars. Used on every
// list page (accounts, products, users) while its data is loading.
export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex gap-4 border-b pb-3">
        {Array.from({ length: columns }).map((_, columnIndex) => (
          <Skeleton key={columnIndex} className="h-4 flex-1" />
        ))}
      </div>

      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <Skeleton key={columnIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
