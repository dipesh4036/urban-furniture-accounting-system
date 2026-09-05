import { Suspense } from "react";
import { BudgetReportView } from "./budget-report-view";

// useSearchParams() (used inside BudgetReportView to read/write ?period=)
// has to be wrapped in a Suspense boundary, or Next.js will bail the
// whole page out of static rendering.
export default function BudgetReportPage() {
  return (
    <Suspense>
      <BudgetReportView />
    </Suspense>
  );
}
