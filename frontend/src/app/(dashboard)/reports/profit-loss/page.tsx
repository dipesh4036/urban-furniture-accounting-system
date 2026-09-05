import { Suspense } from "react";
import { ProfitLossView } from "./profit-loss-view";

// useSearchParams() (used inside ProfitLossView to read/write ?from=&to=)
// has to be wrapped in a Suspense boundary, or Next.js will bail the
// whole page out of static rendering.
export default function ProfitLossPage() {
  return (
    <Suspense>
      <ProfitLossView />
    </Suspense>
  );
}
