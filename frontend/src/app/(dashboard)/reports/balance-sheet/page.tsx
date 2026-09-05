import { Suspense } from "react";
import { BalanceSheetView } from "./balance-sheet-view";

// useSearchParams() (used inside BalanceSheetView to read/write ?asOf=)
// has to be wrapped in a Suspense boundary, or Next.js will bail the
// whole page out of static rendering. This file stays a plain server
// component so that boundary can exist here.
export default function BalanceSheetPage() {
  return (
    <Suspense>
      <BalanceSheetView />
    </Suspense>
  );
}
