import { Suspense } from "react";
import { ActivateAccountForm } from "./activate-account-form";

// useSearchParams() (used inside ActivateAccountForm to read ?token=)
// has to be wrapped in a Suspense boundary, or Next.js will bail the
// whole page out of static rendering. This file stays a plain server
// component so that boundary can exist here.
export default function ActivateAccountPage() {
  return (
    <Suspense>
      <ActivateAccountForm />
    </Suspense>
  );
}
